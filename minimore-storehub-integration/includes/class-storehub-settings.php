<?php
/**
 * StoreHub Settings
 *
 * Registers a settings tab under WooCommerce → Settings → StoreHub Integration.
 * Fields: Subdomain, API Token, Online Store ID (dropdown from live API), Sync Interval.
 * Includes an AJAX "Test Connection" button with nonce protection.
 *
 * Security note: The API token is stored in wp_options (WordPress salted serialisation).
 * Anyone with direct DB access can read it. Restrict DB access accordingly.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class MSI_StoreHub_Settings {

    public static function init(): void {
        // WooCommerce settings tab
        add_filter( 'woocommerce_settings_tabs_array',       array( __CLASS__, 'add_settings_tab' ), 50 );
        add_action( 'woocommerce_settings_tabs_storehub',    array( __CLASS__, 'output' ) );
        add_action( 'woocommerce_update_options_storehub',   array( __CLASS__, 'save' ) );
        add_action( 'woocommerce_admin_field_storehub_store_select', array( __CLASS__, 'render_store_select' ) );

        // Enqueue admin JS for Test Connection + Store dropdown
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_scripts' ) );

        // AJAX handlers
        add_action( 'wp_ajax_msi_test_connection',  array( __CLASS__, 'ajax_test_connection' ) );
        add_action( 'wp_ajax_msi_fetch_stores',     array( __CLASS__, 'ajax_fetch_stores' ) );
    }

    // ── Settings tab ─────────────────────────────────────────────────────────

    public static function add_settings_tab( array $tabs ): array {
        $tabs['storehub'] = __( 'StoreHub Integration', 'msi' );
        return $tabs;
    }

    public static function output(): void {
        WC_Admin_Settings::output_fields( self::get_settings() );
    }

    public static function save(): void {
        WC_Admin_Settings::save_fields( self::get_settings() );
        // Re-schedule inventory sync when interval changes
        MSI_StoreHub_Inventory_Sync::reschedule();
        MSI_StoreHub_Inventory_Sync::invalidate_pending_batches();
        MSI_StoreHub_Inventory_Sync::enqueue_immediate();
    }

    // ── Settings field definitions ────────────────────────────────────────────

    private static function get_settings(): array {
        $interval_options = array(
            '60'    => __( 'Every 1 minute', 'msi' ),
            '300'   => __( 'Every 5 minutes', 'msi' ),
            '900'   => __( 'Every 15 minutes', 'msi' ),
            '1800'  => __( 'Every 30 minutes', 'msi' ),
            '3600'  => __( 'Hourly', 'msi' ),
            '21600' => __( 'Every 6 hours', 'msi' ),
            '86400' => __( 'Daily', 'msi' ),
        );

        return array(
            array(
                'title' => __( 'StoreHub Integration Settings', 'msi' ),
                'type'  => 'title',
                'id'    => 'msi_settings_section',
            ),
            array(
                'title'    => __( 'Subdomain', 'msi' ),
                'desc'     => __( 'Your StoreHub back-office subdomain (e.g. <code>myshop</code> from <code>myshop.storehubhq.com</code>).', 'msi' ),
                'id'       => 'msi_subdomain',
                'type'     => 'text',
                'desc_tip' => false,
                'default'  => '',
            ),
            array(
                'title'    => __( 'API Token', 'msi' ),
                'desc'     => __( 'Your StoreHub API token. Keep this secret.', 'msi' ),
                'id'       => 'msi_api_token',
                'type'     => 'password',
                'default'  => '',
            ),
            array(
                'title' => __( 'Test Connection', 'msi' ),
                'type'  => 'storehub_store_select',
                'id'    => 'msi_store_id',
            ),
            array(
                'title'   => __( 'Inventory Sync Interval', 'msi' ),
                'desc'    => __( 'How often WooCommerce pulls current stock from your StoreHub Online Store.', 'msi' ),
                'id'      => 'msi_sync_interval',
                'type'    => 'select',
                'options' => $interval_options,
                'default' => '3600',
            ),
            array(
                'type' => 'sectionend',
                'id'   => 'msi_settings_section',
            ),
        );
    }

    // ── Custom field: Store selector + Test Connection button ─────────────────

    public static function render_store_select( array $value ): void {
        $store_id     = get_option( 'msi_store_id', '' );
        $field_id     = esc_attr( $value['id'] );
        ?>
        <tr valign="top">
            <th scope="row" class="titledesc">
                <label for="<?php echo $field_id; ?>"><?php esc_html_e( 'Online Store', 'msi' ); ?></label>
            </th>
            <td class="forminp">
                <button type="button" id="msi-test-btn" class="button">
                    <?php esc_html_e( 'Test Connection &amp; Load Stores', 'msi' ); ?>
                </button>
                <span id="msi-test-result" style="margin-left:10px;"></span>
                <br><br>
                <select id="<?php echo $field_id; ?>" name="<?php echo $field_id; ?>" style="min-width:300px;">
                    <?php if ( $store_id ) : ?>
                        <option value="<?php echo esc_attr( $store_id ); ?>" selected>
                            <?php echo esc_html( get_option( 'msi_store_name', $store_id ) ); ?>
                        </option>
                    <?php else : ?>
                        <option value=""><?php esc_html_e( '— Click "Test Connection" to load stores —', 'msi' ); ?></option>
                    <?php endif; ?>
                </select>
                <p class="description">
                    <?php esc_html_e( 'Select your dedicated "Online Store" in StoreHub. This keeps online and in-store inventory separate.', 'msi' ); ?>
                </p>
            </td>
        </tr>
        <?php
    }

    // ── Admin JS ──────────────────────────────────────────────────────────────

    public static function enqueue_admin_scripts( string $hook ): void {
        // Only load on our WooCommerce settings tab
        if ( $hook !== 'woocommerce_page_wc-settings' ) {
            return;
        }
        if ( ! isset( $_GET['tab'] ) || $_GET['tab'] !== 'storehub' ) {
            return;
        }

        wp_enqueue_script(
            'msi-admin',
            MSI_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery' ),
            MSI_VERSION,
            true
        );

        wp_localize_script( 'msi-admin', 'msiAdmin', array(
            'ajax_url'   => admin_url( 'admin-ajax.php' ),
            'nonce'      => wp_create_nonce( 'msi_admin_nonce' ),
            'store_id'   => get_option( 'msi_store_id', '' ),
            'store_name' => get_option( 'msi_store_name', '' ),
        ) );
    }

    // ── AJAX: Test Connection ─────────────────────────────────────────────────

    public static function ajax_test_connection(): void {
        check_ajax_referer( 'msi_admin_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( 'Unauthorised.' );
        }

        // Use submitted credentials so the user can test before saving. Restore
        // the previous working credentials if the test fails.
        $old_subdomain = get_option( 'msi_subdomain', '' );
        $old_token     = get_option( 'msi_api_token', '' );
        update_option( 'msi_subdomain', sanitize_text_field( wp_unslash( $_POST['subdomain'] ?? '' ) ) );
        update_option( 'msi_api_token',  sanitize_text_field( wp_unslash( $_POST['api_token'] ?? '' ) ) );

        $result = MSI_StoreHub_API::test_connection();

        if ( ! $result['success'] ) {
            update_option( 'msi_subdomain', $old_subdomain );
            update_option( 'msi_api_token', $old_token );
            wp_send_json_error( $result['error'] );
        }

        wp_send_json_success( $result['stores'] );
    }

    // ── AJAX: Save selected store name alongside ID ───────────────────────────

    public static function ajax_fetch_stores(): void {
        check_ajax_referer( 'msi_admin_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_send_json_error( 'Unauthorised.' );
        }

        // Persist the human-readable store name so the dropdown shows it on reload
        $store_id   = sanitize_text_field( wp_unslash( $_POST['store_id'] ?? '' ) );
        $store_name = sanitize_text_field( wp_unslash( $_POST['store_name'] ?? '' ) );

        if ( empty( $store_id ) ) {
            wp_send_json_error( 'Please select a StoreHub store.' );
        }

        $old_store_id = (string) get_option( 'msi_store_id', '' );

        update_option( 'msi_store_id',   $store_id );
        update_option( 'msi_store_name', $store_name );

        if ( ! hash_equals( $old_store_id, $store_id ) ) {
            MSI_StoreHub_Inventory_Sync::invalidate_pending_batches();
            MSI_StoreHub_Inventory_Sync::enqueue_immediate();
        }

        wp_send_json_success();
    }
}
