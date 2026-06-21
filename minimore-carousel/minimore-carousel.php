<?php
/**
 * Plugin Name: Minimore Hero Carousel
 * Description: Adds a settings page to manage multiple hero carousel images and their respective hyperlinks.
 * Version: 1.4
 * Author: Minimore AI
 */

if (!defined('ABSPATH')) {
    exit;
}

// Add the menu item
add_action('admin_menu', 'minimore_carousel_menu', 999);
function minimore_carousel_menu() {
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
        add_submenu_page(
            $parent_slug,
            'Hero Carousel',
            'Hero Carousel',
            'manage_options',
            'minimore-carousel',
            'minimore_carousel_page'
        );
    } else {
        // Fallback to top level if parent not found
        add_menu_page(
            'Hero Carousel',
            'Hero Carousel',
            'manage_options',
            'minimore-carousel',
            'minimore_carousel_page',
            'dashicons-images-alt2',
            30
        );
    }
}

// Register settings
add_action('admin_init', 'minimore_carousel_settings');
function minimore_carousel_settings() {
    register_setting('minimore_carousel_group', 'minimore_hero_images');
    register_setting('minimore_carousel_group', 'minimore_hero_links');
}

// Render the settings page
function minimore_carousel_page() {
    wp_enqueue_media();
    ?>
    <div class="wrap">
        <h1>Hero Carousel Configuration</h1>
        <form method="post" action="options.php">
            <?php settings_fields('minimore_carousel_group'); ?>
            <?php do_settings_sections('minimore_carousel_group'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Carousel Images (URLs)</th>
                    <td>
                        <textarea id="minimore_hero_images" name="minimore_hero_images" rows="6" cols="60" class="large-text code"><?php echo esc_textarea(get_option('minimore_hero_images', '')); ?></textarea>
                        <p class="description">Enter the full URLs of your square images, separated by commas. (e.g. <code>https://yoursite.com/img1.png, https://yoursite.com/img2.png</code>)</p>
                        <br>
                        <button type="button" class="button button-primary" id="minimore_upload_btn">Open Media Library to Copy URLs</button>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Image Links (URLs)</th>
                    <td>
                        <textarea id="minimore_hero_links" name="minimore_hero_links" rows="6" cols="60" class="large-text code"><?php echo esc_textarea(get_option('minimore_hero_links', '')); ?></textarea>
                        <p class="description">Enter the destination URLs for the images above, separated by commas. <b>Make sure the order matches the images exactly!</b><br>If an image doesn't need a link, use a hashtag (<code>#</code>).</p>
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
            var image = wp.media({ 
                title: 'Upload/Select Carousel Images',
                multiple: true
            }).open()
            .on('select', function(e){
                var uploaded_images = image.state().get('selection');
                var urls = [];
                uploaded_images.each(function(img) {
                    urls.push(img.toJSON().url);
                });
                var current = $('#minimore_hero_images').val();
                if(current.trim() !== '' && !current.endsWith(',')) {
                    current += ', ';
                }
                $('#minimore_hero_images').val(current + urls.join(', '));
            });
        });
    });
    </script>
    <?php
}

// Register REST API Endpoint
add_action('rest_api_init', function () {
    register_rest_route('minimore/v1', '/carousel', array(
        'methods' => 'GET',
        'callback' => 'minimore_carousel_api',
        'permission_callback' => '__return_true'
    ));
});

function minimore_carousel_api() {
    // Process Images
    $hero_images_raw = get_option('minimore_hero_images', '');
    $hero_images = [];
    if (!empty($hero_images_raw)) {
        $hero_images = array_map('trim', explode(',', $hero_images_raw));
        $hero_images = array_filter($hero_images);
        $hero_images = array_values($hero_images);
    }
    
    // Process Links
    $hero_links_raw = get_option('minimore_hero_links', '');
    $hero_links = [];
    if (!empty($hero_links_raw)) {
        $hero_links = array_map('trim', explode(',', $hero_links_raw));
        // We do not array_filter links because an empty string or # is valid to denote no link
        $hero_links = array_values($hero_links);
    }

    return new WP_REST_Response([
        'hero_images' => $hero_images,
        'hero_links' => $hero_links
    ], 200);
}
