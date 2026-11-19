<?php
/**
 * Plugin Name: Update Minimore CMS (1-Click Updater)
 * Description: Installs/Updates the Minimore CMS Must-Use plugin (mu-plugins/minimore-core.php).
 * Version: 2.8
 * Author: Minimore AI
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_notices', 'minimore_cms_updater_notice');
function minimore_cms_updater_notice() {
    // Determine target mu-plugins directory
    $mu_dir = defined('WPMU_PLUGIN_DIR') ? trailingslashit(WPMU_PLUGIN_DIR) : trailingslashit(WP_CONTENT_DIR . '/mu-plugins');
    $target = $mu_dir . 'minimore-core.php';
    $payload = __DIR__ . '/minimore-core.payload';
    $legacy_source = __DIR__ . '/minimore-core.php';
    $source = file_exists($payload) ? $payload : $legacy_source;

    if (!file_exists($mu_dir)) {
        @mkdir($mu_dir, 0755, true);
    }

    if (file_exists($source)) {
        $copied = @copy($source, $target);
        if (file_exists($legacy_source) && file_exists($payload)) {
            @unlink($legacy_source);
        }
        if ($copied) {
            if (!function_exists('deactivate_plugins')) {
                require_once ABSPATH . 'wp-admin/includes/plugin.php';
            }
            if (function_exists('deactivate_plugins')) {
                deactivate_plugins(array(
                    plugin_basename(__FILE__),
                    'minimore-carousel/minimore-carousel.php',
                ), true);
            }
            echo '<div class="notice notice-success is-dismissible" style="border-left-color: #d4a853; padding: 12px 16px;">';
            echo '<p style="font-size: 15px; margin: 0 0 6px;"><strong>⚡ Minimore CMS Updated Successfully!</strong></p>';
            echo '<p style="margin: 0;">The unified <b>Minimore</b> General Settings page, WooCommerce Mobile App discovery, and Order status dropdowns are now installed. This updater and the separate Hero Carousel plugin have been deactivated automatically.</p>';
            echo '</div>';
        } else {
            echo '<div class="notice notice-error"><p><strong>❌ Minimore CMS Update Failed:</strong> Could not write to <code>' . esc_html($target) . '</code>. Please check folder permissions.</p></div>';
        }
    }
}
