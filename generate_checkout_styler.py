import os
import zipfile
import shutil

PLUGIN_NAME = "minimore-checkout-styler"
PLUGIN_DIR = PLUGIN_NAME

if not os.path.exists(PLUGIN_DIR):
    os.makedirs(PLUGIN_DIR)

php_content = """<?php
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
"""
with open(os.path.join(PLUGIN_DIR, f"{PLUGIN_NAME}.php"), "w") as f:
    f.write(php_content)

css_content = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Reset and Base Styling */
body {
    font-family: 'Inter', sans-serif !important;
    background-color: #ffffff !important;
    color: #1c1c1c !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Hide standard WP elements */
.site-header, #masthead, .header-main, .storefront-primary-navigation,
.site-footer, #colophon, .footer-widgets, .site-info,
#secondary, .sidebar, .widget-area {
    display: none !important;
}

/* Force main content container to fill */
.site-main, #primary, #main, .content-area, .entry-content {
    margin: 0 auto !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
}

/* Split-screen background pseudo-element (Shopify style right column) */
@media (min-width: 1024px) {
    body::before {
        content: "";
        position: fixed;
        top: 0;
        right: 0;
        width: 45%;
        height: 100vh;
        background-color: #f5f5f5; /* Light grey */
        border-left: 1px solid #e1e1e1;
        z-index: -1;
    }
}

/* Checkout Block Layout Constraints */
.wc-block-checkout, .wc-block-order-confirmation {
    max-width: 1080px !important;
    margin: 0 auto !important;
    padding: 20px 20px 60px 20px !important;
}

/* Custom Header */
#minimore-checkout-header {
    max-width: 1080px;
    margin: 0 auto;
    padding: 40px 20px 20px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
#minimore-checkout-header h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
}
#minimore-checkout-header a {
    color: #1c1c1c;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
}
#minimore-checkout-header a:hover { text-decoration: underline; }

/* Input field styling */
.wc-block-components-text-input input, 
.wc-block-components-combobox-control input, 
select, textarea {
    border-radius: 4px !important;
    border: 1px solid #d9d9d9 !important;
    padding: 12px 14px !important;
    font-size: 14px !important;
    box-shadow: none !important;
}
.wc-block-components-text-input input:focus {
    border-color: #1c1c1c !important;
    box-shadow: 0 0 0 1px #1c1c1c !important;
}

/* Button styling */
.wc-block-components-button:not(.is-link) {
    background-color: #1c1c1c !important;
    color: #ffffff !important;
    border-radius: 4px !important;
    padding: 16px 24px !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    text-transform: none !important;
    border: none !important;
    transition: background-color 0.2s ease !important;
    width: 100% !important;
    margin-top: 10px !important;
}
.wc-block-components-button:not(.is-link):hover { background-color: #333333 !important; }

/* Order Summary Column Specifics */
@media (min-width: 1024px) {
    .wc-block-checkout__sidebar {
        padding-left: 40px !important;
    }
    .wc-block-checkout__main {
        padding-right: 40px !important;
    }
}
"""
with open(os.path.join(PLUGIN_DIR, "checkout.css"), "w") as f:
    f.write(css_content)

js_content = """
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("minimore-checkout-header")) return;
    var header = document.createElement("header");
    header.id = "minimore-checkout-header";
    header.innerHTML = "<h1>Minimore</h1><a href='https://minimore.my/cart'><span>&larr;</span> Back to Cart</a>";
    
    var container = document.querySelector(".wc-block-checkout") || document.querySelector(".wc-block-order-confirmation");
    if (container && container.parentNode) {
        container.parentNode.insertBefore(header, container);
    } else {
        document.body.insertBefore(header, document.body.firstChild);
    }
});
"""
with open(os.path.join(PLUGIN_DIR, "checkout.js"), "w") as f:
    f.write(js_content)

zip_filename = f"{PLUGIN_NAME}.zip"
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(PLUGIN_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            zipf.write(file_path, os.path.relpath(file_path, "."))

print(f"Created {zip_filename} successfully!")
