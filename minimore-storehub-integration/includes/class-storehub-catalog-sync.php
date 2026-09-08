<?php
/**
 * StoreHub Catalog Sync
 *
 * Provides a WP Admin page to pull products from StoreHub and map them
 * to existing WooCommerce products (by SKU) or create new ones.
 * Stores the StoreHub product ID in `_storehub_product_id` order meta.
 *
 * NOTE: GET /products accepts no query parameters (API limitation).
 * This is a one-time / on-demand admin action, not a scheduled task.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class MSI_StoreHub_Catalog_Sync {

    public static function init(): void {
        add_action( 'admin_menu', array( __CLASS__, 'add_admin_page' ) );
        add_action( 'admin_post_msi_run_catalog_sync', array( __CLASS__, 'handle_sync' ) );
    }

    // ── Admin menu ────────────────────────────────────────────────────────────

    public static function add_admin_page(): void {
        add_submenu_page(
            'woocommerce',
            __( 'StoreHub Catalog Sync', 'msi' ),
            __( 'StoreHub Catalog', 'msi' ),
            'manage_woocommerce',
            'msi-catalog-sync',
            array( __CLASS__, 'render_page' )
        );
    }

    // ── Admin page UI ─────────────────────────────────────────────────────────

    public static function render_page(): void {
        $last_sync           = get_option( 'msi_catalog_last_sync', null );
        $inventory_last_sync = get_option( 'msi_inventory_last_sync', null );
        $inventory_error     = get_option( 'msi_inventory_last_error', '' );
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'StoreHub Catalog Sync', 'msi' ); ?></h1>
            <p><?php esc_html_e( 'Pulls the full product list from StoreHub and maps each product to WooCommerce by SKU. Products that do not exist in WooCommerce will be created as drafts for your review.', 'msi' ); ?></p>

            <?php if ( isset( $_GET['synced'] ) ) : ?>
                <div class="notice notice-success is-dismissible">
                    <p>
                        <?php
                        printf(
                            esc_html__( 'Sync complete. %d products matched, %d created, %d skipped (no SKU).', 'msi' ),
                            absint( $_GET['matched'] ?? 0 ),
                            absint( $_GET['created'] ?? 0 ),
                            absint( $_GET['skipped'] ?? 0 )
                        );
                        ?>
                    </p>
                </div>
            <?php elseif ( isset( $_GET['sync_error'] ) ) : ?>
                <div class="notice notice-error is-dismissible">
                    <p><?php echo esc_html( urldecode( $_GET['sync_error'] ) ); ?></p>
                </div>
            <?php endif; ?>

            <?php if ( isset( $_GET['inventory_queued'] ) ) : ?>
                <?php if ( $_GET['inventory_queued'] === '1' ) : ?>
                    <div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Inventory sync queued.', 'msi' ); ?></p></div>
                <?php else : ?>
                    <div class="notice notice-error is-dismissible"><p><?php esc_html_e( 'Inventory sync could not be queued. Check that WooCommerce Action Scheduler is available.', 'msi' ); ?></p></div>
                <?php endif; ?>
            <?php endif; ?>

            <?php if ( $last_sync ) : ?>
                <p><em><?php printf( esc_html__( 'Last synced: %s', 'msi' ), esc_html( $last_sync ) ); ?></em></p>
            <?php endif; ?>

            <?php if ( $inventory_last_sync ) : ?>
                <p><em><?php printf( esc_html__( 'Last inventory pull: %s', 'msi' ), esc_html( $inventory_last_sync ) ); ?></em></p>
            <?php endif; ?>

            <?php if ( $inventory_error ) : ?>
                <div class="notice notice-error"><p><?php echo esc_html( $inventory_error ); ?></p></div>
            <?php endif; ?>

            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                <?php wp_nonce_field( 'msi_catalog_sync', 'msi_catalog_nonce' ); ?>
                <input type="hidden" name="action" value="msi_run_catalog_sync">
                <?php submit_button( __( 'Pull Products from StoreHub', 'msi' ), 'primary', 'submit', false ); ?>
            </form>

            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top:12px;">
                <?php wp_nonce_field( 'msi_inventory_sync_now', 'msi_inventory_nonce' ); ?>
                <input type="hidden" name="action" value="msi_run_inventory_sync">
                <?php submit_button( __( 'Sync Inventory Now', 'msi' ), 'secondary', 'submit', false ); ?>
            </form>
        </div>
        <?php
    }

    // ── Sync handler ──────────────────────────────────────────────────────────

    public static function handle_sync(): void {
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( 'Unauthorised.' );
        }

        check_admin_referer( 'msi_catalog_sync', 'msi_catalog_nonce' );

        $products = MSI_StoreHub_API::get_products();

        if ( is_wp_error( $products ) ) {
            $redirect = add_query_arg( array(
                'page'       => 'msi-catalog-sync',
                'sync_error' => rawurlencode( $products->get_error_message() ),
            ), admin_url( 'admin.php' ) );
            wp_redirect( $redirect );
            exit;
        }

        $matched = 0;
        $created = 0;
        $skipped = 0;

        foreach ( $products as $sh_product ) {
            $sh_id  = $sh_product['id']  ?? '';
            $sku    = trim( (string) ( $sh_product['sku'] ?? '' ) );
            $name   = $sh_product['name'] ?? 'Unnamed Product';
            $tracks_stock = ! empty( $sh_product['trackStockLevel'] );

            if ( empty( $sh_id ) ) {
                continue;
            }

            if ( empty( $sku ) ) {
                $skipped++;
                continue;
            }

            // Try to find existing WooCommerce product by SKU
            $wc_product_id = wc_get_product_id_by_sku( $sku );

            if ( $wc_product_id ) {
                // Map existing product
                update_post_meta( $wc_product_id, '_storehub_product_id', sanitize_text_field( $sh_id ) );
                update_post_meta( $wc_product_id, '_storehub_track_stock', $tracks_stock ? 'yes' : 'no' );
                $matched++;
            } else {
                // Create a new draft WooCommerce product
                $wc_product = new WC_Product_Simple();
                $wc_product->set_name( sanitize_text_field( $name ) );
                $wc_product->set_sku( sanitize_text_field( $sku ) );
                $wc_product->set_status( 'draft' );

                if ( isset( $sh_product['unitPrice'] ) ) {
                    $wc_product->set_regular_price( (string) $sh_product['unitPrice'] );
                }

                if ( $tracks_stock ) {
                    $wc_product->set_manage_stock( true );
                }

                $new_id = $wc_product->save();

                if ( $new_id ) {
                    update_post_meta( $new_id, '_storehub_product_id', sanitize_text_field( $sh_id ) );
                    update_post_meta( $new_id, '_storehub_track_stock', $tracks_stock ? 'yes' : 'no' );
                    $created++;
                }
            }
        }

        update_option( 'msi_catalog_last_sync', current_time( 'Y-m-d H:i:s' ) );
        $inventory_queued = MSI_StoreHub_Inventory_Sync::enqueue_immediate();

        $redirect = add_query_arg( array(
            'page'    => 'msi-catalog-sync',
            'synced'  => '1',
            'matched' => $matched,
            'created' => $created,
            'skipped' => $skipped,
            'inventory_queued' => $inventory_queued ? '1' : '0',
        ), admin_url( 'admin.php' ) );
        wp_safe_redirect( $redirect );
        exit;
    }
}
