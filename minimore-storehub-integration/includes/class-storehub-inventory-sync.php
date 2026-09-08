<?php
/**
 * StoreHub Inventory Sync
 *
 * Scheduled background sync: pulls GET /inventory/<storeId> (always full fetch —
 * StoreHub API has no delta/changed-since filtering) and updates WooCommerce stock.
 *
 * Performance strategy:
 *  1. A single AS action (msi_inventory_sync) fetches the full inventory array.
 *  2. The array is split into batches of BATCH_SIZE and each batch is dispatched
 *     as a separate AS action (msi_inventory_sync_batch) to avoid PHP timeouts.
 *  3. Only products whose stock quantity has changed are written to the DB.
 *
 * Inventory is pulled from the configured Online Store ID only, keeping online
 * and in-store stock completely separate.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class MSI_StoreHub_Inventory_Sync {

    const BATCH_SIZE = 50;
    const ACTION_GROUP = 'msi';
    const GENERATION_OPTION = 'msi_inventory_sync_generation';
    const RUN_LOCK = 'msi_inventory_sync_run_lock';

    public static function init(): void {
        add_action( 'msi_inventory_sync',       array( __CLASS__, 'run' ) );
        add_action( 'msi_inventory_sync_now',   array( __CLASS__, 'run' ) );
        add_action( 'msi_inventory_sync_batch', array( __CLASS__, 'process_batch' ), 10, 3 );
        add_action( 'init',                     array( __CLASS__, 'ensure_scheduled' ), 20 );
        add_action( 'admin_post_msi_run_inventory_sync', array( __CLASS__, 'handle_manual_sync' ) );
    }

    // ── Scheduling helpers ────────────────────────────────────────────────────

    /**
     * Schedule a recurring sync. Called on plugin activation.
     */
    public static function schedule(): void {
        if ( ! function_exists( 'as_has_scheduled_action' ) || ! function_exists( 'as_schedule_recurring_action' ) ) {
            self::log( 'Inventory schedule unavailable: Action Scheduler is not loaded.', 'error' );
            return;
        }

        if ( ! as_has_scheduled_action( 'msi_inventory_sync' ) ) {
            $interval = (int) get_option( 'msi_sync_interval', 3600 );
            if ( $interval < 60 ) {
                $interval = 3600;
            }
            as_schedule_recurring_action( time() + 60, $interval, 'msi_inventory_sync', array(), self::ACTION_GROUP );
        }
    }

    /**
     * Re-create a missing recurring action after plugin updates or queue cleanup.
     */
    public static function ensure_scheduled(): void {
        self::schedule();
    }

    /**
     * Cancel and re-create the recurring action (called when settings are saved).
     */
    public static function reschedule(): void {
        if ( function_exists( 'as_unschedule_all_actions' ) ) {
            as_unschedule_all_actions( 'msi_inventory_sync' );
        }
        self::schedule();
    }

    /**
     * Queue an immediate pull without disturbing the recurring schedule.
     */
    public static function enqueue_immediate(): bool {
        if ( ! function_exists( 'as_schedule_single_action' ) ) {
            self::log( 'Immediate inventory sync unavailable: Action Scheduler is not loaded.', 'error' );
            return false;
        }

        if (
            function_exists( 'as_has_scheduled_action' ) &&
            as_has_scheduled_action( 'msi_inventory_sync_now', array(), self::ACTION_GROUP )
        ) {
            return true;
        }

        $action_id = as_schedule_single_action( time(), 'msi_inventory_sync_now', array(), self::ACTION_GROUP, true );
        return ! empty( $action_id );
    }

    /**
     * Invalidate queued batches, for example when the selected store changes.
     */
    public static function invalidate_pending_batches(): void {
        update_option( self::GENERATION_OPTION, wp_generate_uuid4(), false );
    }

    public static function handle_manual_sync(): void {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( 'Unauthorised.' );
        }

        check_admin_referer( 'msi_inventory_sync_now', 'msi_inventory_nonce' );
        $queued = self::enqueue_immediate();

        wp_safe_redirect( add_query_arg( array(
            'page'             => 'msi-catalog-sync',
            'inventory_queued' => $queued ? '1' : '0',
        ), admin_url( 'admin.php' ) ) );
        exit;
    }

    // ── Main sync action ──────────────────────────────────────────────────────

    /**
     * Fetch full inventory from StoreHub and dispatch batch jobs.
     * Triggered by the msi_inventory_sync AS action.
     */
    public static function run(): void {
        if ( get_transient( self::RUN_LOCK ) ) {
            self::log( 'Inventory sync skipped: another inventory pull is already running.', 'warning' );
            return;
        }

        set_transient( self::RUN_LOCK, '1', 10 * MINUTE_IN_SECONDS );

        $store_id = get_option( 'msi_store_id', '' );

        if ( empty( $store_id ) ) {
            self::log( 'Inventory sync skipped: no Online Store ID configured.' );
            delete_transient( self::RUN_LOCK );
            return;
        }

        $inventory = MSI_StoreHub_API::get_inventory( $store_id );

        if ( is_wp_error( $inventory ) ) {
            update_option( 'msi_inventory_last_error', $inventory->get_error_message(), false );
            self::log( 'Inventory fetch error: ' . $inventory->get_error_message(), 'error' );
            delete_transient( self::RUN_LOCK );
            return;
        }

        // An empty list may be legitimate, but it is also the most damaging
        // possible transient API failure because StoreHub omits zero-stock
        // products. Require two consecutive valid empty responses before
        // zeroing every mapped product.
        if ( empty( $inventory ) ) {
            $empty_confirmations = (int) get_option( 'msi_inventory_empty_confirmations', 0 ) + 1;
            update_option( 'msi_inventory_empty_confirmations', $empty_confirmations, false );

            if ( $empty_confirmations < 2 ) {
                $message = 'StoreHub returned an empty inventory list. Waiting for one confirming pull before zeroing all stock.';
                update_option( 'msi_inventory_last_error', $message, false );
                self::log( $message, 'warning' );
                delete_transient( self::RUN_LOCK );
                return;
            }
        } else {
            delete_option( 'msi_inventory_empty_confirmations' );
        }

        $generation = wp_generate_uuid4();
        update_option( self::GENERATION_OPTION, $generation, false );
        delete_option( 'msi_inventory_last_error' );

        // NOTE: StoreHub omits products with 0 quantity from the response entirely.
        // $inventory may be an empty array if nothing is in stock — that is valid.
        // We must NOT bail out here; we still need to zero-out all mapped products.

        // Build a set of StoreHub product IDs that have stock in the online store
        $in_stock_sh_ids = array();
        foreach ( $inventory as $item ) {
            if ( ! empty( $item['productId'] ) && isset( $item['quantityOnHand'] ) && $item['quantityOnHand'] > 0 ) {
                $in_stock_sh_ids[] = $item['productId'];
            }
        }

        // 1. Process products that ARE in the response (update to their actual qty)
        if ( ! empty( $inventory ) ) {
            $batches = array_chunk( $inventory, self::BATCH_SIZE );
            foreach ( $batches as $batch ) {
                as_schedule_single_action(
                    time(),
                    'msi_inventory_sync_batch',
                    array( $batch, $generation, (string) $store_id ),
                    self::ACTION_GROUP
                );
            }
        }

        // 2. Zero-out all mapped WooCommerce products NOT present in the response.
        //    These products have 0 stock in the online store (StoreHub just omits them).
        $zeroed = self::zero_out_missing( $in_stock_sh_ids, $generation );

        update_option( 'msi_inventory_last_sync', current_time( 'mysql' ), false );
        delete_transient( self::RUN_LOCK );

        self::log( sprintf(
            'Inventory sync queued: %d records, %d in-stock IDs, %d products zeroed, generation %s.',
            count( $inventory ),
            count( $in_stock_sh_ids ),
            $zeroed,
            $generation
        ) );
    }

    /**
     * Find all WooCommerce products mapped to StoreHub but absent from the
     * inventory response, and set their stock to 0 / outofstock.
     *
     * @param array $in_stock_sh_ids  StoreHub product IDs that have stock (from response).
     */
    private static function zero_out_missing( array $in_stock_sh_ids, string $generation ): int {
        // Get all WooCommerce products that have a StoreHub mapping
        $all_mapped = get_posts( array(
            'post_type'   => array( 'product', 'product_variation' ),
            'meta_key'    => '_storehub_product_id',
            'fields'      => 'ids',
            'numberposts' => -1, // all
            'post_status' => 'any',
        ) );

        $in_stock_lookup = array_fill_keys( array_map( 'strval', $in_stock_sh_ids ), true );
        $zeroed = 0;

        foreach ( $all_mapped as $wc_product_id ) {
            if ( ! self::is_current_generation( $generation ) ) {
                self::log( 'Stopped zero-out pass because a newer inventory sync started.', 'warning' );
                return $zeroed;
            }

            $sh_id = (string) get_post_meta( $wc_product_id, '_storehub_product_id', true );

            // Do not force stock management for products StoreHub explicitly says
            // are not stock-tracked. Missing legacy metadata remains supported.
            if ( get_post_meta( $wc_product_id, '_storehub_track_stock', true ) === 'no' ) {
                continue;
            }

            // Skip if this product was present in the stock response
            if ( isset( $in_stock_lookup[ $sh_id ] ) ) {
                continue;
            }

            // This product has 0 stock in the online store — ensure WooCommerce reflects that
            $product = wc_get_product( $wc_product_id );
            if ( ! $product ) {
                continue;
            }

            if ( ! $product->get_manage_stock() ) {
                $product->set_manage_stock( true );
                $product->save();
            }

            if ( (int) $product->get_stock_quantity() !== 0 ) {
                wc_update_product_stock( $product, 0, 'set' );
                $zeroed++;
            }

            if ( $product->get_stock_status() !== 'outofstock' ) {
                wc_update_product_stock_status( $wc_product_id, 'outofstock' );
            }
        }

        return $zeroed;
    }

    // ── Batch processor ───────────────────────────────────────────────────────

    /**
     * Process one batch of StoreHub stock records.
     * Only writes to DB when the stock quantity has actually changed.
     *
     * @param array $batch  Array of { productId, quantityOnHand, ... }
     */
    public static function process_batch( array $batch, string $generation = '', string $store_id = '' ): void {
        if ( ! self::is_current_batch( $generation, $store_id ) ) {
            self::log( 'Skipped a stale inventory batch.', 'warning' );
            return;
        }

        $updated  = 0;
        $unmapped = 0;

        foreach ( $batch as $stock_item ) {
            if ( ! self::is_current_batch( $generation, $store_id ) ) {
                self::log( 'Stopped a stale inventory batch while processing.', 'warning' );
                return;
            }

            $sh_product_id = $stock_item['productId']      ?? '';
            $qty_on_hand   = $stock_item['quantityOnHand'] ?? null;

            if ( empty( $sh_product_id ) || $qty_on_hand === null ) {
                continue;
            }

            // Find WooCommerce product mapped to this StoreHub ID
            $wc_posts = get_posts( array(
                'post_type'  => array( 'product', 'product_variation' ),
                'meta_key'   => '_storehub_product_id',
                'meta_value' => $sh_product_id,
                'fields'     => 'ids',
                'numberposts'=> 1,
                'post_status'=> 'any',
            ) );

            if ( empty( $wc_posts ) ) {
                $unmapped++;
                continue; // Not yet mapped — skip
            }

            $wc_product_id = $wc_posts[0];
            $product       = wc_get_product( $wc_product_id );

            if ( ! $product ) {
                continue;
            }

            if ( get_post_meta( $wc_product_id, '_storehub_track_stock', true ) === 'no' ) {
                continue;
            }

            $current_stock  = (int) $product->get_stock_quantity();
            $new_stock      = max( 0, (int) $qty_on_hand );
            $correct_status = $new_stock > 0 ? 'instock' : 'outofstock';

            // Ensure manage_stock is on — save first if it wasn't already
            if ( ! $product->get_manage_stock() ) {
                $product->set_manage_stock( true );
                $product->save();
            }

            // Always explicitly set stock_status in case it is stale
            // (WooCommerce does not auto-recalculate status on programmatic qty set)
            if ( $current_stock !== $new_stock ) {
                // wc_update_product_stock handles qty + fires woocommerce_product_set_stock hook
                wc_update_product_stock( $product, $new_stock, 'set' );
                $updated++;
            }

            // Correct the stock_status independently — covers cases where
            // qty was already right but status was left stale as 'outofstock'
            if ( $product->get_stock_status() !== $correct_status ) {
                wc_update_product_stock_status( $wc_product_id, $correct_status );
            }
        }

        self::log( sprintf(
            'Inventory batch complete: %d records, %d quantities updated, %d unmapped StoreHub IDs.',
            count( $batch ),
            $updated,
            $unmapped
        ) );
    }

    private static function is_current_generation( string $generation ): bool {
        return $generation !== '' && hash_equals(
            (string) get_option( self::GENERATION_OPTION, '' ),
            $generation
        );
    }

    private static function is_current_batch( string $generation, string $store_id ): bool {
        return self::is_current_generation( $generation ) &&
            $store_id !== '' &&
            hash_equals( (string) get_option( 'msi_store_id', '' ), $store_id );
    }

    // ── Logging helper ────────────────────────────────────────────────────────

    private static function log( string $message, string $level = 'info' ): void {
        if ( function_exists( 'wc_get_logger' ) ) {
            $logger = wc_get_logger();
            if ( method_exists( $logger, $level ) ) {
                $logger->{$level}( $message, array( 'source' => 'storehub-integration' ) );
            } else {
                $logger->info( $message, array( 'source' => 'storehub-integration' ) );
            }
        }
    }
}
