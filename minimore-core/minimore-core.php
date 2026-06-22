<?php
/**
 * Plugin Name: Minimore Core Settings
 * Description: Manages Hero Carousel and Sitewide Settings (Socials, Contact).
 * Version: 2.0
 * Author: Minimore AI
 */

if (!defined('ABSPATH')) {
    exit;
}

// Add the menu items
add_action('admin_menu', 'minimore_core_menu', 999);
function minimore_core_menu() {
    global $menu;
    $parent_slug = '';
    
    // Search the global $menu array for the one titled 'Minimore'
    if (!empty($menu)) {
        foreach ($menu as $item) {
            if (isset($item[0]) && strpos(strip_tags($item[0]), 'Minimore') !== false) {
                $parent_slug = $item[2];
                break;
            }
        }
    }
    
    if (!empty($parent_slug)) {
        add_submenu_page($parent_slug, 'Hero Carousel', 'Hero Carousel', 'manage_options', 'minimore-carousel', 'minimore_carousel_page');
        add_submenu_page($parent_slug, 'Sitewide Settings', 'Sitewide Settings', 'manage_options', 'minimore-sitewide', 'minimore_sitewide_page');
    } else {
        // Fallback to top level if parent not found
        add_menu_page('Minimore Core', 'Minimore Core', 'manage_options', 'minimore-carousel', 'minimore_carousel_page', 'dashicons-admin-generic', 30);
        add_submenu_page('minimore-carousel', 'Hero Carousel', 'Hero Carousel', 'manage_options', 'minimore-carousel', 'minimore_carousel_page');
        add_submenu_page('minimore-carousel', 'Sitewide Settings', 'Sitewide Settings', 'manage_options', 'minimore-sitewide', 'minimore_sitewide_page');
    }
}

// Register settings
add_action('admin_init', 'minimore_core_settings');
function minimore_core_settings() {
    // Carousel Settings
    register_setting('minimore_carousel_group', 'minimore_hero_images');
    register_setting('minimore_carousel_group', 'minimore_hero_links');
    
    // Sitewide Settings
    register_setting('minimore_sitewide_group', 'minimore_social_instagram');
    register_setting('minimore_sitewide_group', 'minimore_social_facebook');
    register_setting('minimore_sitewide_group', 'minimore_social_tiktok');
    register_setting('minimore_sitewide_group', 'minimore_social_telegram');
}

// Render the Carousel page
function minimore_carousel_page() {
    wp_enqueue_media();
    ?>
    <div class="wrap">
        <h1>Hero Carousel Configuration</h1>
        <form method="post" action="options.php">
            <?php settings_fields('minimore_carousel_group'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Carousel Images (URLs)</th>
                    <td>
                        <textarea id="minimore_hero_images" name="minimore_hero_images" rows="6" cols="60" class="large-text code"><?php echo esc_textarea(get_option('minimore_hero_images', '')); ?></textarea>
                        <br>
                        <button type="button" class="button button-primary" id="minimore_upload_btn">Open Media Library to Copy URLs</button>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Image Links (URLs)</th>
                    <td>
                        <textarea id="minimore_hero_links" name="minimore_hero_links" rows="6" cols="60" class="large-text code"><?php echo esc_textarea(get_option('minimore_hero_links', '')); ?></textarea>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <script>
    jQuery(document).ready(function($){
        $('#minimore_upload_btn').click(function(e) {
            e.preventDefault();
            var image = wp.media({ title: 'Select Images', multiple: true }).open()
            .on('select', function(e){
                var uploaded_images = image.state().get('selection');
                var urls = [];
                uploaded_images.each(function(img) { urls.push(img.toJSON().url); });
                var current = $('#minimore_hero_images').val();
                if(current.trim() !== '' && !current.endsWith(',')) current += ', ';
                $('#minimore_hero_images').val(current + urls.join(', '));
            });
        });
    });
    </script>
    <?php
}

// Render the Sitewide page
function minimore_sitewide_page() {
    ?>
    <div class="wrap">
        <h1>Sitewide Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('minimore_sitewide_group'); ?>
            <h2>Social Media Links</h2>
            <p>Paste the full URL to your social media profiles. Leave blank to hide.</p>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Instagram URL</th>
                    <td><input type="text" name="minimore_social_instagram" value="<?php echo esc_attr(get_option('minimore_social_instagram', '')); ?>" class="regular-text" style="width:400px;" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Facebook URL</th>
                    <td><input type="text" name="minimore_social_facebook" value="<?php echo esc_attr(get_option('minimore_social_facebook', '')); ?>" class="regular-text" style="width:400px;" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">TikTok URL</th>
                    <td><input type="text" name="minimore_social_tiktok" value="<?php echo esc_attr(get_option('minimore_social_tiktok', '')); ?>" class="regular-text" style="width:400px;" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Telegram URL</th>
                    <td><input type="text" name="minimore_social_telegram" value="<?php echo esc_attr(get_option('minimore_social_telegram', '')); ?>" class="regular-text" style="width:400px;" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Register REST API Endpoints
add_action('rest_api_init', function () {
    register_rest_route('minimore/v1', '/carousel', array(
        'methods' => 'GET',
        'callback' => 'minimore_carousel_api',
        'permission_callback' => '__return_true'
    ));
    register_rest_route('minimore/v1', '/sitewide', array(
        'methods' => 'GET',
        'callback' => 'minimore_sitewide_api',
        'permission_callback' => '__return_true'
    ));
});

function minimore_carousel_api() {
    $hero_images_raw = get_option('minimore_hero_images', '');
    $hero_images = [];
    if (!empty($hero_images_raw)) {
        $hero_images = array_map('trim', explode(',', $hero_images_raw));
        $hero_images = array_values(array_filter($hero_images));
    }
    
    $hero_links_raw = get_option('minimore_hero_links', '');
    $hero_links = [];
    if (!empty($hero_links_raw)) {
        $hero_links = array_map('trim', explode(',', $hero_links_raw));
        $hero_links = array_values($hero_links);
    }

    return new WP_REST_Response(['hero_images' => $hero_images, 'hero_links' => $hero_links], 200);
}

function minimore_sitewide_api() {
    return new WP_REST_Response([
        'social_instagram' => get_option('minimore_social_instagram', ''),
        'social_facebook'  => get_option('minimore_social_facebook', ''),
        'social_tiktok'    => get_option('minimore_social_tiktok', ''),
        'social_telegram'  => get_option('minimore_social_telegram', '')
    ], 200);
}
