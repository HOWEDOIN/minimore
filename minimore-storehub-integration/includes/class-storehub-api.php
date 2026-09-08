<?php
/**
 * StoreHub API Client
 *
 * Handles all HTTP communication with the StoreHub REST API.
 * - Basic Auth via subdomain + API token
 * - Rate limiting: stays below 3 req/sec with micro-sleep throttle
 * - 429 handling: exponential backoff up to 3 retries
 * - test_connection(): used by settings page "Test Connection" button
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class MSI_StoreHub_API {

    const BASE_URL        = 'https://api.storehubhq.com';
    const MAX_RETRIES     = 3;
    const MIN_INTERVAL_MS = 350; // ~2.8 req/sec — safely under 3/sec limit

    /** Timestamp (float, microseconds) of the last request. */
    private static float $last_request_time = 0.0;

    // ── Public API methods ────────────────────────────────────────────────────

    /**
     * Test the connection by fetching /stores.
     *
     * @return array{ success: bool, stores?: array, error?: string }
     */
    public static function test_connection(): array {
        $result = self::get_stores();
        if ( is_wp_error( $result ) ) {
            return array( 'success' => false, 'error' => $result->get_error_message() );
        }
        return array( 'success' => true, 'stores' => $result );
    }

    /**
     * GET /products — returns full product array (no filters available in API).
     *
     * @return array|WP_Error
     */
    public static function get_products() {
        return self::get_collection( '/products', 'products', array( 'id' ) );
    }

    /**
     * GET /inventory/<storeId>
     *
     * @param string $store_id
     * @return array|WP_Error
     */
    public static function get_inventory( string $store_id ) {
        $inventory = self::get( '/inventory/' . rawurlencode( $store_id ) );

        if ( is_wp_error( $inventory ) ) {
            return $inventory;
        }

        if ( ! self::is_list( $inventory ) ) {
            return new WP_Error(
                'msi_invalid_inventory_response',
                'StoreHub inventory response was not a JSON list. Stock was not changed.'
            );
        }

        foreach ( $inventory as $index => $item ) {
            if (
                ! is_array( $item ) ||
                empty( $item['productId'] ) ||
                ! array_key_exists( 'quantityOnHand', $item ) ||
                ! is_numeric( $item['quantityOnHand'] )
            ) {
                return new WP_Error(
                    'msi_invalid_inventory_item',
                    sprintf( 'StoreHub inventory item %d was malformed. Stock was not changed.', $index )
                );
            }
        }

        return $inventory;
    }

    /**
     * GET /stores
     *
     * @return array|WP_Error
     */
    public static function get_stores() {
        return self::get_collection( '/stores', 'stores', array( 'id', 'name' ) );
    }

    /**
     * POST /transactions — add a sale transaction.
     * StoreHub natively ignores duplicate refIds and returns the existing transaction.
     *
     * @param array $payload
     * @return array|WP_Error
     */
    public static function add_transaction( array $payload ) {
        return self::post( '/transactions', $payload );
    }

    /**
     * POST /transactions/<refId>/cancel
     *
     * @param string $ref_id
     * @param array  $payload  Must include 'cancelledTime'.
     * @return array|WP_Error  Returns WP_Error with code 'not_found' on HTTP 404.
     */
    public static function cancel_transaction( string $ref_id, array $payload ) {
        return self::post( '/transactions/' . rawurlencode( $ref_id ) . '/cancel', $payload );
    }

    // ── Private HTTP helpers ──────────────────────────────────────────────────

    private static function get( string $endpoint ) {
        return self::request( 'GET', $endpoint );
    }

    private static function post( string $endpoint, array $body ) {
        return self::request( 'POST', $endpoint, $body );
    }

    /**
     * Core request method with throttle + exponential backoff on 429.
     */
    private static function request( string $method, string $endpoint, ?array $body = null ) {
        $subdomain = get_option( 'msi_subdomain', '' );
        $token     = get_option( 'msi_api_token', '' );

        if ( empty( $subdomain ) || empty( $token ) ) {
            return new WP_Error( 'msi_no_credentials', 'StoreHub credentials are not configured.' );
        }

        $url  = self::BASE_URL . $endpoint;
        $args = array(
            'method'  => $method,
            'headers' => array(
                'Authorization' => 'Basic ' . base64_encode( $subdomain . ':' . $token ),
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ),
            'timeout' => 20,
        );

        if ( $body !== null ) {
            $args['body'] = wp_json_encode( $body );
        }

        $attempt      = 0;
        $backoff_secs = 2;

        while ( $attempt <= self::MAX_RETRIES ) {
            self::throttle();

            $response = wp_remote_request( $url, $args );
            self::$last_request_time = microtime( true );

            if ( is_wp_error( $response ) ) {
                // Network-level error — don't retry, surface immediately
                return $response;
            }

            $status = wp_remote_retrieve_response_code( $response );
            $raw    = wp_remote_retrieve_body( $response );
            $data   = json_decode( $raw, true );

            if ( $status === 404 ) {
                return new WP_Error( 'not_found', 'StoreHub resource not found.', array( 'status' => 404 ) );
            }

            if ( $status === 429 ) {
                // Rate limited — back off and retry
                if ( $attempt < self::MAX_RETRIES ) {
                    sleep( $backoff_secs );
                    $backoff_secs *= 2;
                    $attempt++;
                    continue;
                }
                return new WP_Error( 'rate_limited', 'StoreHub API rate limit exceeded after retries.' );
            }

            if ( $status >= 200 && $status < 300 ) {
                // GET endpoints in this integration always return JSON. Treating a
                // malformed/empty response as [] can incorrectly zero all stock.
                if ( trim( $raw ) === '' ) {
                    if ( $method === 'GET' ) {
                        return new WP_Error(
                            'msi_empty_response',
                            'StoreHub returned an empty response. No data was changed.'
                        );
                    }
                    return array();
                }

                if ( json_last_error() !== JSON_ERROR_NONE || ! is_array( $data ) ) {
                    return new WP_Error(
                        'msi_invalid_json',
                        'StoreHub returned invalid JSON. No data was changed.',
                        array( 'status' => $status )
                    );
                }

                return $data;
            }

            // Other HTTP errors
            $message = isset( $data['message'] ) ? $data['message'] : "HTTP {$status}";
            return new WP_Error( 'storehub_api_error', $message, array( 'status' => $status, 'body' => $raw ) );
        }

        return new WP_Error( 'msi_max_retries', 'Max retries reached for StoreHub API.' );
    }

    /**
     * Sleep just enough to stay under the 3 req/sec rate limit.
     */
    private static function throttle(): void {
        $elapsed_ms = ( microtime( true ) - self::$last_request_time ) * 1000;
        if ( $elapsed_ms < self::MIN_INTERVAL_MS ) {
            usleep( (int) ( ( self::MIN_INTERVAL_MS - $elapsed_ms ) * 1000 ) );
        }
    }

    /**
     * PHP 7.4-compatible equivalent of array_is_list().
     */
    private static function is_list( array $value ): bool {
        $expected_key = 0;
        foreach ( $value as $key => $_item ) {
            if ( $key !== $expected_key ) {
                return false;
            }
            $expected_key++;
        }
        return true;
    }

    /**
     * Validate API endpoints that must return a JSON list of records.
     *
     * @param string[] $required_fields
     * @return array|WP_Error
     */
    private static function get_collection( string $endpoint, string $label, array $required_fields ) {
        $result = self::get( $endpoint );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        if ( ! self::is_list( $result ) ) {
            return new WP_Error(
                'msi_invalid_' . $label . '_response',
                sprintf( 'StoreHub %s response was not a JSON list.', $label )
            );
        }

        foreach ( $result as $index => $record ) {
            if ( ! is_array( $record ) ) {
                return new WP_Error(
                    'msi_invalid_' . $label . '_record',
                    sprintf( 'StoreHub %s record %d was malformed.', $label, $index )
                );
            }

            foreach ( $required_fields as $field ) {
                if ( ! array_key_exists( $field, $record ) || $record[ $field ] === '' || $record[ $field ] === null ) {
                    return new WP_Error(
                        'msi_invalid_' . $label . '_record',
                        sprintf( 'StoreHub %s record %d was missing %s.', $label, $index, $field )
                    );
                }
            }
        }

        return $result;
    }
}
