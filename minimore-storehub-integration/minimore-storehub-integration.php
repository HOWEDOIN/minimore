<?php
/**
 * Plugin Name: Minimore StoreHub Integration
 * Description: Integrates WooCommerce with StoreHub BackOffice. Syncs inventory from a dedicated Online Store, pushes orders as transactions, and retries failed pushes automatically.
 * Version: 1.2.0
 * Author: Minimore AI
 * Requires Plugins: woocommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ── Constants ──────────────────────────────────────────────────────────────────
define( 'MSI_VERSION',     '1.2.0' );
define( 'MSI_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'MSI_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );
define( 'MSI_PLUGIN_FILE', __FILE__ );

// ── Verify Action Scheduler is available (bundled with WooCommerce) ────────────
add_action( 'admin_notices', 'msi_check_action_scheduler' );
function msi_check_action_scheduler() {
    if ( ! function_exists( 'as_schedule_single_action' ) ) {
        echo '<div class="notice notice-error"><p><strong>Minimore StoreHub Integration:</strong> Action Scheduler is required but not found. Please ensure WooCommerce is active.</p></div>';
    }
}

// ── Load includes ──────────────────────────────────────────────────────────────
require_once MSI_PLUGIN_DIR . 'includes/class-storehub-api.php';
require_once MSI_PLUGIN_DIR . 'includes/class-storehub-settings.php';
require_once MSI_PLUGIN_DIR . 'includes/class-storehub-catalog-sync.php';
require_once MSI_PLUGIN_DIR . 'includes/class-storehub-inventory-sync.php';
require_once MSI_PLUGIN_DIR . 'includes/class-storehub-order-sync.php';

// ── Boot each class ────────────────────────────────────────────────────────────
add_action( 'plugins_loaded', 'msi_boot', 20 );
function msi_boot() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function () {
            echo '<div class="notice notice-error"><p><strong>Minimore StoreHub Integration:</strong> WooCommerce must be active.</p></div>';
        });
        return;
    }

    MSI_StoreHub_Settings::init();
    MSI_StoreHub_Catalog_Sync::init();
    MSI_StoreHub_Inventory_Sync::init();
    MSI_StoreHub_Order_Sync::init();
}

// ── Dashboard widget: failed order pushes ──────────────────────────────────────
add_action( 'wp_dashboard_setup', 'msi_register_dashboard_widget' );
function msi_register_dashboard_widget() {
    if ( ! function_exists( 'wc_get_orders' ) ) {
        return;
    }

    wp_add_dashboard_widget(
        'msi_failed_orders_widget',
        'StoreHub: Failed Order Pushes',
        'msi_render_failed_orders_widget'
    );
}

function msi_render_failed_orders_widget() {
    $failed_orders = wc_get_orders( array(
        'meta_key'     => '_storehub_push_status',
        'meta_value'   => 'failed',
        'meta_compare' => '=',
        'limit'        => 20,
        'return'       => 'ids',
    ) );

    if ( empty( $failed_orders ) ) {
        echo '<p style="color:green;">&#10003; No failed StoreHub pushes.</p>';
        return;
    }

    echo '<p style="color:red;"><strong>' . count( $failed_orders ) . ' order(s) failed to push to StoreHub:</strong></p>';
    echo '<ul>';
    foreach ( $failed_orders as $order_id ) {
        $order    = wc_get_order( $order_id );
        $edit_url = get_edit_post_link( $order_id );
        printf(
            '<li><a href="%s">Order #%d</a> &mdash; %s &mdash; <em>%s</em></li>',
            esc_url( $edit_url ),
            absint( $order_id ),
            esc_html( $order->get_date_created()->date( 'Y-m-d H:i' ) ),
            esc_html( $order->get_formatted_billing_full_name() )
        );
    }
    echo '</ul>';
}

// ── Activation: schedule inventory sync ────────────────────────────────────────
register_activation_hook( __FILE__, 'msi_activate' );
function msi_activate() {
    if ( function_exists( 'as_schedule_recurring_action' ) ) {
        MSI_StoreHub_Inventory_Sync::schedule();
    }
}

// ── Deactivation: unschedule all MSI actions ──────────────────────────────────
register_deactivation_hook( __FILE__, 'msi_deactivate' );
function msi_deactivate() {
    if ( function_exists( 'as_unschedule_all_actions' ) ) {
        as_unschedule_all_actions( 'msi_inventory_sync' );
        as_unschedule_all_actions( 'msi_inventory_sync_now' );
        as_unschedule_all_actions( 'msi_inventory_sync_batch' );
        as_unschedule_all_actions( 'msi_order_push_retry' );
    }
}
