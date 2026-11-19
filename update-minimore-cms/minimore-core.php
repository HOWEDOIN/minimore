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
    remove_submenu_page('minimore-settings', 'minimore-carousel');
}

// Disable WooCommerce marketplace extension suggestions & broken marketing KB card on Coupons
add_filter('woocommerce_allow_marketplace_suggestions', '__return_false');
add_action('admin_footer', 'minimore_hide_woo_marketing_noise');
function minimore_hide_woo_marketing_noise() {
    if (isset($_GET['post_type']) && sanitize_key($_GET['post_type']) === 'shop_coupon') {
        ?>
        <style>
        .woocommerce-marketing-knowledgebase-card,
        .woocommerce-marketing-coupons,
        .woocommerce-marketing-recommended-extensions-card,
        .woocommerce-marketplace-suggestions,
        .woocommerce-layout .components-snackbar-list { display: none !important; }
        </style>
        <script>
        (function() {
            function hideNoise() {
                document.querySelectorAll('.components-card, .woocommerce-card').forEach(function(el) {
                    if (/WooCommerce knowledge base|posts aren.?t loading/i.test(el.textContent || '')) {
                        el.style.display = 'none';
                    }
                });
                document.querySelectorAll('.components-snackbar').forEach(function(el) {
                    if (/recommended extensions/i.test(el.textContent || '')) {
                        el.style.display = 'none';
                    }
                });
            }
            hideNoise();
            if (window.MutationObserver) {
                new MutationObserver(hideNoise).observe(document.body, { childList: true, subtree: true });
            }
        })();
        </script>
        <?php
    }
}

