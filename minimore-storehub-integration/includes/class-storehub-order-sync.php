<?php
/**
 * StoreHub Order Sync
 *
 * Pushes WooCommerce orders to StoreHub as Sale transactions.
 * Handles retries, cancellations, and idempotency.
 *
 * Key behaviours:
 *  - refId UUID is generated and saved BEFORE the first push attempt.
 *    StoreHub natively ignores duplicate refIds, so retries are safe.
 *  - _storehub_push_status tracks: pending → success | failed
 *  - Failed pushes are queued for up to MAX_RETRIES retries via Action Scheduler.
 *  - Cancellations only fire if _storehub_push_status === 'success'.
 *  - Cancel endpoint returns 404 if not found; handled gracefully.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class MSI_StoreHub_Order_Sync {

    const MAX_RETRIES    = 3;
    const RETRY_DELAY_S  = 300; // 5 minutes between retries

    public static function init(): void {
        // Primary hooks for order payment
        add_action( 'woocommerce_payment_complete',              array( __CLASS__, 'on_payment_complete' ) );
        add_action( 'woocommerce_order_status_processing',       array( __CLASS__, 'on_payment_complete' ) );

        // Cancellation
        add_action( 'woocommerce_order_status_cancelled',        array( __CLASS__, 'on_order_cancelled' ) );

        // Action Scheduler retry handler
        add_action( 'msi_order_push_retry',                      array( __CLASS__, 'retry_push' ) );
    }

    // ── Payment complete ──────────────────────────────────────────────────────

    /**
     * Triggered when payment is confirmed. Initialises the push if not already done.
     */
    public static function on_payment_complete( int $order_id ): void {
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        // Prevent double-push if both hooks fire for the same order
        $status = $order->get_meta( '_storehub_push_status' );
        // Any existing state means this order has already entered the StoreHub
        // workflow. Retries are owned by Action Scheduler and must not be reset
        // by another order-status hook.
        if ( ! empty( $status ) ) {
            return;
        }

        // Generate and persist refId BEFORE first push — ensures idempotency on retry
        $ref_id = $order->get_meta( '_storehub_ref_id' );
        if ( empty( $ref_id ) ) {
            $ref_id = self::generate_uuid();
            $order->update_meta_data( '_storehub_ref_id', $ref_id );
        }

        $order->update_meta_data( '_storehub_push_status', 'pending' );
        $order->update_meta_data( '_storehub_push_attempts', 0 );
        $order->save();

        self::push_order( $order_id );
    }

    // ── Push to StoreHub ──────────────────────────────────────────────────────

    /**
     * Build payload and POST to StoreHub /transactions.
     */
    public static function push_order( int $order_id ): void {
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        $ref_id   = $order->get_meta( '_storehub_ref_id' );
        $store_id = get_option( 'msi_store_id', '' );

        if ( empty( $store_id ) ) {
            self::mark_failed( $order, 'No StoreHub Online Store ID configured.' );
            return;
        }

        // Build line items
        $items           = array();
        $unmapped_items  = array();
        foreach ( $order->get_items() as $item ) {
            $product      = $item->get_product();
            $sh_product_id = $product ? $product->get_meta( '_storehub_product_id' ) : '';

            if ( empty( $sh_product_id ) ) {
                $unmapped_items[] = $item->get_name();
                $order->add_order_note(
                    sprintf( __( 'StoreHub: Line item "%s" has no _storehub_product_id.', 'msi' ), $item->get_name() )
                );
                continue;
            }

            $line_total    = (float) $item->get_total();
            $line_subtotal = (float) $item->get_subtotal();
            $line_tax      = (float) $item->get_total_tax();
            $line_discount = (float) ( $item->get_subtotal() - $item->get_total() );

            $items[] = array(
                'productId' => $sh_product_id,
                'quantity'  => (int) $item->get_quantity(),
                'total'     => round( $line_total + $line_tax, 2 ),
                'subTotal'  => round( $line_subtotal, 2 ),
                'tax'       => round( $line_tax, 2 ),
                'discount'  => round( max( 0, $line_discount ), 2 ),
                'unitPrice' => round( $product->get_price(), 2 ),
            );
        }

        if ( ! empty( $unmapped_items ) ) {
            self::mark_failed(
                $order,
                sprintf(
                    'Order was not pushed because %d line item(s) are not mapped to StoreHub: %s',
                    count( $unmapped_items ),
                    implode( ', ', $unmapped_items )
                )
            );
            return;
        }

        if ( empty( $items ) ) {
            self::mark_failed( $order, 'No StoreHub-mapped line items found on this order.' );
            return;
        }

        // Compute totals
        $subtotal       = (float) $order->get_subtotal();
        $tax            = (float) $order->get_total_tax();
        $discount       = (float) $order->get_discount_total();
        $total          = (float) $order->get_total();
        $rounded_amount = round( $total - ( $subtotal + $tax - $discount ), 2 );

        // Map WooCommerce payment method to StoreHub enum
        $payment_method = self::map_payment_method( $order->get_payment_method() );

        $payload = array(
            'refId'           => $ref_id,
            'invoiceNumber'   => (string) $order->get_order_number(),
            'storeId'         => $store_id,
            'transactionType' => 'Sale',
            'transactionTime' => $order->get_date_paid()
                ? $order->get_date_paid()->format( 'c' )
                : $order->get_date_created()->format( 'c' ),
            'paymentMethod'   => $payment_method,
            'total'           => round( $total, 2 ),
            'subTotal'        => round( $subtotal, 2 ),
            'tax'             => round( $tax, 2 ),
            'discount'        => round( $discount, 2 ),
            'roundedAmount'   => $rounded_amount,
            'comment'         => sprintf( 'WooCommerce Order #%s', $order->get_order_number() ),
            'items'           => $items,
        );

        $result = MSI_StoreHub_API::add_transaction( $payload );

        if ( is_wp_error( $result ) ) {
            $attempts = (int) $order->get_meta( '_storehub_push_attempts' ) + 1;
            $order->update_meta_data( '_storehub_push_attempts', $attempts );

            if ( $attempts < self::MAX_RETRIES ) {
                // Queue a retry
                $retry_args = array( $order_id );
                if ( function_exists( 'as_schedule_single_action' ) ) {
                    as_schedule_single_action(
                        time() + self::RETRY_DELAY_S,
                        'msi_order_push_retry',
                        $retry_args,
                        'msi'
                    );
                }
                $order->add_order_note( sprintf(
                    __( 'StoreHub push FAILED (attempt %d/%d): %s — Will retry in %d minutes.', 'msi' ),
                    $attempts,
                    self::MAX_RETRIES,
                    $result->get_error_message(),
                    self::RETRY_DELAY_S / 60
                ) );
                $order->update_meta_data( '_storehub_push_status', 'failed' );
            } else {
                self::mark_permanently_failed( $order, $result->get_error_message() );
            }
        } else {
            $order->update_meta_data( '_storehub_push_status', 'success' );
            $order->add_order_note( __( 'StoreHub: Transaction pushed successfully.', 'msi' ) );
        }

        $order->save();
    }

    // ── Retry handler ─────────────────────────────────────────────────────────

    public static function retry_push( int $order_id ): void {
        $order = wc_get_order( $order_id );
        if ( ! $order || $order->get_meta( '_storehub_push_status' ) === 'success' ) {
            return;
        }

        if ( (int) $order->get_meta( '_storehub_push_attempts' ) >= self::MAX_RETRIES ) {
            return;
        }

        self::push_order( $order_id );
    }

    // ── Cancellation ─────────────────────────────────────────────────────────

    public static function on_order_cancelled( int $order_id ): void {
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        $ref_id      = $order->get_meta( '_storehub_ref_id' );
        $push_status = $order->get_meta( '_storehub_push_status' );

        // Only cancel in StoreHub if the original push succeeded
        if ( $push_status !== 'success' || empty( $ref_id ) ) {
            $order->add_order_note( __( 'StoreHub: No cancellation sent — original push was never confirmed successful.', 'msi' ) );
            $order->save();
            return;
        }

        $result = MSI_StoreHub_API::cancel_transaction( $ref_id, array(
            'cancelledTime' => ( new DateTimeImmutable() )->format( 'c' ),
        ) );

        if ( is_wp_error( $result ) ) {
            $code = $result->get_error_code();
            if ( $code === 'not_found' ) {
                // 404 — transaction not in StoreHub, safe to ignore
                $order->add_order_note( __( 'StoreHub: Cancel skipped — transaction not found in StoreHub (404).', 'msi' ) );
            } else {
                $order->add_order_note( sprintf(
                    __( 'StoreHub: Cancel FAILED — %s. Please cancel manually in StoreHub BackOffice.', 'msi' ),
                    $result->get_error_message()
                ) );
            }
        } else {
            $order->add_order_note( __( 'StoreHub: Transaction cancelled successfully.', 'msi' ) );
        }

        $order->save();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Maps WooCommerce payment method slugs to StoreHub's Cash/CreditCard enum.
     */
    private static function map_payment_method( string $wc_method ): string {
        $credit_card_methods = array( 'stripe', 'paypal', 'billplz', 'mollie', 'ipay88', 'toyyibpay', 'senangpay' );

        foreach ( $credit_card_methods as $method ) {
            if ( strpos( $wc_method, $method ) !== false ) {
                return 'CreditCard';
            }
        }

        return 'Cash'; // Default: COD, BACS, Cheque, etc.
    }

    private static function mark_failed( WC_Order $order, string $reason ): void {
        $order->update_meta_data( '_storehub_push_status', 'failed' );
        $order->add_order_note( sprintf( __( 'StoreHub push FAILED: %s', 'msi' ), $reason ) );
        $order->save();
    }

    private static function mark_permanently_failed( WC_Order $order, string $reason ): void {
        $order->update_meta_data( '_storehub_push_status', 'failed' );
        $order->add_order_note( sprintf(
            __( 'StoreHub push permanently FAILED after %d attempts: %s — Manual action required.', 'msi' ),
            self::MAX_RETRIES,
            $reason
        ) );
        $order->save();

        // Email admin
        $admin_email = get_option( 'admin_email' );
        $subject     = sprintf( '[%s] StoreHub Order Push Failed — Order #%s', get_bloginfo( 'name' ), $order->get_order_number() );
        $message     = sprintf(
            "StoreHub push permanently failed for Order #%s after %d attempts.\n\nReason: %s\n\nEdit order: %s",
            $order->get_order_number(),
            self::MAX_RETRIES,
            $reason,
            get_edit_post_link( $order->get_id() )
        );
        wp_mail( $admin_email, $subject, $message );
    }

    /**
     * Generate a v4 UUID.
     */
    private static function generate_uuid(): string {
        $data = random_bytes( 16 );
        $data[6] = chr( ( ord( $data[6] ) & 0x0f ) | 0x40 );
        $data[8] = chr( ( ord( $data[8] ) & 0x3f ) | 0x80 );
        return vsprintf( '%s%s-%s-%s-%s-%s%s%s', str_split( bin2hex( $data ), 4 ) );
    }

    private static function log( string $message ): void {
        if ( function_exists( 'wc_get_logger' ) ) {
            wc_get_logger()->info( $message, array( 'source' => 'storehub-integration' ) );
        }
    }
}
