<?php
/**
 * Plugin Name: Minimore Checkout Styler
 * Description: Styles the WooCommerce block checkout to match Shopify's split-screen layout.
 * Version: 2.0.0
 * Author: Minimore
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'wp_enqueue_scripts', 'minimore_checkout_styles', 999 );
function minimore_checkout_styles() {
    if ( is_checkout() || is_order_received_page() ) {
        wp_enqueue_style( 'minimore-checkout', plugin_dir_url( __FILE__ ) . 'checkout.css', array(), '2.0.0' );
        wp_enqueue_script( 'minimore-checkout-js', plugin_dir_url( __FILE__ ) . 'checkout.js', array(), '2.0.0', true );
    }
}

add_filter( 'woocommerce_return_to_shop_redirect', 'minimore_custom_return_shop_url' );
function minimore_custom_return_shop_url() { return 'https://minimore.my/'; }