add_action('admin_init', 'minimore_register_settings');
function minimore_register_settings() {
    // Front Banner / Hero Carousel
    register_setting('minimore_settings_group', 'minimore_hero_images');
    register_setting('minimore_settings_group', 'minimore_hero_links');

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
    wp_enqueue_media();
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
    .mm-settings-card .mm-field input[type=text],
    .mm-settings-card .mm-field textarea{width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;color:#1a1a2e;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
    .mm-settings-card .mm-field textarea{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:.82rem;line-height:1.5}
    .mm-settings-card .mm-field input[type=text]:focus,
    .mm-settings-card .mm-field textarea:focus{border-color:#d4a853;outline:none;box-shadow:0 0 0 3px rgba(212,168,83,.15)}
    .mm-save-bar{position:sticky;bottom:0;background:#f0f0f1;border-top:1px solid #dcdcde;padding:12px 0;margin-top:8px;text-align:right}
    </style>

    <div class="mm-wrap">
        <h1>&#9889; Minimore General Settings</h1>
        <p class="mm-subtitle">Manage your front banner slides, deep links, pricing visibility, checkout, shipping, promo codes, announcement bar, and footer in one place.</p>
        <?php settings_errors(); ?>

        <form method="post" action="options.php" id="mm-main-form">
            <?php settings_fields('minimore_settings_group'); ?>

            <div class="mm-settings-card">
                <h3>&#128444; Homepage Front Banner &amp; Deep Links</h3>
                <div class="mm-field">
                    <label for="mm_hero_images">Carousel Images (URLs)</label>
                    <textarea id="mm_hero_images" name="minimore_hero_images" rows="4"><?php echo esc_textarea(get_option('minimore_hero_images', '')); ?></textarea>
                    <p style="color:#9ca3af;font-size:.82rem;margin:6px 0 10px;">Square banner image URLs separated by commas. Click below to upload or select images from your Media Library.</p>
                    <button type="button" class="button button-secondary" id="mm_carousel_upload_btn">Open Media Library to Copy URLs</button>
                </div>
                <div class="mm-field">
                    <label for="mm_hero_links">Image Deep Links (URLs)</label>
                    <textarea id="mm_hero_links" name="minimore_hero_links" rows="3"><?php echo esc_textarea(get_option('minimore_hero_links', '')); ?></textarea>
                    <p style="color:#9ca3af;font-size:.82rem;margin:6px 0 0;">Destination URLs separated by commas in the <strong>exact same order</strong> as the images above (e.g. <code>/products/</code>, <code>/products/?category=perfumes</code>, <code>/products/your-product-slug/</code>, or <code>#</code> for no link).</p>
                </div>
            </div>

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
    <script>
    jQuery(document).ready(function($){
        $('#mm_carousel_upload_btn').on('click', function(e) {
            e.preventDefault();
            var image = wp.media({
                title: 'Upload / Select Carousel Images',
                multiple: true
            }).open().on('select', function() {
                var urls = [];
                image.state().get('selection').each(function(img) {
                    urls.push(img.toJSON().url);
                });
                var current = $('#mm_hero_images').val() || '';
                if (current.trim() !== '' && !current.trim().endsWith(',')) {
                    current = current.trim() + ', ';
                }
                $('#mm_hero_images').val(current + urls.join(', '));
            });
        });
    });
    </script>
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
    register_rest_route('minimore/v1', '/carousel', array(
        'methods'             => 'GET',
        'callback'            => 'minimore_core_carousel_api',
        'permission_callback' => '__return_true'
    ));
});

function minimore_core_carousel_api() {
    $hero_images_raw = get_option('minimore_hero_images', '');
    $hero_images = array();
    if (!empty($hero_images_raw)) {
        $hero_images = array_values(array_filter(array_map('trim', explode(',', $hero_images_raw))));
    }
    $hero_links_raw = get_option('minimore_hero_links', '');
    $hero_links = array();
    if (!empty($hero_links_raw)) {
        $hero_links = array_values(array_map('trim', explode(',', $hero_links_raw)));
    }
    return new WP_REST_Response(array(
        'hero_images' => $hero_images,
        'hero_links'  => $hero_links,
    ), 200);
}

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

// ---------------------------------------------------------
// 3. WooCommerce Orders Admin: Processing -> Completed -> Pending Payment
//    Collapsible dropdown groups, status filter dropdown, and reordered tabs.
// ---------------------------------------------------------
add_action('admin_footer', 'minimore_orders_admin_enhancements');
function minimore_orders_admin_enhancements() {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    $page = isset($_GET['page']) ? sanitize_key($_GET['page']) : '';
    $post_type = isset($_GET['post_type']) ? sanitize_key($_GET['post_type']) : '';
    $is_orders = ($page === 'wc-orders')
        || ($post_type === 'shop_order')
        || ($screen && in_array($screen->id, array('woocommerce_page_wc-orders', 'edit-shop_order'), true));

    if (!$is_orders || isset($_GET['id']) || (isset($_GET['action']) && $_GET['action'] === 'edit')) {
        return;
    }
    ?>
    <style>
    .mm-orders-select{margin-right:6px !important;vertical-align:middle}
    .mm-status-group-row td{padding:0 !important;background:#f8fafc !important;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}
    .mm-group-toggle{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;background:none;border:none;cursor:pointer;text-align:left;font-size:13px;font-weight:600;color:#1e293b}
    .mm-group-toggle:hover{background:#f1f5f9}
    .mm-group-arrow{display:inline-block;width:14px;font-size:11px;color:#64748b;transition:transform .15s}
    .mm-group-pill{display:inline-block;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:600;line-height:1.4}
    .mm-pill-processing{background:#c6e1c6;color:#5b841b}
    .mm-pill-completed{background:#c8d7e1;color:#2e4453}
    .mm-pill-pending{background:#e5e5e5;color:#777}
    .mm-pill-other{background:#f1f5f9;color:#475569}
    .mm-group-count{color:#64748b;font-weight:500;font-size:12px}
    .mm-row-hidden{display:none !important}
    .mm-group-empty td{padding:10px 16px 10px 38px !important;color:#64748b;font-style:italic;background:#fff !important}
    </style>
    <script>
    (function() {
        var url = new URL(window.location.href);
        var isHpos = url.searchParams.get('page') === 'wc-orders';
        var statusParam = isHpos ? 'status' : 'post_status';
        var activeStatus = url.searchParams.get(statusParam) || '';

        // 1. Reorder top status links: All | Processing | Completed | Pending payment | ...
        var subList = document.querySelector('.subsubsub');
        var statusUrls = { all: '', 'wc-processing': '', 'wc-completed': '', 'wc-pending': '' };
        var statusLabels = { 'wc-processing': 'Processing', 'wc-completed': 'Completed', 'wc-pending': 'Pending payment' };
        if (subList) {
            var items = Array.from(subList.querySelectorAll('li'));
            var priority = ['all', 'wc-processing', 'wc-completed', 'wc-pending'];
            items.forEach(function(li) {
                var a = li.querySelector('a');
                if (!a) return;
                Array.from(li.classList).forEach(function(cls) {
                    if (statusUrls.hasOwnProperty(cls)) {
                        statusUrls[cls] = a.href;
                        if (cls !== 'all') statusLabels[cls] = a.textContent.replace(/\s+/g, ' ').trim();
                    }
                });
            });
            items.sort(function(a, b) {
                function rank(li) {
                    for (var i = 0; i < priority.length; i++) {
                        if (li.classList.contains(priority[i])) return i;
                    }
                    return priority.length;
                }
                return rank(a) - rank(b);
            });
            subList.innerHTML = '';
            items.forEach(function(li, idx) {
                Array.from(li.childNodes).forEach(function(n) {
                    if (n.nodeType === 3) n.remove();
                });
                if (idx < items.length - 1) {
                    li.appendChild(document.createTextNode(' | '));
                }
                subList.appendChild(li);
            });
        }

        function buildStatusUrl(targetStatus) {
            if (!targetStatus && statusUrls.all) return statusUrls.all;
            if (targetStatus && statusUrls[targetStatus]) return statusUrls[targetStatus];
            var next = new URL(window.location.href);
            next.searchParams.delete('paged');
            if (!targetStatus) next.searchParams.delete(statusParam);
            else next.searchParams.set(statusParam, targetStatus);
            return next.toString();
        }

        // 2. Add status filter dropdown in the filter bar
        var filterBar = document.querySelector('.tablenav.top .alignleft.actions');
        if (filterBar && !document.getElementById('mm-order-status-filter')) {
            var select = document.createElement('select');
            select.id = 'mm-order-status-filter';
            select.className = 'mm-orders-select';
            select.setAttribute('aria-label', 'Filter by order status');

            var options = [
                { val: '', label: 'All statuses (Processing first)' },
                { val: 'wc-processing', label: statusLabels['wc-processing'] },
                { val: 'wc-completed', label: statusLabels['wc-completed'] },
                { val: 'wc-pending', label: statusLabels['wc-pending'] }
            ];
            options.forEach(function(opt) {
                var o = document.createElement('option');
                o.value = opt.val;
                o.textContent = opt.label;
                if (activeStatus === opt.val || ((!activeStatus || activeStatus === 'all') && opt.val === '')) o.selected = true;
                select.appendChild(o);
            });
            select.addEventListener('change', function() {
                window.location.href = buildStatusUrl(select.value);
            });

            var filterBtn = filterBar.querySelector('#post-query-submit, #order-query-submit, input[type="submit"]');
            if (filterBtn) filterBar.insertBefore(select, filterBtn);
            else filterBar.appendChild(select);
        }

        // 3. On the main "All" view (without explicit column sort), group into collapsible dropdown sections
        if ((activeStatus && activeStatus !== 'all') || url.searchParams.get('orderby')) {
            return;
        }
        var tbody = document.getElementById('the-list');
        if (!tbody) return;
        var rows = Array.from(tbody.querySelectorAll('tr')).filter(function(tr) {
            return !tr.classList.contains('no-items');
        });
        if (!rows.length) return;

        var table = tbody.closest('table');
        var colCount = table ? table.querySelectorAll('thead tr:first-child > th, thead tr:first-child > td').length : 7;
        if (!colCount) colCount = 7;

        function detectGroup(tr) {
            var cls = tr.className || '';
            if (/\bstatus-(?:wc-)?processing\b/.test(cls)) return 'processing';
            if (/\bstatus-(?:wc-)?completed\b/.test(cls)) return 'completed';
            if (/\bstatus-(?:wc-)?pending\b/.test(cls)) return 'pending';
            var badge = tr.querySelector('.order-status');
            var text = badge ? badge.textContent.toLowerCase().trim() : '';
            if (text.indexOf('processing') !== -1) return 'processing';
            if (text.indexOf('completed') !== -1) return 'completed';
            if (text.indexOf('pending') !== -1) return 'pending';
            return 'other';
        }

        var groups = { processing: [], completed: [], pending: [], other: [] };
        rows.forEach(function(tr) {
            groups[detectGroup(tr)].push(tr);
        });

        var defs = [
            { key: 'processing', label: 'Processing', pill: 'mm-pill-processing', defaultOpen: true },
            { key: 'completed',  label: 'Completed',  pill: 'mm-pill-completed',  defaultOpen: true },
            { key: 'pending',    label: 'Pending payment', pill: 'mm-pill-pending', defaultOpen: groups.pending.length > 0 }
        ];
        if (groups.other.length > 0) {
            defs.push({ key: 'other', label: 'Other statuses', pill: 'mm-pill-other', defaultOpen: true });
        }

        tbody.innerHTML = '';
        defs.forEach(function(def) {
            var groupRows = groups[def.key];
            var isOpen = def.defaultOpen;

            var headerRow = document.createElement('tr');
            headerRow.className = 'mm-status-group-row';
            var td = document.createElement('td');
            td.colSpan = colCount;

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mm-group-toggle';
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

            var arrow = document.createElement('span');
            arrow.className = 'mm-group-arrow';
            arrow.textContent = isOpen ? '▼' : '▶';

            var pill = document.createElement('span');
            pill.className = 'mm-group-pill ' + def.pill;
            pill.textContent = def.label;

            var count = document.createElement('span');
            count.className = 'mm-group-count';
            count.textContent = '(' + groupRows.length + ')';

            btn.appendChild(arrow);
            btn.appendChild(pill);
            btn.appendChild(count);
            td.appendChild(btn);
            headerRow.appendChild(td);
            tbody.appendChild(headerRow);

            var targetRows = groupRows.slice();
            if (targetRows.length === 0) {
                var emptyRow = document.createElement('tr');
                emptyRow.className = 'mm-group-empty';
                var emptyTd = document.createElement('td');
                emptyTd.colSpan = colCount;
                emptyTd.textContent = 'No ' + def.label.toLowerCase() + ' orders.';
                emptyRow.appendChild(emptyTd);
                targetRows.push(emptyRow);
            }

            targetRows.forEach(function(r) {
                if (!isOpen) r.classList.add('mm-row-hidden');
                tbody.appendChild(r);
            });

            btn.addEventListener('click', function() {
                isOpen = !isOpen;
                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                arrow.textContent = isOpen ? '▼' : '▶';
                targetRows.forEach(function(r) {
                    if (isOpen) r.classList.remove('mm-row-hidden');
                    else r.classList.add('mm-row-hidden');
                });
            });
        });
    })();
    </script>
    <?php
}
