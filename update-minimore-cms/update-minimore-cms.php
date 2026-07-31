<?php
/**
 * Plugin Name: Update Minimore CMS (1-Click Updater)
 * Description: Installs/Updates the Minimore CMS Must-Use plugin (mu-plugins/minimore-core.php) with the new Store Pricing (Hide Prices) toggle.
 * Version: 2.1
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
    $source = __DIR__ . '/minimore-core.php';

    if (!file_exists($mu_dir)) {
        @mkdir($mu_dir, 0755, true);
    }

    if (file_exists($source)) {
        $copied = @copy($source, $target);
        if ($copied) {
            echo '<div class="notice notice-success is-dismissible" style="border-left-color: #d4a853; padding: 12px 16px;">';
            echo '<p style="font-size: 15px; margin: 0 0 6px;"><strong>⚡ Minimore CMS Updated Successfully!</strong></p>';
            echo '<p style="margin: 0;">The new <b>Store Pricing (Hide All Product Prices)</b> toggle has been installed into your dashboard. Go to <b>Minimore &rarr; Global Settings</b> in your left menu to use it. <i>(You may now deactivate and delete this 1-Click Updater plugin from your Plugins list.)</i></p>';
            echo '</div>';
        } else {
            echo '<div class="notice notice-error"><p><strong>❌ Minimore CMS Update Failed:</strong> Could not write to <code>' . esc_html($target) . '</code>. Please check folder permissions.</p></div>';
        }
    }
}
