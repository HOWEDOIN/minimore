<?php
/**
 * Plugin Name: Minimore Core Functions
 * Description: Custom Headless API endpoints and Storefront Settings for the Minimore Next.js app.
 * Version: 1.1.0
 * Author: Antigravity
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// ---------------------------------------------------------
// 1. Register Settings Page & Hide Unneeded Admin Menus
// ---------------------------------------------------------
add_action('admin_menu', 'minimore_register_settings_page');
function minimore_register_settings_page() {
    add_menu_page(
        'Minimore Settings',
        'Minimore',
        'manage_options',
        'minimore-settings',
        'minimore_render_settings_page',
        'dashicons-store',
        2
    );
}

add_action('admin_menu', 'minimore_hide_unneeded_admin_menus', 999);
function minimore_hide_unneeded_admin_menus() {
    remove_menu_page('edit.php');          // Posts (unused in headless storefront)
    remove_menu_page('edit-comments.php'); // Comments (unused)
    remove_menu_page('themes.php');        // Appearance (headless frontend)
}

add_action('admin_init', 'minimore_register_settings');
function minimore_register_settings() {
    // Coming Soon, Pricing, & Checkout
    register_setting('minimore_settings_group', 'minimore_is_coming_soon');
    register_setting('minimore_settings_group', 'minimore_hide_prices');
    register_setting('minimore_settings_group', 'minimore_disable_checkout');
    register_setting('minimore_settings_group', 'minimore_free_shipping');
    register_setting('minimore_settings_group', 'minimore_promo_codes');

    // Announcement Bar
    register_setting('minimore_settings_group', 'minimore_announcement_active');
    register_setting('minimore_settings_group', 'minimore_announcement_text');
    register_setting('minimore_settings_group', 'minimore_announcement_link');

    // Footer settings (rendered on storefront)
    register_setting('minimore_settings_group', 'minimore_footer_company');
    register_setting('minimore_settings_group', 'minimore_footer_copyright');
}

function minimore_render_settings_page() {
    ?>
    <style>
    .mm-wrap{max-width:820px;margin:20px auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .mm-wrap h1{font-size:1.6rem;font-weight:700;margin-bottom:4px;color:#1a1a2e}
    .mm-wrap .mm-subtitle{color:#666;margin-bottom:24px;font-size:.95rem}
    .mm-settings-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:20px}
    .mm-settings-card h3{margin:0 0 16px;font-size:1rem;color:#1a1a2e;display:flex;align-items:center;gap:8px}
    .mm-toggle-row{display:flex;align-items:center;gap:12px;margin-bottom:8px}
    .mm-toggle{position:relative;width:44px;height:24px;flex-shrink:0}
    .mm-toggle input{opacity:0;width:0;height:0}
    .mm-toggle-slider{position:absolute;inset:0;background:#d1d5db;border-radius:24px;cursor:pointer;transition:.2s}
    .mm-toggle-slider:before{content:"";position:absolute;width:18px;height:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s}
    .mm-toggle input:checked+.mm-toggle-slider{background:#d4a853}
    .mm-toggle input:checked+.mm-toggle-slider:before{transform:translateX(20px)}
    .mm-toggle-label{font-weight:600;font-size:.9rem;color:#374151}
    .mm-field{margin-bottom:16px}
    .mm-field:last-child{margin-bottom:0}
    .mm-field label{display:block;font-weight:600;font-size:.85rem;color:#374151;margin-bottom:6px}
    .mm-settings-card .mm-field input[type=text]{width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;color:#1a1a2e;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
    .mm-settings-card .mm-field input[type=text]:focus{border-color:#d4a853;outline:none;box-shadow:0 0 0 3px rgba(212,168,83,.15)}
    .mm-save-bar{position:sticky;bottom:0;background:#f0f0f1;border-top:1px solid #dcdcde;padding:12px 0;margin-top:8px;text-align:right}
    </style>

    <div class="mm-wrap">
        <h1>&#9889; Minimore Storefront Settings</h1>
        <p class="mm-subtitle">Control live storefront visibility, checkout, shipping, announcement banner, and footer text.</p>
        <?php settings_errors(); ?>

        <form method="post" action="options.php" id="mm-main-form">
            <?php settings_fields('minimore_settings_group'); ?>

            <div class="mm-settings-card">
                <h3>&#128640; Coming Soon Overlay</h3>
                <div class="mm-toggle-row">
                    <label class="mm-toggle">
                        <input type="hidden" name="minimore_is_coming_soon" value="0" />
                        <input type="checkbox" name="minimore_is_coming_soon" value="1" <?php checked(1, get_option('minimore_is_coming_soon', 0)); ?> />
                        <span class="mm-toggle-slider"></span>
                    </label>
                    <span class="mm-toggle-label">Enable Coming Soon Page</span>
                </div>
                <p style="color:#9ca3af;font-size:.85rem;margin:8px 0 0;">When enabled, visitors see the Lalaport Coming Soon overlay instead of your main storefront.</p>
            </div>

            <div class="mm-settings-card">
                <h3>&#128176; Store Pricing</h3>
                <div class="mm-toggle-row">
                    <label class="mm-toggle">
                        <input type="hidden" name="minimore_hide_prices" value="0" />
                        <input type="checkbox" name="minimore_hide_prices" value="1" <?php checked(1, get_option('minimore_hide_prices', 0)); ?> />
                        <span class="mm-toggle-slider"></span>
                    </label>
                    <span class="mm-toggle-label">Hide All Product Prices</span>
                </div>
                <p style="color:#9ca3af;font-size:.85rem;margin:8px 0 0;">When enabled, prices are hidden across the entire storefront (homepage cards, shop page, product detail pages, and related products).</p>
            </div>

            <div class="mm-settings-card">
                <h3>&#128722; Store Checkout &amp; Shipping</h3>
                <div class="mm-toggle-row">
                    <label class="mm-toggle">
                        <input type="hidden" name="minimore_disable_checkout" value="0" />
                        <input type="checkbox" name="minimore_disable_checkout" value="1" <?php checked(1, get_option('minimore_disable_checkout', 0)); ?> />
                        <span class="mm-toggle-slider"></span>
                    </label>
                    <span class="mm-toggle-label">Disable Checkout Button</span>
                </div>
                <p style="color:#9ca3af;font-size:.85rem;margin:8px 0 0;">When enabled, purchases are temporarily disabled and the "Go to Checkout" button is greyed out across the store.</p>
                <div class="mm-toggle-row" style="margin-top:18px;">
                    <label class="mm-toggle">
                        <input type="hidden" name="minimore_free_shipping" value="0" />
                        <input type="checkbox" name="minimore_free_shipping" value="1" <?php checked(1, get_option('minimore_free_shipping', 0)); ?> />
                        <span class="mm-toggle-slider"></span>
                    </label>
                    <span class="mm-toggle-label">Free Shipping</span>
                </div>
                <p style="color:#9ca3af;font-size:.85rem;margin:8px 0 0;">Temporarily sets shipping to RM0 for every Malaysian state.</p>
                <div class="mm-field" style="margin-top:18px;">
                    <label for="mm-promo-codes">Free Shipping Promo Codes <span style="font-weight:400;color:#9ca3af">(comma-separated)</span></label>
                    <input type="text" id="mm-promo-codes" name="minimore_promo_codes" value="<?php echo esc_attr(get_option('minimore_promo_codes', 'freeshippingforjack')); ?>" placeholder="e.g. freeshippingforjack, WELCOME10" />
                    <p style="color:#9ca3af;font-size:.82rem;margin:6px 0 0;">Customers who enter any code above at checkout get RM0 shipping. Leave empty to disable promo codes. (Orders RM300+ always get free shipping automatically.)</p>
                </div>
            </div>

            <div class="mm-settings-card">
                <h3>&#128226; Announcement Bar</h3>
                <div class="mm-toggle-row" style="margin-bottom:16px;">
                    <label class="mm-toggle">
                        <input type="hidden" name="minimore_announcement_active" value="0" />
                        <input type="checkbox" name="minimore_announcement_active" value="1" <?php checked(1, get_option('minimore_announcement_active', 0)); ?> />
                        <span class="mm-toggle-slider"></span>
                    </label>
                    <span class="mm-toggle-label">Show Announcement Bar</span>
                </div>
                <div class="mm-field">
                    <label for="mm-announcement-text">Message Text</label>
                    <input type="text" id="mm-announcement-text" name="minimore_announcement_text" value="<?php echo esc_attr(get_option('minimore_announcement_text', 'Free shipping on orders over RM300!')); ?>" placeholder="e.g. Free shipping on orders over RM300!" />
                </div>
                <div class="mm-field">
                    <label for="mm-announcement-link">Link URL <span style="font-weight:400;color:#9ca3af">(optional)</span></label>
                    <input type="text" id="mm-announcement-link" name="minimore_announcement_link" value="<?php echo esc_attr(get_option('minimore_announcement_link', '')); ?>" placeholder="e.g. /products" />
                </div>
            </div>

            <div class="mm-settings-card">
                <h3>&#128279; Footer</h3>
                <div class="mm-field">
                    <label for="mm-footer-company">Company Name &amp; Registration</label>
                    <input type="text" id="mm-footer-company" name="minimore_footer_company" value="<?php echo esc_attr(get_option('minimore_footer_company', 'Minimore Sdn Bhd (1673311-U)')); ?>" />
                </div>
                <div class="mm-field">
                    <label for="mm-footer-copyright">Copyright Tagline</label>
                    <input type="text" id="mm-footer-copyright" name="minimore_footer_copyright" value="<?php echo esc_attr(get_option('minimore_footer_copyright', 'Authentic Luxury. Travel Sized.')); ?>" />
                </div>
            </div>

            <div class="mm-save-bar">
                <?php submit_button('Save Changes', 'primary', 'submit', false); ?>
            </div>
        </form>
    </div>
    <?php
}

// ---------------------------------------------------------
// 2. Register REST API Endpoints
// ---------------------------------------------------------
add_action('rest_api_init', function () {
    register_rest_route('minimore/v1', '/homepage', array(
        'methods' => 'GET',
        'callback' => 'minimore_get_homepage_data',
        'permission_callback' => '__return_true'
    ));
});

function minimore_get_homepage_data() {
    return array(
        'is_coming_soon'  => (bool) get_option('minimore_is_coming_soon', 0),
        'section_order'   => array('hero', 'trending', 'why'),
        'hero_title'      => get_option('minimore_hero_title', 'Luxury in <em>miniature</em><br />form.'),
        'hero_subtitle'   => get_option('minimore_hero_subtitle', 'Discover our curated collection of authentic premium cosmetic and fragrance miniatures — perfect for gifting, travel, or simply treating yourself.'),
        'hero_image'      => get_option('minimore_hero_image', '/images/hero.png'),
        'hero_eyebrow'    => get_option('minimore_hero_eyebrow', 'New Arrivals 2025'),
        'hero_cta1_label' => get_option('minimore_hero_cta1_label', 'Shop Collection'),
        'hero_cta1_url'   => get_option('minimore_hero_cta1_url', '/products'),
        'hero_cta2_label' => get_option('minimore_hero_cta2_label', 'Our Story'),
        'hero_cta2_url'   => get_option('minimore_hero_cta2_url', '/about'),
        'why_title'       => get_option('minimore_why_title', 'Why Choose Minimore?'),
        'why_tagline'     => get_option('minimore_why_tagline', 'Curated luxury, delivered beautifully.'),
        'why_f1_icon'     => get_option('minimore_why_f1_icon', '✦'),
        'why_f1_title'    => get_option('minimore_why_f1_title', '100% Authentic'),
        'why_f1_desc'     => get_option('minimore_why_f1_desc', 'Every product is guaranteed authentic, sourced directly from authorized brand distributors.'),
        'why_f2_icon'     => get_option('minimore_why_f2_icon', '✈'),
        'why_f2_title'    => get_option('minimore_why_f2_title', 'Travel Ready'),
        'why_f2_desc'     => get_option('minimore_why_f2_desc', 'TSA-approved luxury sizes meticulously chosen for your next getaway or daily essentials.'),
        'why_f3_icon'     => get_option('minimore_why_f3_icon', '🎁'),
        'why_f3_title'    => get_option('minimore_why_f3_title', 'Perfect Gifting'),
        'why_f3_desc'     => get_option('minimore_why_f3_desc', 'Ideal gifts for loved ones to sample the finest luxury brands without the full commitment.'),
        // Text Block
        'text_block_heading' => get_option('minimore_text_block_heading', 'Our Story'),
        'text_block_body'    => get_option('minimore_text_block_body', 'We believe luxury should be accessible — one miniature at a time.'),
        'text_block_align'   => get_option('minimore_text_block_align', 'center'),
        // Image + Text
        'image_text_image'     => get_option('minimore_image_text_image', '/images/hero.png'),
        'image_text_heading'   => get_option('minimore_image_text_heading', 'Curated with care'),
        'image_text_body'      => get_option('minimore_image_text_body', 'Every miniature in our collection is hand-picked and verified authentic.'),
        'image_text_cta_label' => get_option('minimore_image_text_cta_label', 'Shop Now'),
        'image_text_cta_url'   => get_option('minimore_image_text_cta_url', '/products'),
        'image_text_reverse'   => (bool) get_option('minimore_image_text_reverse', 0),
        // CTA Banner
        'cta_banner_bg'         => get_option('minimore_cta_banner_bg', '/images/hero.png'),
        'cta_banner_heading'    => get_option('minimore_cta_banner_heading', 'New Arrivals Just Dropped'),
        'cta_banner_subheading' => get_option('minimore_cta_banner_subheading', 'Explore our latest luxury miniatures'),
        'cta_banner_btn_label'  => get_option('minimore_cta_banner_btn_label', 'Shop Now'),
        'cta_banner_btn_url'    => get_option('minimore_cta_banner_btn_url', '/products'),
        // Testimonials
        'testimonials_title'   => get_option('minimore_testimonials_title', 'What Our Customers Say'),
        'testimonials_1_name'  => get_option('minimore_testimonials_1_name', 'Sarah L.'),
        'testimonials_1_quote' => get_option('minimore_testimonials_1_quote', 'Absolutely love the quality! My perfume miniatures arrived perfectly packaged and smell divine.'),
        'testimonials_1_stars' => get_option('minimore_testimonials_1_stars', '5'),
        'testimonials_2_name'  => get_option('minimore_testimonials_2_name', 'Aisha R.'),
        'testimonials_2_quote' => get_option('minimore_testimonials_2_quote', 'Perfect for gifting! I bought a set as a birthday present and she was thrilled. Will definitely order again.'),
        'testimonials_2_stars' => get_option('minimore_testimonials_2_stars', '5'),
        'testimonials_3_name'  => get_option('minimore_testimonials_3_name', 'Wei Lin T.'),
        'testimonials_3_quote' => get_option('minimore_testimonials_3_quote', 'Great way to try luxury brands before committing to a full size. The curation is spot on!'),
        'testimonials_3_stars' => get_option('minimore_testimonials_3_stars', '5'),
        // Marquee
        'marquee_items' => get_option('minimore_marquee_items', '100% Authentic, Travel Ready, Luxury Miniatures, Perfect Gifts, Free Shipping Over RM150'),
        'marquee_speed' => get_option('minimore_marquee_speed', 'normal'),
        // Category Tiles
        'cat_tiles_title'  => get_option('minimore_cat_tiles_title', 'Shop by Category'),
        'cat_tile_1_image' => get_option('minimore_cat_tile_1_image', '/images/skincare.png'),
        'cat_tile_1_label' => get_option('minimore_cat_tile_1_label', 'Skincare'),
        'cat_tile_1_url'   => get_option('minimore_cat_tile_1_url', '/products?category=skincare'),
        'cat_tile_2_image' => get_option('minimore_cat_tile_2_image', '/images/skincare.png'),
        'cat_tile_2_label' => get_option('minimore_cat_tile_2_label', 'Fragrances'),
        'cat_tile_2_url'   => get_option('minimore_cat_tile_2_url', '/products?category=fragrances'),
        'cat_tile_3_image' => get_option('minimore_cat_tile_3_image', '/images/skincare.png'),
        'cat_tile_3_label' => get_option('minimore_cat_tile_3_label', 'Cosmetics'),
        'cat_tile_3_url'   => get_option('minimore_cat_tile_3_url', '/products?category=cosmetics'),
        'cat_tile_4_image' => get_option('minimore_cat_tile_4_image', '/images/skincare.png'),
        'cat_tile_4_label' => get_option('minimore_cat_tile_4_label', 'Gift Sets'),
        'cat_tile_4_url'   => get_option('minimore_cat_tile_4_url', '/products?category=gifts'),
    );
}

// Sitewide global settings (footer, announcement)
function minimore_get_sitewide_data() {
    return array(
        'hide_prices'      => (bool) get_option('minimore_hide_prices', 0),
        'disable_checkout' => (bool) get_option('minimore_disable_checkout', 0),
        'free_shipping'    => (bool) get_option('minimore_free_shipping', 0),
        'promo_codes'      => (string) get_option('minimore_promo_codes', 'freeshippingforjack'),
        'announcement' => array(
            'is_active' => (bool) get_option('minimore_announcement_active', 0),
            'text'      => get_option('minimore_announcement_text', ''),
            'link'      => get_option('minimore_announcement_link', ''),
        ),
        'footer' => array(
            'company'   => get_option('minimore_footer_company', 'Minimore Sdn Bhd (1673311-U)'),
            'tagline'   => get_option('minimore_footer_tagline', 'Launching Soon @ Lalaport Bukit Bintang'),
            'copyright' => get_option('minimore_footer_copyright', 'Authentic Luxury. Travel Sized.'),
        ),
    );
}

add_action('rest_api_init', function () {
    register_rest_route('minimore/v1', '/sitewide', array(
        'methods'             => 'GET',
        'callback'            => 'minimore_get_sitewide_data',
        'permission_callback' => '__return_true'
    ));
});

// Ensure WordPress advertises admin.minimore.my (siteurl) as its API host for mobile apps
add_filter('option_home', function ($value) {
    $siteurl = get_option('siteurl');
    return $siteurl ? $siteurl : $value;
}, 99);

add_filter('rest_url', function ($url) {
    $home_host = parse_url(home_url('/'), PHP_URL_HOST);
    $site_host = parse_url(site_url('/'), PHP_URL_HOST);
    if ($home_host && $site_host && $home_host !== $site_host) {
        $url = str_replace('://' . $home_host, '://' . $site_host, $url);
    }
    return $url;
}, 99);

// Keep WordPress as the private CMS while returning 200 OK + REST/RSD discovery tags
// so the WooCommerce Mobile App does not hit a 302 redirect during login discovery.
add_action('template_redirect', function () {
    if (!(defined('REST_REQUEST') && REST_REQUEST) && !wp_doing_ajax()) {
        $rest_href  = rest_url();
        $rsd_href   = site_url('xmlrpc.php?rsd', 'rpc');
        $admin_href = admin_url();

        status_header(200);
        nocache_headers();
        header('Content-Type: text/html; charset=utf-8');
        header('Link: <' . esc_url_raw($rest_href) . '>; rel="https://api.w.org/"');
        ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Minimore Admin</title>
  <link rel="https://api.w.org/" href="<?php echo esc_url($rest_href); ?>" />
  <link rel="EditURI" type="application/rsd+xml" title="RSD" href="<?php echo esc_url($rsd_href); ?>" />
  <script>window.location.replace(<?php echo wp_json_encode($admin_href); ?>);</script>
</head>
<body>
  <noscript><p><a href="<?php echo esc_url($admin_href); ?>">Go to Minimore Admin</a></p></noscript>
</body>
</html>
        <?php
        exit;
    }
});
