<?php
/**
 * Plugin Name: Minimore Core Functions
 * Description: Custom Headless API endpoints and settings for the Minimore Next.js app.
 * Version: 1.0.0
 * Author: Antigravity
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// ---------------------------------------------------------
// 1. Register Settings Page
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

add_action('admin_init', 'minimore_register_settings');
function minimore_register_settings() {
    // Layout settings — stored as a single JSON array
    register_setting('minimore_settings_group', 'minimore_layout_order');

    // Coming Soon
    register_setting('minimore_settings_group', 'minimore_is_coming_soon');
    register_setting('minimore_settings_group', 'minimore_hide_prices');

    // Announcement Bar
    register_setting('minimore_settings_group', 'minimore_announcement_active');
    register_setting('minimore_settings_group', 'minimore_announcement_text');
    register_setting('minimore_settings_group', 'minimore_announcement_link');

    // Hero settings
    register_setting('minimore_settings_group', 'minimore_hero_title');
    register_setting('minimore_settings_group', 'minimore_hero_subtitle');
    register_setting('minimore_settings_group', 'minimore_hero_image');
    register_setting('minimore_settings_group', 'minimore_hero_eyebrow');
    register_setting('minimore_settings_group', 'minimore_hero_cta1_label');
    register_setting('minimore_settings_group', 'minimore_hero_cta1_url');
    register_setting('minimore_settings_group', 'minimore_hero_cta2_label');
    register_setting('minimore_settings_group', 'minimore_hero_cta2_url');

    // Why Minimore settings
    register_setting('minimore_settings_group', 'minimore_why_title');
    register_setting('minimore_settings_group', 'minimore_why_tagline');
    register_setting('minimore_settings_group', 'minimore_why_f1_icon');
    register_setting('minimore_settings_group', 'minimore_why_f1_title');
    register_setting('minimore_settings_group', 'minimore_why_f1_desc');
    register_setting('minimore_settings_group', 'minimore_why_f2_icon');
    register_setting('minimore_settings_group', 'minimore_why_f2_title');
    register_setting('minimore_settings_group', 'minimore_why_f2_desc');
    register_setting('minimore_settings_group', 'minimore_why_f3_icon');
    register_setting('minimore_settings_group', 'minimore_why_f3_title');
    register_setting('minimore_settings_group', 'minimore_why_f3_desc');

    // Footer settings
    register_setting('minimore_settings_group', 'minimore_footer_company');
    register_setting('minimore_settings_group', 'minimore_footer_tagline');
    register_setting('minimore_settings_group', 'minimore_footer_copyright');

    // Text Block
    register_setting('minimore_settings_group', 'minimore_text_block_heading');
    register_setting('minimore_settings_group', 'minimore_text_block_body');
    register_setting('minimore_settings_group', 'minimore_text_block_align');

    // Image + Text
    register_setting('minimore_settings_group', 'minimore_image_text_image');
    register_setting('minimore_settings_group', 'minimore_image_text_heading');
    register_setting('minimore_settings_group', 'minimore_image_text_body');
    register_setting('minimore_settings_group', 'minimore_image_text_cta_label');
    register_setting('minimore_settings_group', 'minimore_image_text_cta_url');
    register_setting('minimore_settings_group', 'minimore_image_text_reverse');

    // CTA Banner
    register_setting('minimore_settings_group', 'minimore_cta_banner_bg');
    register_setting('minimore_settings_group', 'minimore_cta_banner_heading');
    register_setting('minimore_settings_group', 'minimore_cta_banner_subheading');
    register_setting('minimore_settings_group', 'minimore_cta_banner_btn_label');
    register_setting('minimore_settings_group', 'minimore_cta_banner_btn_url');

    // Testimonials
    register_setting('minimore_settings_group', 'minimore_testimonials_title');
    register_setting('minimore_settings_group', 'minimore_testimonials_1_name');
    register_setting('minimore_settings_group', 'minimore_testimonials_1_quote');
    register_setting('minimore_settings_group', 'minimore_testimonials_1_stars');
    register_setting('minimore_settings_group', 'minimore_testimonials_2_name');
    register_setting('minimore_settings_group', 'minimore_testimonials_2_quote');
    register_setting('minimore_settings_group', 'minimore_testimonials_2_stars');
    register_setting('minimore_settings_group', 'minimore_testimonials_3_name');
    register_setting('minimore_settings_group', 'minimore_testimonials_3_quote');
    register_setting('minimore_settings_group', 'minimore_testimonials_3_stars');

    // Marquee Strip
    register_setting('minimore_settings_group', 'minimore_marquee_items');
    register_setting('minimore_settings_group', 'minimore_marquee_speed');

    // Category Tiles
    register_setting('minimore_settings_group', 'minimore_cat_tiles_title');
    register_setting('minimore_settings_group', 'minimore_cat_tile_1_image');
    register_setting('minimore_settings_group', 'minimore_cat_tile_1_label');
    register_setting('minimore_settings_group', 'minimore_cat_tile_1_url');
    register_setting('minimore_settings_group', 'minimore_cat_tile_2_image');
    register_setting('minimore_settings_group', 'minimore_cat_tile_2_label');
    register_setting('minimore_settings_group', 'minimore_cat_tile_2_url');
    register_setting('minimore_settings_group', 'minimore_cat_tile_3_image');
    register_setting('minimore_settings_group', 'minimore_cat_tile_3_label');
    register_setting('minimore_settings_group', 'minimore_cat_tile_3_url');
    register_setting('minimore_settings_group', 'minimore_cat_tile_4_image');
    register_setting('minimore_settings_group', 'minimore_cat_tile_4_label');
    register_setting('minimore_settings_group', 'minimore_cat_tile_4_url');
}

function minimore_render_settings_page() {
    $raw_order = get_option('minimore_layout_order', '');
    $layout_order = $raw_order ? json_decode($raw_order, true) : array('hero', 'trending', 'why');
    if (!is_array($layout_order)) $layout_order = array('hero', 'trending', 'why');

    $section_meta = array(
        'hero'         => array('label' => 'Hero Banner',         'icon' => '&#128444;', 'color' => '#d4a853'),
        'trending'     => array('label' => 'Trending Miniatures', 'icon' => '&#128717;', 'color' => '#8b6bab'),
        'why'          => array('label' => 'Why Minimore',        'icon' => '&#10024;',  'color' => '#5b8fa8'),
        'text_block'   => array('label' => 'Text Block',          'icon' => '&#128221;', 'color' => '#6b7280'),
        'image_text'   => array('label' => 'Image + Text',        'icon' => '&#9974;',   'color' => '#059669'),
        'cta_banner'   => array('label' => 'CTA Banner',          'icon' => '&#127919;', 'color' => '#dc2626'),
        'testimonials' => array('label' => 'Testimonials',        'icon' => '&#128172;', 'color' => '#7c3aed'),
        'marquee'      => array('label' => 'Marquee Strip',       'icon' => '&#127991;', 'color' => '#d97706'),
        'cat_tiles'    => array('label' => 'Category Tiles',      'icon' => '&#128193;', 'color' => '#0284c7'),
    );
    ?>
    <style>
    .mm-wrap{max-width:900px;margin:20px auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .mm-wrap h1{font-size:1.6rem;font-weight:700;margin-bottom:4px;color:#1a1a2e}
    .mm-wrap .mm-subtitle{color:#666;margin-bottom:24px;font-size:.95rem}
    .mm-tabs{display:flex;gap:4px;border-bottom:2px solid #e5e7eb;margin-bottom:28px}
    .mm-tab{background:none;border:none;padding:10px 20px;font-size:.95rem;font-weight:600;color:#6b7280;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;transition:.2s;border-radius:6px 6px 0 0}
    .mm-tab:hover{color:#1a1a2e;background:#f3f4f6}
    .mm-tab.active{color:#d4a853;border-bottom-color:#d4a853}
    .mm-tab-content{display:none}
    .mm-tab-content.active{display:block}
    .mm-section-list{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
    .mm-card{display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:14px 16px;transition:.2s;cursor:default}
    .mm-card:hover{border-color:#d4a853;box-shadow:0 2px 12px rgba(212,168,83,.15)}
    .mm-card.drag-over{border-color:#d4a853;background:#fffbef}
    .mm-card.dragging{opacity:.4}
    .mm-drag-handle{font-size:20px;color:#bbb;cursor:grab;line-height:1;user-select:none}
    .mm-drag-handle:active{cursor:grabbing}
    .mm-card-badge{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
    .mm-card-info{flex:1;min-width:0}
    .mm-card-title{font-weight:600;font-size:.95rem;color:#1a1a2e}
    .mm-card-type{font-size:.78rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-top:1px}
    .mm-card-actions{display:flex;gap:6px}
    .mm-btn-edit{background:#f9f6f0;border:1.5px solid #e8d5a3;color:#9a6f1e;border-radius:7px;padding:6px 14px;font-size:.82rem;font-weight:600;cursor:pointer;transition:.2s}
    .mm-btn-edit:hover{background:#d4a853;color:#fff;border-color:#d4a853}
    .mm-btn-delete{background:#fff5f5;border:1.5px solid #fecaca;color:#dc2626;border-radius:7px;padding:6px 10px;font-size:.82rem;cursor:pointer;transition:.2s}
    .mm-btn-delete:hover{background:#dc2626;color:#fff;border-color:#dc2626}
    .mm-add-btn{display:flex;align-items:center;gap:8px;background:#fff;border:2px dashed #d1d5db;border-radius:12px;padding:14px 20px;font-size:.9rem;font-weight:600;color:#6b7280;cursor:pointer;width:100%;transition:.2s}
    .mm-add-btn:hover{border-color:#d4a853;color:#d4a853;background:#fffbef}
    .mm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9998;opacity:0;pointer-events:none;transition:opacity .3s}
    .mm-overlay.open{opacity:1;pointer-events:all}
    .mm-drawer{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:95vw;background:#fff;z-index:9999;transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(0,0,0,.18)}
    .mm-drawer.open{transform:translateX(0)}
    .mm-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #f0f0f0;background:linear-gradient(135deg,#1a1a2e,#2d2d44);color:#fff;flex-shrink:0}
    .mm-drawer-header h2{margin:0;font-size:1.05rem;font-weight:700}
    .mm-drawer-close{background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:1rem;transition:.2s}
    .mm-drawer-close:hover{background:rgba(255,255,255,.3)}
    .mm-drawer-body{flex:1;overflow-y:auto;padding:24px}
    .mm-drawer-footer{padding:16px 24px;border-top:1px solid #f0f0f0;flex-shrink:0}
    .mm-field{margin-bottom:18px}
    .mm-field label{display:block;font-weight:600;font-size:.85rem;color:#374151;margin-bottom:6px}
    .mm-field .mm-hint{font-size:.78rem;color:#9ca3af;margin-top:4px}
    .mm-field input[type=text],.mm-field textarea{width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;color:#1a1a2e;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
    .mm-field input[type=text]:focus,.mm-field textarea:focus{border-color:#d4a853;outline:none;box-shadow:0 0 0 3px rgba(212,168,83,.15)}
    .mm-field textarea{resize:vertical;min-height:80px}
    .mm-field-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .mm-section-divider{border:none;border-top:1px solid #f0f0f0;margin:20px 0}
    .mm-section-label{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#9ca3af;margin-bottom:12px}
    .mm-info-box{background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:10px;padding:16px;color:#6b7280;font-size:.88rem;line-height:1.5}
    .mm-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:none;align-items:center;justify-content:center}
    .mm-modal-bg.open{display:flex}
    .mm-modal{background:#fff;border-radius:16px;padding:32px;max-width:500px;width:90%}
    .mm-modal h2{margin:0 0 8px;font-size:1.1rem;color:#1a1a2e}
    .mm-modal p{color:#6b7280;margin:0 0 24px;font-size:.9rem}
    .mm-type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .mm-type-tile{border:2px solid #e5e7eb;border-radius:12px;padding:20px 12px;text-align:center;cursor:pointer;transition:.2s}
    .mm-type-tile:hover{border-color:#d4a853;background:#fffbef}
    .mm-type-tile .mm-tile-icon{font-size:28px;display:block;margin-bottom:8px}
    .mm-type-tile .mm-tile-label{font-size:.82rem;font-weight:600;color:#374151}
    .mm-modal-cancel{margin-top:20px;background:none;border:none;color:#9ca3af;cursor:pointer;font-size:.9rem;width:100%;padding:8px}
    .mm-modal-cancel:hover{color:#6b7280}
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
    .mm-save-bar{position:sticky;bottom:0;background:#fff;border-top:1px solid #e5e7eb;padding:12px 0;margin-top:8px;text-align:right}
    .mm-settings-card .mm-field input[type=text]{width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;color:#1a1a2e;box-sizing:border-box;transition:border-color .2s;font-family:inherit}
    .mm-settings-card .mm-field input[type=text]:focus{border-color:#d4a853;outline:none;box-shadow:0 0 0 3px rgba(212,168,83,.15)}
    </style>

    <div class="mm-wrap">
        <h1>&#9889; Minimore CMS</h1>
        <p class="mm-subtitle">Manage your storefront &mdash; reorder sections, edit content, and control global settings.</p>

        <form method="post" action="options.php" id="mm-main-form">
            <?php settings_fields('minimore_settings_group'); ?>

            <input type="hidden" name="minimore_layout_order" id="mm-layout-order" value="<?php echo esc_attr($raw_order ?: json_encode(array('hero','trending','why'))); ?>" />

            <!-- Hero hidden fields -->
            <textarea name="minimore_hero_title" id="ff-hero_title" style="display:none"><?php echo esc_textarea(get_option('minimore_hero_title', 'Luxury in <em>miniature</em><br />form.')); ?></textarea>
            <textarea name="minimore_hero_subtitle" id="ff-hero_subtitle" style="display:none"><?php echo esc_textarea(get_option('minimore_hero_subtitle', 'Discover our curated collection of authentic premium cosmetic and fragrance miniatures — perfect for gifting, travel, or simply treating yourself.')); ?></textarea>
            <input type="text" name="minimore_hero_image"      id="ff-hero_image"      value="<?php echo esc_attr(get_option('minimore_hero_image','/images/hero.png')); ?>" style="display:none" />
            <input type="text" name="minimore_hero_eyebrow"    id="ff-hero_eyebrow"    value="<?php echo esc_attr(get_option('minimore_hero_eyebrow','New Arrivals 2025')); ?>" style="display:none" />
            <input type="text" name="minimore_hero_cta1_label" id="ff-hero_cta1_label" value="<?php echo esc_attr(get_option('minimore_hero_cta1_label','Shop Collection')); ?>" style="display:none" />
            <input type="text" name="minimore_hero_cta1_url"   id="ff-hero_cta1_url"   value="<?php echo esc_attr(get_option('minimore_hero_cta1_url','/products')); ?>" style="display:none" />
            <input type="text" name="minimore_hero_cta2_label" id="ff-hero_cta2_label" value="<?php echo esc_attr(get_option('minimore_hero_cta2_label','Our Story')); ?>" style="display:none" />
            <input type="text" name="minimore_hero_cta2_url"   id="ff-hero_cta2_url"   value="<?php echo esc_attr(get_option('minimore_hero_cta2_url','/about')); ?>" style="display:none" />
            <!-- Why hidden fields -->
            <input type="text" name="minimore_why_title"   id="ff-why_title"   value="<?php echo esc_attr(get_option('minimore_why_title','Why Choose Minimore?')); ?>" style="display:none" />
            <input type="text" name="minimore_why_tagline" id="ff-why_tagline" value="<?php echo esc_attr(get_option('minimore_why_tagline','Curated luxury, delivered beautifully.')); ?>" style="display:none" />
            <input type="text" name="minimore_why_f1_icon"  id="ff-why_f1_icon"  value="<?php echo esc_attr(get_option('minimore_why_f1_icon','✦')); ?>" style="display:none" />
            <input type="text" name="minimore_why_f1_title" id="ff-why_f1_title" value="<?php echo esc_attr(get_option('minimore_why_f1_title','100% Authentic')); ?>" style="display:none" />
            <textarea name="minimore_why_f1_desc" id="ff-why_f1_desc" style="display:none"><?php echo esc_textarea(get_option('minimore_why_f1_desc','Every product is guaranteed authentic, sourced directly from authorized brand distributors.')); ?></textarea>
            <input type="text" name="minimore_why_f2_icon"  id="ff-why_f2_icon"  value="<?php echo esc_attr(get_option('minimore_why_f2_icon','✈')); ?>" style="display:none" />
            <input type="text" name="minimore_why_f2_title" id="ff-why_f2_title" value="<?php echo esc_attr(get_option('minimore_why_f2_title','Travel Ready')); ?>" style="display:none" />
            <textarea name="minimore_why_f2_desc" id="ff-why_f2_desc" style="display:none"><?php echo esc_textarea(get_option('minimore_why_f2_desc','TSA-approved luxury sizes meticulously chosen for your next getaway or daily essentials.')); ?></textarea>
            <input type="text" name="minimore_why_f3_icon"  id="ff-why_f3_icon"  value="<?php echo esc_attr(get_option('minimore_why_f3_icon','🎁')); ?>" style="display:none" />
            <input type="text" name="minimore_why_f3_title" id="ff-why_f3_title" value="<?php echo esc_attr(get_option('minimore_why_f3_title','Perfect Gifting')); ?>" style="display:none" />
            <textarea name="minimore_why_f3_desc" id="ff-why_f3_desc" style="display:none"><?php echo esc_textarea(get_option('minimore_why_f3_desc','Ideal gifts for loved ones to sample the finest luxury brands without the full commitment.')); ?></textarea>
            <!-- Global hidden fields -->
            <input type="hidden" name="minimore_announcement_active" value="0" />
            <input type="checkbox" name="minimore_announcement_active" id="ff-announcement_active" value="1" <?php checked(1, get_option('minimore_announcement_active',0)); ?> style="display:none" />
            <input type="text" name="minimore_announcement_text" id="ff-announcement_text" value="<?php echo esc_attr(get_option('minimore_announcement_text','Free shipping on orders over RM150!')); ?>" style="display:none" />
            <input type="text" name="minimore_announcement_link" id="ff-announcement_link" value="<?php echo esc_attr(get_option('minimore_announcement_link','')); ?>" style="display:none" />
            <input type="hidden" name="minimore_hide_prices" value="0" />
            <input type="checkbox" name="minimore_hide_prices" id="ff-hide_prices" value="1" <?php checked(1, get_option('minimore_hide_prices',0)); ?> style="display:none" />
            <input type="hidden" name="minimore_is_coming_soon" value="0" />
            <input type="checkbox" name="minimore_is_coming_soon" id="ff-is_coming_soon" value="1" <?php checked(1, get_option('minimore_is_coming_soon',0)); ?> style="display:none" />
            <input type="text" name="minimore_footer_company"   id="ff-footer_company"   value="<?php echo esc_attr(get_option('minimore_footer_company','Minimore Sdn Bhd (1673311-U)')); ?>" style="display:none" />
            <input type="text" name="minimore_footer_tagline"   id="ff-footer_tagline"   value="<?php echo esc_attr(get_option('minimore_footer_tagline','Launching Soon @ Lalaport Bukit Bintang')); ?>" style="display:none" />
            <input type="text" name="minimore_footer_copyright" id="ff-footer_copyright" value="<?php echo esc_attr(get_option('minimore_footer_copyright','Authentic Luxury. Travel Sized.')); ?>" style="display:none" />
            <!-- Text Block hidden fields -->
            <input type="text" name="minimore_text_block_heading" id="ff-text_block_heading" value="<?php echo esc_attr(get_option('minimore_text_block_heading','Our Story')); ?>" style="display:none" />
            <textarea name="minimore_text_block_body" id="ff-text_block_body" style="display:none"><?php echo esc_textarea(get_option('minimore_text_block_body','We believe luxury should be accessible — one miniature at a time.')); ?></textarea>
            <input type="text" name="minimore_text_block_align" id="ff-text_block_align" value="<?php echo esc_attr(get_option('minimore_text_block_align','center')); ?>" style="display:none" />
            <!-- Image + Text hidden fields -->
            <input type="text" name="minimore_image_text_image"     id="ff-image_text_image"     value="<?php echo esc_attr(get_option('minimore_image_text_image','/images/hero.png')); ?>" style="display:none" />
            <input type="text" name="minimore_image_text_heading"   id="ff-image_text_heading"   value="<?php echo esc_attr(get_option('minimore_image_text_heading','Curated with care')); ?>" style="display:none" />
            <textarea name="minimore_image_text_body" id="ff-image_text_body" style="display:none"><?php echo esc_textarea(get_option('minimore_image_text_body','Every miniature in our collection is hand-picked and verified authentic.')); ?></textarea>
            <input type="text" name="minimore_image_text_cta_label" id="ff-image_text_cta_label" value="<?php echo esc_attr(get_option('minimore_image_text_cta_label','Shop Now')); ?>" style="display:none" />
            <input type="text" name="minimore_image_text_cta_url"   id="ff-image_text_cta_url"   value="<?php echo esc_attr(get_option('minimore_image_text_cta_url','/products')); ?>" style="display:none" />
            <input type="hidden" name="minimore_image_text_reverse" value="0" />
            <input type="checkbox" name="minimore_image_text_reverse" id="ff-image_text_reverse" value="1" <?php checked(1, get_option('minimore_image_text_reverse',0)); ?> style="display:none" />
            <!-- CTA Banner hidden fields -->
            <input type="text" name="minimore_cta_banner_bg"          id="ff-cta_banner_bg"          value="<?php echo esc_attr(get_option('minimore_cta_banner_bg','/images/hero.png')); ?>" style="display:none" />
            <input type="text" name="minimore_cta_banner_heading"      id="ff-cta_banner_heading"      value="<?php echo esc_attr(get_option('minimore_cta_banner_heading','New Arrivals Just Dropped')); ?>" style="display:none" />
            <input type="text" name="minimore_cta_banner_subheading"   id="ff-cta_banner_subheading"   value="<?php echo esc_attr(get_option('minimore_cta_banner_subheading','Explore our latest luxury miniatures')); ?>" style="display:none" />
            <input type="text" name="minimore_cta_banner_btn_label"    id="ff-cta_banner_btn_label"    value="<?php echo esc_attr(get_option('minimore_cta_banner_btn_label','Shop Now')); ?>" style="display:none" />
            <input type="text" name="minimore_cta_banner_btn_url"      id="ff-cta_banner_btn_url"      value="<?php echo esc_attr(get_option('minimore_cta_banner_btn_url','/products')); ?>" style="display:none" />
            <!-- Testimonials hidden fields -->
            <input type="text" name="minimore_testimonials_title"   id="ff-testimonials_title"   value="<?php echo esc_attr(get_option('minimore_testimonials_title','What Our Customers Say')); ?>" style="display:none" />
            <input type="text" name="minimore_testimonials_1_name"  id="ff-testimonials_1_name"  value="<?php echo esc_attr(get_option('minimore_testimonials_1_name','Sarah L.')); ?>" style="display:none" />
            <textarea name="minimore_testimonials_1_quote" id="ff-testimonials_1_quote" style="display:none"><?php echo esc_textarea(get_option('minimore_testimonials_1_quote','Absolutely love the quality! My perfume miniatures arrived perfectly packaged and smell divine.')); ?></textarea>
            <input type="text" name="minimore_testimonials_1_stars" id="ff-testimonials_1_stars" value="<?php echo esc_attr(get_option('minimore_testimonials_1_stars','5')); ?>" style="display:none" />
            <input type="text" name="minimore_testimonials_2_name"  id="ff-testimonials_2_name"  value="<?php echo esc_attr(get_option('minimore_testimonials_2_name','Aisha R.')); ?>" style="display:none" />
            <textarea name="minimore_testimonials_2_quote" id="ff-testimonials_2_quote" style="display:none"><?php echo esc_textarea(get_option('minimore_testimonials_2_quote','Perfect for gifting! I bought a set as a birthday present and she was thrilled. Will definitely order again.')); ?></textarea>
            <input type="text" name="minimore_testimonials_2_stars" id="ff-testimonials_2_stars" value="<?php echo esc_attr(get_option('minimore_testimonials_2_stars','5')); ?>" style="display:none" />
            <input type="text" name="minimore_testimonials_3_name"  id="ff-testimonials_3_name"  value="<?php echo esc_attr(get_option('minimore_testimonials_3_name','Wei Lin T.')); ?>" style="display:none" />
            <textarea name="minimore_testimonials_3_quote" id="ff-testimonials_3_quote" style="display:none"><?php echo esc_textarea(get_option('minimore_testimonials_3_quote','Great way to try luxury brands before committing to a full size. The curation is spot on!')); ?></textarea>
            <input type="text" name="minimore_testimonials_3_stars" id="ff-testimonials_3_stars" value="<?php echo esc_attr(get_option('minimore_testimonials_3_stars','5')); ?>" style="display:none" />
            <!-- Marquee hidden fields -->
            <input type="text" name="minimore_marquee_items" id="ff-marquee_items" value="<?php echo esc_attr(get_option('minimore_marquee_items','100% Authentic, Travel Ready, Luxury Miniatures, Perfect Gifts, Free Shipping Over RM150')); ?>" style="display:none" />
            <input type="text" name="minimore_marquee_speed" id="ff-marquee_speed" value="<?php echo esc_attr(get_option('minimore_marquee_speed','normal')); ?>" style="display:none" />
            <!-- Category Tiles hidden fields -->
            <input type="text" name="minimore_cat_tiles_title"   id="ff-cat_tiles_title"   value="<?php echo esc_attr(get_option('minimore_cat_tiles_title','Shop by Category')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_1_image"  id="ff-cat_tile_1_image"  value="<?php echo esc_attr(get_option('minimore_cat_tile_1_image','/images/skincare.png')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_1_label"  id="ff-cat_tile_1_label"  value="<?php echo esc_attr(get_option('minimore_cat_tile_1_label','Skincare')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_1_url"    id="ff-cat_tile_1_url"    value="<?php echo esc_attr(get_option('minimore_cat_tile_1_url','/products?category=skincare')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_2_image"  id="ff-cat_tile_2_image"  value="<?php echo esc_attr(get_option('minimore_cat_tile_2_image','/images/skincare.png')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_2_label"  id="ff-cat_tile_2_label"  value="<?php echo esc_attr(get_option('minimore_cat_tile_2_label','Fragrances')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_2_url"    id="ff-cat_tile_2_url"    value="<?php echo esc_attr(get_option('minimore_cat_tile_2_url','/products?category=fragrances')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_3_image"  id="ff-cat_tile_3_image"  value="<?php echo esc_attr(get_option('minimore_cat_tile_3_image','/images/skincare.png')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_3_label"  id="ff-cat_tile_3_label"  value="<?php echo esc_attr(get_option('minimore_cat_tile_3_label','Cosmetics')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_3_url"    id="ff-cat_tile_3_url"    value="<?php echo esc_attr(get_option('minimore_cat_tile_3_url','/products?category=cosmetics')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_4_image"  id="ff-cat_tile_4_image"  value="<?php echo esc_attr(get_option('minimore_cat_tile_4_image','/images/skincare.png')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_4_label"  id="ff-cat_tile_4_label"  value="<?php echo esc_attr(get_option('minimore_cat_tile_4_label','Gift Sets')); ?>" style="display:none" />
            <input type="text" name="minimore_cat_tile_4_url"    id="ff-cat_tile_4_url"    value="<?php echo esc_attr(get_option('minimore_cat_tile_4_url','/products?category=gifts')); ?>" style="display:none" />

            <!-- Tabs -->
            <div class="mm-tabs">
                <button type="button" class="mm-tab active" data-tab="builder">&#128208; Page Builder</button>
                <button type="button" class="mm-tab" data-tab="global">&#9881; Global Settings</button>
            </div>

            <!-- TAB 1: PAGE BUILDER -->
            <div class="mm-tab-content active" id="mm-tab-builder">
                <div class="mm-section-list" id="mm-list">
                    <?php foreach ($layout_order as $key):
                        if (!isset($section_meta[$key])) continue;
                        $m = $section_meta[$key];
                    ?>
                    <div class="mm-card" draggable="true" data-key="<?php echo esc_attr($key); ?>">
                        <span class="mm-drag-handle" title="Drag to reorder">&#8919;</span>
                        <div class="mm-card-badge" style="background:<?php echo esc_attr($m['color']); ?>22;">
                            <?php echo $m['icon']; ?>
                        </div>
                        <div class="mm-card-info">
                            <div class="mm-card-title"><?php echo esc_html($m['label']); ?></div>
                            <div class="mm-card-type"><?php echo esc_html($key); ?></div>
                        </div>
                        <div class="mm-card-actions">
                            <button type="button" class="mm-btn-edit" data-section="<?php echo esc_attr($key); ?>">&#9998; Edit</button>
                            <button type="button" class="mm-btn-delete">&#128465;</button>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>

                <button type="button" class="mm-add-btn" id="mm-add-section">
                    <span>&#65291;</span> Add Section
                </button>

                <div class="mm-save-bar">
                    <?php submit_button('Save Changes', 'primary', 'submit', false); ?>
                </div>
            </div>

            <!-- TAB 2: GLOBAL SETTINGS -->
            <div class="mm-tab-content" id="mm-tab-global">

                <div class="mm-settings-card">
                    <h3>&#128640; Coming Soon Overlay</h3>
                    <div class="mm-toggle-row">
                        <label class="mm-toggle">
                            <input type="checkbox" id="ui-is_coming_soon" <?php checked(1, get_option('minimore_is_coming_soon',0)); ?> />
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
                            <input type="checkbox" id="ui-hide_prices" <?php checked(1, get_option('minimore_hide_prices',0)); ?> />
                            <span class="mm-toggle-slider"></span>
                        </label>
                        <span class="mm-toggle-label">Hide All Product Prices</span>
                    </div>
                    <p style="color:#9ca3af;font-size:.85rem;margin:8px 0 0;">When enabled, prices are hidden across the entire storefront (homepage cards, shop page, product detail pages, and related products).</p>
                </div>

                <div class="mm-settings-card">
                    <h3>&#128226; Announcement Bar</h3>
                    <div class="mm-toggle-row" style="margin-bottom:16px;">
                        <label class="mm-toggle">
                            <input type="checkbox" id="ui-announcement_active" <?php checked(1, get_option('minimore_announcement_active',0)); ?> />
                            <span class="mm-toggle-slider"></span>
                        </label>
                        <span class="mm-toggle-label">Show Announcement Bar</span>
                    </div>
                    <div class="mm-field">
                        <label>Message Text</label>
                        <input type="text" id="ui-announcement_text" value="<?php echo esc_attr(get_option('minimore_announcement_text','Free shipping on orders over RM150!')); ?>" placeholder="e.g. Free shipping on orders over RM150!" />
                    </div>
                    <div class="mm-field">
                        <label>Link URL <span style="font-weight:400;color:#9ca3af">(optional)</span></label>
                        <input type="text" id="ui-announcement_link" value="<?php echo esc_attr(get_option('minimore_announcement_link','')); ?>" placeholder="e.g. /products" />
                    </div>
                </div>

                <div class="mm-settings-card">
                    <h3>&#128279; Footer</h3>
                    <div class="mm-field">
                        <label>Company Name &amp; Registration</label>
                        <input type="text" id="ui-footer_company" value="<?php echo esc_attr(get_option('minimore_footer_company','Minimore Sdn Bhd (1673311-U)')); ?>" />
                    </div>
                    <div class="mm-field">
                        <label>Sub-tagline (under logo)</label>
                        <input type="text" id="ui-footer_tagline" value="<?php echo esc_attr(get_option('minimore_footer_tagline','Launching Soon @ Lalaport Bukit Bintang')); ?>" />
                    </div>
                    <div class="mm-field">
                        <label>Copyright Tagline</label>
                        <input type="text" id="ui-footer_copyright" value="<?php echo esc_attr(get_option('minimore_footer_copyright','Authentic Luxury. Travel Sized.')); ?>" />
                    </div>
                </div>

                <div class="mm-save-bar">
                    <?php submit_button('Save Changes', 'primary', 'submit', false); ?>
                </div>
            </div>
        </form>
    </div>

    <!-- Drawer -->
    <div class="mm-overlay" id="mm-overlay"></div>
    <div class="mm-drawer" id="mm-drawer">
        <div class="mm-drawer-header">
            <h2 id="mm-drawer-title">Edit Section</h2>
            <button class="mm-drawer-close" id="mm-drawer-close">&#10005;</button>
        </div>
        <div class="mm-drawer-body" id="mm-drawer-body"></div>
        <div class="mm-drawer-footer">
            <button type="button" id="mm-drawer-save" style="width:100%;padding:10px;font-size:.95rem;background:#d4a853;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;">&#10003; Apply &amp; Save</button>
        </div>
    </div>

    <!-- Add Section Modal -->
    <div class="mm-modal-bg" id="mm-add-modal">
        <div class="mm-modal">
            <h2>Add a Section</h2>
            <p>Choose which type of section to add to your homepage.</p>
            <div class="mm-type-grid">
                <div class="mm-type-tile" data-add="hero">
                    <span class="mm-tile-icon">&#128444;</span>
                    <span class="mm-tile-label">Hero Banner</span>
                </div>
                <div class="mm-type-tile" data-add="trending">
                    <span class="mm-tile-icon">&#128717;</span>
                    <span class="mm-tile-label">Trending Miniatures</span>
                </div>
                <div class="mm-type-tile" data-add="why">
                    <span class="mm-tile-icon">&#10024;</span>
                    <span class="mm-tile-label">Why Minimore</span>
                </div>
                <div class="mm-type-tile" data-add="text_block">
                    <span class="mm-tile-icon">&#128221;</span>
                    <span class="mm-tile-label">Text Block</span>
                </div>
                <div class="mm-type-tile" data-add="image_text">
                    <span class="mm-tile-icon">&#9974;</span>
                    <span class="mm-tile-label">Image + Text</span>
                </div>
                <div class="mm-type-tile" data-add="cta_banner">
                    <span class="mm-tile-icon">&#127919;</span>
                    <span class="mm-tile-label">CTA Banner</span>
                </div>
                <div class="mm-type-tile" data-add="testimonials">
                    <span class="mm-tile-icon">&#128172;</span>
                    <span class="mm-tile-label">Testimonials</span>
                </div>
                <div class="mm-type-tile" data-add="marquee">
                    <span class="mm-tile-icon">&#127991;</span>
                    <span class="mm-tile-label">Marquee Strip</span>
                </div>
                <div class="mm-type-tile" data-add="cat_tiles">
                    <span class="mm-tile-icon">&#128193;</span>
                    <span class="mm-tile-label">Category Tiles</span>
                </div>
            </div>
            <button class="mm-modal-cancel" id="mm-modal-cancel">Cancel</button>
        </div>
    </div>

    <script>
    (function() {
        var meta = <?php echo json_encode($section_meta); ?>;

        var saveMap = {
            'ui-hero_title':         'ff-hero_title',
            'ui-hero_subtitle':      'ff-hero_subtitle',
            'ui-hero_eyebrow':       'ff-hero_eyebrow',
            'ui-hero_image':         'ff-hero_image',
            'ui-hero_cta1_label':    'ff-hero_cta1_label',
            'ui-hero_cta1_url':      'ff-hero_cta1_url',
            'ui-hero_cta2_label':    'ff-hero_cta2_label',
            'ui-hero_cta2_url':      'ff-hero_cta2_url',
            'ui-why_title':          'ff-why_title',
            'ui-why_tagline':        'ff-why_tagline',
            'ui-why_f1_icon':        'ff-why_f1_icon',
            'ui-why_f1_title':       'ff-why_f1_title',
            'ui-why_f1_desc':        'ff-why_f1_desc',
            'ui-why_f2_icon':        'ff-why_f2_icon',
            'ui-why_f2_title':       'ff-why_f2_title',
            'ui-why_f2_desc':        'ff-why_f2_desc',
            'ui-why_f3_icon':             'ff-why_f3_icon',
            'ui-why_f3_title':            'ff-why_f3_title',
            'ui-why_f3_desc':             'ff-why_f3_desc',
            'ui-announcement_text':       'ff-announcement_text',
            'ui-announcement_link':       'ff-announcement_link',
            'ui-footer_company':          'ff-footer_company',
            'ui-footer_tagline':          'ff-footer_tagline',
            'ui-footer_copyright':        'ff-footer_copyright',
            'ui-text_block_heading':      'ff-text_block_heading',
            'ui-text_block_body':         'ff-text_block_body',
            'ui-text_block_align':        'ff-text_block_align',
            'ui-image_text_image':        'ff-image_text_image',
            'ui-image_text_heading':      'ff-image_text_heading',
            'ui-image_text_body':         'ff-image_text_body',
            'ui-image_text_cta_label':    'ff-image_text_cta_label',
            'ui-image_text_cta_url':      'ff-image_text_cta_url',
            'ui-cta_banner_bg':           'ff-cta_banner_bg',
            'ui-cta_banner_heading':      'ff-cta_banner_heading',
            'ui-cta_banner_subheading':   'ff-cta_banner_subheading',
            'ui-cta_banner_btn_label':    'ff-cta_banner_btn_label',
            'ui-cta_banner_btn_url':      'ff-cta_banner_btn_url',
            'ui-testimonials_title':      'ff-testimonials_title',
            'ui-testimonials_1_name':     'ff-testimonials_1_name',
            'ui-testimonials_1_quote':    'ff-testimonials_1_quote',
            'ui-testimonials_1_stars':    'ff-testimonials_1_stars',
            'ui-testimonials_2_name':     'ff-testimonials_2_name',
            'ui-testimonials_2_quote':    'ff-testimonials_2_quote',
            'ui-testimonials_2_stars':    'ff-testimonials_2_stars',
            'ui-testimonials_3_name':     'ff-testimonials_3_name',
            'ui-testimonials_3_quote':    'ff-testimonials_3_quote',
            'ui-testimonials_3_stars':    'ff-testimonials_3_stars',
            'ui-marquee_items':           'ff-marquee_items',
            'ui-marquee_speed':           'ff-marquee_speed',
            'ui-cat_tiles_title':         'ff-cat_tiles_title',
            'ui-cat_tile_1_image':        'ff-cat_tile_1_image',
            'ui-cat_tile_1_label':        'ff-cat_tile_1_label',
            'ui-cat_tile_1_url':          'ff-cat_tile_1_url',
            'ui-cat_tile_2_image':        'ff-cat_tile_2_image',
            'ui-cat_tile_2_label':        'ff-cat_tile_2_label',
            'ui-cat_tile_2_url':          'ff-cat_tile_2_url',
            'ui-cat_tile_3_image':        'ff-cat_tile_3_image',
            'ui-cat_tile_3_label':        'ff-cat_tile_3_label',
            'ui-cat_tile_3_url':          'ff-cat_tile_3_url',
            'ui-cat_tile_4_image':        'ff-cat_tile_4_image',
            'ui-cat_tile_4_label':        'ff-cat_tile_4_label',
            'ui-cat_tile_4_url':          'ff-cat_tile_4_url'
        };
        var toggleMap = {
            'ui-announcement_active':  'ff-announcement_active',
            'ui-is_coming_soon':       'ff-is_coming_soon',
            'ui-hide_prices':          'ff-hide_prices',
            'ui-image_text_reverse':   'ff-image_text_reverse'
        };


        function el(id) { return document.getElementById(id); }
        function val(id) { var e = el(id); return e ? (e.tagName === 'TEXTAREA' ? e.value : e.value) : ''; }
        function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

        // Tabs
        document.querySelectorAll('.mm-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.mm-tab').forEach(function(b){ b.classList.remove('active'); });
                document.querySelectorAll('.mm-tab-content').forEach(function(c){ c.classList.remove('active'); });
                btn.classList.add('active');
                var target = el('mm-tab-' + btn.dataset.tab);
                if (target) target.classList.add('active');
            });
        });

        // Drawer templates
        function getTemplate(key) {
            if (key === 'hero') return (
                '<div class="mm-section-label">HERO CONTENT</div>' +
                '<div class="mm-field"><label>Main Title <span style="color:#9ca3af;font-weight:400">(HTML: use &lt;em&gt; for italic)</span></label>' +
                '<textarea id="ui-hero_title" rows="3">' + esc(val('ff-hero_title')) + '</textarea></div>' +
                '<div class="mm-field"><label>Subtitle</label>' +
                '<textarea id="ui-hero_subtitle" rows="3">' + esc(val('ff-hero_subtitle')) + '</textarea></div>' +
                '<div class="mm-field"><label>Eyebrow Label</label>' +
                '<input type="text" id="ui-hero_eyebrow" value="' + esc(val('ff-hero_eyebrow')) + '" placeholder="e.g. New Arrivals 2025" /></div>' +
                '<div class="mm-field"><label>Background Image URL</label>' +
                '<input type="text" id="ui-hero_image" value="' + esc(val('ff-hero_image')) + '" placeholder="/images/hero.png" />' +
                '<div class="mm-hint">Relative path from /public or a full URL.</div></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">CTA BUTTONS</div>' +
                '<div class="mm-field"><label>Button 1</label><div class="mm-field-row">' +
                '<input type="text" id="ui-hero_cta1_label" value="' + esc(val('ff-hero_cta1_label')) + '" placeholder="Label" />' +
                '<input type="text" id="ui-hero_cta1_url"   value="' + esc(val('ff-hero_cta1_url'))   + '" placeholder="URL" /></div></div>' +
                '<div class="mm-field"><label>Button 2</label><div class="mm-field-row">' +
                '<input type="text" id="ui-hero_cta2_label" value="' + esc(val('ff-hero_cta2_label')) + '" placeholder="Label" />' +
                '<input type="text" id="ui-hero_cta2_url"   value="' + esc(val('ff-hero_cta2_url'))   + '" placeholder="URL" /></div></div>'
            );
            if (key === 'trending') return (
                '<div class="mm-info-box"><strong>&#128717; Trending Miniatures</strong><br><br>' +
                'This section automatically pulls your 3 most recent WooCommerce products and displays them as product cards.<br><br>' +
                'To manage which products appear, go to <strong>WooCommerce &rarr; Products</strong> and adjust the order or publish status of your items there.</div>'
            );
            if (key === 'why') return (
                '<div class="mm-section-label">SECTION HEADING</div>' +
                '<div class="mm-field"><label>Title</label><input type="text" id="ui-why_title" value="' + esc(val('ff-why_title')) + '" /></div>' +
                '<div class="mm-field"><label>Tagline</label><input type="text" id="ui-why_tagline" value="' + esc(val('ff-why_tagline')) + '" /></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">FEATURE 1</div>' +
                '<div class="mm-field"><div class="mm-field-row">' +
                '<div><label>Icon/Emoji</label><input type="text" id="ui-why_f1_icon" value="' + esc(val('ff-why_f1_icon')) + '" /></div>' +
                '<div><label>Title</label><input type="text" id="ui-why_f1_title" value="' + esc(val('ff-why_f1_title')) + '" /></div></div></div>' +
                '<div class="mm-field"><label>Description</label><textarea id="ui-why_f1_desc" rows="2">' + esc(val('ff-why_f1_desc')) + '</textarea></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">FEATURE 2</div>' +
                '<div class="mm-field"><div class="mm-field-row">' +
                '<div><label>Icon/Emoji</label><input type="text" id="ui-why_f2_icon" value="' + esc(val('ff-why_f2_icon')) + '" /></div>' +
                '<div><label>Title</label><input type="text" id="ui-why_f2_title" value="' + esc(val('ff-why_f2_title')) + '" /></div></div></div>' +
                '<div class="mm-field"><label>Description</label><textarea id="ui-why_f2_desc" rows="2">' + esc(val('ff-why_f2_desc')) + '</textarea></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">FEATURE 3</div>' +
                '<div class="mm-field"><div class="mm-field-row">' +
                '<div><label>Icon/Emoji</label><input type="text" id="ui-why_f3_icon" value="' + esc(val('ff-why_f3_icon')) + '" /></div>' +
                '<div><label>Title</label><input type="text" id="ui-why_f3_title" value="' + esc(val('ff-why_f3_title')) + '" /></div></div></div>' +
                '<div class="mm-field"><label>Description</label><textarea id="ui-why_f3_desc" rows="2">' + esc(val('ff-why_f3_desc')) + '</textarea></div>'
            );
            if (key === 'text_block') return (
                '<div class="mm-section-label">TEXT CONTENT</div>' +
                '<div class="mm-field"><label>Heading</label><input type="text" id="ui-text_block_heading" value="' + esc(val('ff-text_block_heading')) + '" /></div>' +
                '<div class="mm-field"><label>Body Text</label><textarea id="ui-text_block_body" rows="4">' + esc(val('ff-text_block_body')) + '</textarea></div>' +
                '<div class="mm-field"><label>Text Alignment</label>' +
                '<select id="ui-text_block_align" style="width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;">' +
                '<option value="center"' + (val('ff-text_block_align')==='center'?' selected':'') + '>Center</option>' +
                '<option value="left"' + (val('ff-text_block_align')==='left'?' selected':'') + '>Left</option>' +
                '</select></div>'
            );
            if (key === 'image_text') return (
                '<div class="mm-section-label">IMAGE</div>' +
                '<div class="mm-field"><label>Image URL</label><input type="text" id="ui-image_text_image" value="' + esc(val('ff-image_text_image')) + '" placeholder="/images/example.png" /><div class="mm-hint">Relative path from /public or full URL.</div></div>' +
                '<div class="mm-field"><label><input type="checkbox" id="ui-image_text_reverse" style="margin-right:6px;display:inline"' + (el('ff-image_text_reverse') && el('ff-image_text_reverse').checked ? ' checked' : '') + '/>Image on the Right</label><div class="mm-hint">Unchecked = image left, checked = image right.</div></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">TEXT CONTENT</div>' +
                '<div class="mm-field"><label>Heading</label><input type="text" id="ui-image_text_heading" value="' + esc(val('ff-image_text_heading')) + '" /></div>' +
                '<div class="mm-field"><label>Body</label><textarea id="ui-image_text_body" rows="3">' + esc(val('ff-image_text_body')) + '</textarea></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">BUTTON</div>' +
                '<div class="mm-field"><div class="mm-field-row">' +
                '<input type="text" id="ui-image_text_cta_label" value="' + esc(val('ff-image_text_cta_label')) + '" placeholder="Button Label" />' +
                '<input type="text" id="ui-image_text_cta_url"   value="' + esc(val('ff-image_text_cta_url'))   + '" placeholder="/products" /></div></div>'
            );
            if (key === 'cta_banner') return (
                '<div class="mm-section-label">BACKGROUND</div>' +
                '<div class="mm-field"><label>Background Image URL</label><input type="text" id="ui-cta_banner_bg" value="' + esc(val('ff-cta_banner_bg')) + '" placeholder="/images/hero.png" /></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">CONTENT</div>' +
                '<div class="mm-field"><label>Heading</label><input type="text" id="ui-cta_banner_heading" value="' + esc(val('ff-cta_banner_heading')) + '" /></div>' +
                '<div class="mm-field"><label>Sub-heading</label><input type="text" id="ui-cta_banner_subheading" value="' + esc(val('ff-cta_banner_subheading')) + '" /></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">BUTTON</div>' +
                '<div class="mm-field"><div class="mm-field-row">' +
                '<input type="text" id="ui-cta_banner_btn_label" value="' + esc(val('ff-cta_banner_btn_label')) + '" placeholder="Shop Now" />' +
                '<input type="text" id="ui-cta_banner_btn_url"   value="' + esc(val('ff-cta_banner_btn_url'))   + '" placeholder="/products" /></div></div>'
            );
            if (key === 'testimonials') return (
                '<div class="mm-field"><label>Section Title</label><input type="text" id="ui-testimonials_title" value="' + esc(val('ff-testimonials_title')) + '" /></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">REVIEW 1</div>' +
                '<div class="mm-field"><div class="mm-field-row"><div><label>Name</label><input type="text" id="ui-testimonials_1_name" value="' + esc(val('ff-testimonials_1_name')) + '" /></div><div><label>Stars (1–5)</label><input type="text" id="ui-testimonials_1_stars" value="' + esc(val('ff-testimonials_1_stars')) + '" placeholder="5" /></div></div></div>' +
                '<div class="mm-field"><label>Quote</label><textarea id="ui-testimonials_1_quote" rows="2">' + esc(val('ff-testimonials_1_quote')) + '</textarea></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">REVIEW 2</div>' +
                '<div class="mm-field"><div class="mm-field-row"><div><label>Name</label><input type="text" id="ui-testimonials_2_name" value="' + esc(val('ff-testimonials_2_name')) + '" /></div><div><label>Stars (1–5)</label><input type="text" id="ui-testimonials_2_stars" value="' + esc(val('ff-testimonials_2_stars')) + '" placeholder="5" /></div></div></div>' +
                '<div class="mm-field"><label>Quote</label><textarea id="ui-testimonials_2_quote" rows="2">' + esc(val('ff-testimonials_2_quote')) + '</textarea></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">REVIEW 3</div>' +
                '<div class="mm-field"><div class="mm-field-row"><div><label>Name</label><input type="text" id="ui-testimonials_3_name" value="' + esc(val('ff-testimonials_3_name')) + '" /></div><div><label>Stars (1–5)</label><input type="text" id="ui-testimonials_3_stars" value="' + esc(val('ff-testimonials_3_stars')) + '" placeholder="5" /></div></div></div>' +
                '<div class="mm-field"><label>Quote</label><textarea id="ui-testimonials_3_quote" rows="2">' + esc(val('ff-testimonials_3_quote')) + '</textarea></div>'
            );
            if (key === 'marquee') return (
                '<div class="mm-field"><label>Marquee Items <span style="color:#9ca3af;font-weight:400">(comma-separated)</span></label>' +
                '<textarea id="ui-marquee_items" rows="3">' + esc(val('ff-marquee_items')) + '</textarea>' +
                '<div class="mm-hint">e.g. 100% Authentic, Travel Ready, Luxury Miniatures</div></div>' +
                '<div class="mm-field"><label>Scroll Speed</label>' +
                '<select id="ui-marquee_speed" style="width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:.9rem;">' +
                '<option value="slow"'   + (val('ff-marquee_speed')==='slow'  ?' selected':'') + '>Slow</option>' +
                '<option value="normal"' + (val('ff-marquee_speed')==='normal'?' selected':'') + '>Normal</option>' +
                '<option value="fast"'   + (val('ff-marquee_speed')==='fast'  ?' selected':'') + '>Fast</option>' +
                '</select></div>'
            );
            if (key === 'cat_tiles') return (
                '<div class="mm-field"><label>Section Title</label><input type="text" id="ui-cat_tiles_title" value="' + esc(val('ff-cat_tiles_title')) + '" /></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">TILE 1</div>' +
                '<div class="mm-field"><label>Image URL</label><input type="text" id="ui-cat_tile_1_image" value="' + esc(val('ff-cat_tile_1_image')) + '" /></div>' +
                '<div class="mm-field"><div class="mm-field-row"><div><label>Label</label><input type="text" id="ui-cat_tile_1_label" value="' + esc(val('ff-cat_tile_1_label')) + '" /></div><div><label>URL</label><input type="text" id="ui-cat_tile_1_url" value="' + esc(val('ff-cat_tile_1_url')) + '" /></div></div></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">TILE 2</div>' +
                '<div class="mm-field"><label>Image URL</label><input type="text" id="ui-cat_tile_2_image" value="' + esc(val('ff-cat_tile_2_image')) + '" /></div>' +
                '<div class="mm-field"><div class="mm-field-row"><div><label>Label</label><input type="text" id="ui-cat_tile_2_label" value="' + esc(val('ff-cat_tile_2_label')) + '" /></div><div><label>URL</label><input type="text" id="ui-cat_tile_2_url" value="' + esc(val('ff-cat_tile_2_url')) + '" /></div></div></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">TILE 3</div>' +
                '<div class="mm-field"><label>Image URL</label><input type="text" id="ui-cat_tile_3_image" value="' + esc(val('ff-cat_tile_3_image')) + '" /></div>' +
                '<div class="mm-field"><div class="mm-field-row"><div><label>Label</label><input type="text" id="ui-cat_tile_3_label" value="' + esc(val('ff-cat_tile_3_label')) + '" /></div><div><label>URL</label><input type="text" id="ui-cat_tile_3_url" value="' + esc(val('ff-cat_tile_3_url')) + '" /></div></div></div>' +
                '<hr class="mm-section-divider"><div class="mm-section-label">TILE 4</div>' +
                '<div class="mm-field"><label>Image URL</label><input type="text" id="ui-cat_tile_4_image" value="' + esc(val('ff-cat_tile_4_image')) + '" /></div>' +
                '<div class="mm-field"><div class="mm-field-row"><div><label>Label</label><input type="text" id="ui-cat_tile_4_label" value="' + esc(val('ff-cat_tile_4_label')) + '" /></div><div><label>URL</label><input type="text" id="ui-cat_tile_4_url" value="' + esc(val('ff-cat_tile_4_url')) + '" /></div></div></div>'
            );
            return '<p>No editable settings for this section.</p>';
        }

        // Open/close drawer
        var overlay = el('mm-overlay'), drawer = el('mm-drawer');
        function openDrawer(key) {
            var m = meta[key] || {};
            el('mm-drawer-title').textContent = (m.label || key) + ' Settings';
            el('mm-drawer-body').innerHTML = getTemplate(key);
            drawer.classList.add('open');
            overlay.classList.add('open');
        }
        function closeDrawer() {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
        }
        el('mm-drawer-close').addEventListener('click', closeDrawer);
        overlay.addEventListener('click', closeDrawer);

        // Apply drawer → save
        el('mm-drawer-save').addEventListener('click', function() {
            Object.keys(saveMap).forEach(function(uid) {
                var uiEl = el(uid), ffEl = el(saveMap[uid]);
                if (uiEl && ffEl) ffEl.value = uiEl.value;
            });
            Object.keys(toggleMap).forEach(function(uid) {
                var uiEl = el(uid), ffEl = el(toggleMap[uid]);
                if (uiEl && ffEl) ffEl.checked = uiEl.checked;
            });
            closeDrawer();
            el('mm-main-form').submit();
        });

        // Mirror global settings inputs → hidden fields
        ['ui-is_coming_soon','ui-hide_prices','ui-announcement_active'].forEach(function(uid) {
            var uiEl = el(uid);
            if (uiEl) uiEl.addEventListener('change', function() {
                var ffEl = el(toggleMap[uid]);
                if (ffEl) ffEl.checked = uiEl.checked;
            });
        });
        ['ui-announcement_text','ui-announcement_link','ui-footer_company','ui-footer_tagline','ui-footer_copyright'].forEach(function(uid) {
            var uiEl = el(uid);
            if (uiEl) uiEl.addEventListener('input', function() {
                var ffEl = el(saveMap[uid]);
                if (ffEl) ffEl.value = uiEl.value;
            });
        });

        // Card edit & delete
        document.addEventListener('click', function(e) {
            var editBtn = e.target.closest('.mm-btn-edit');
            if (editBtn) { openDrawer(editBtn.dataset.section); return; }
            var delBtn = e.target.closest('.mm-btn-delete');
            if (delBtn) { var c = delBtn.closest('.mm-card'); if (c) { c.remove(); syncOrder(); } }
        });

        // Native HTML5 drag-and-drop
        var dragging = null;
        document.addEventListener('dragstart', function(e) {
            var card = e.target.closest('.mm-card[draggable]');
            if (!card) return;
            dragging = card;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(function(){ if (dragging) dragging.classList.add('dragging'); }, 0);
        });
        document.addEventListener('dragend', function() {
            if (dragging) { dragging.classList.remove('dragging'); dragging = null; }
            document.querySelectorAll('.mm-card.drag-over').forEach(function(c){ c.classList.remove('drag-over'); });
        });
        document.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (!dragging) return;
            var over = e.target.closest('.mm-card');
            if (!over || over === dragging) return;
            document.querySelectorAll('.mm-card.drag-over').forEach(function(c){ c.classList.remove('drag-over'); });
            over.classList.add('drag-over');
            var list = el('mm-list');
            var cards = Array.from(list.querySelectorAll('.mm-card'));
            var dIdx = cards.indexOf(dragging), oIdx = cards.indexOf(over);
            if (dIdx < oIdx) over.insertAdjacentElement('afterend', dragging);
            else             over.insertAdjacentElement('beforebegin', dragging);
            syncOrder();
        });

        // Add section modal
        el('mm-add-section').addEventListener('click', function() { el('mm-add-modal').classList.add('open'); });
        el('mm-modal-cancel').addEventListener('click', function() { el('mm-add-modal').classList.remove('open'); });
        document.querySelectorAll('.mm-type-tile').forEach(function(tile) {
            tile.addEventListener('click', function() {
                var key = tile.dataset.add, m = meta[key];
                if (!m) return;
                var card = document.createElement('div');
                card.className = 'mm-card'; card.draggable = true; card.dataset.key = key;
                card.innerHTML =
                    '<span class="mm-drag-handle" title="Drag to reorder">&#8919;</span>' +
                    '<div class="mm-card-badge" style="background:' + m.color + '22;">' + m.icon + '</div>' +
                    '<div class="mm-card-info">' +
                        '<div class="mm-card-title">' + m.label + '</div>' +
                        '<div class="mm-card-type">' + key + '</div>' +
                    '</div>' +
                    '<div class="mm-card-actions">' +
                        '<button type="button" class="mm-btn-edit" data-section="' + key + '">&#9998; Edit</button>' +
                        '<button type="button" class="mm-btn-delete">&#128465;</button>' +
                    '</div>';
                el('mm-list').appendChild(card);
                el('mm-add-modal').classList.remove('open');
                syncOrder();
            });
        });

        function syncOrder() {
            var keys = [];
            el('mm-list').querySelectorAll('.mm-card').forEach(function(c){ keys.push(c.dataset.key); });
            el('mm-layout-order').value = JSON.stringify(keys);
        }
        syncOrder();
    })();
    </script>
    <?php
}

// ---------------------------------------------------------
// 2. Register REST API Endpoint
// ---------------------------------------------------------
add_action('rest_api_init', function () {
    register_rest_route('minimore/v1', '/homepage', array(
        'methods' => 'GET',
        'callback' => 'minimore_get_homepage_data',
        'permission_callback' => '__return_true'
    ));
});

function minimore_get_homepage_data() {
    $raw_order = get_option('minimore_layout_order', '');
    if ($raw_order) {
        $section_order = json_decode($raw_order, true);
        if (!is_array($section_order)) $section_order = array('hero', 'trending', 'why');
    } else {
        $section_order = array(
            get_option('minimore_section_1', 'hero'),
            get_option('minimore_section_2', 'trending'),
            get_option('minimore_section_3', 'why'),
        );
    }
    return array(
        'is_coming_soon'  => (bool) get_option('minimore_is_coming_soon', 0),
        'section_order'   => $section_order,
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
        'hide_prices'  => (bool) get_option('minimore_hide_prices', 0),
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

// ---------------------------------------------------------
// 2.5 Auto-Create Standard Pages
// ---------------------------------------------------------
add_action('rest_api_init', function () {
    register_rest_route('minimore/v1', '/sitewide', array(
        'methods'             => 'GET',
        'callback'            => 'minimore_get_sitewide_data',
        'permission_callback' => '__return_true'
    ));
});

add_action('init', 'minimore_create_default_pages');
function minimore_create_default_pages() {
    $pages_to_create = array(
        'about'   => array('title' => 'Our Story',                    'content' => '<h2>About Minimore</h2><p>Welcome to Minimore, your destination for luxury miniatures.</p>'),
        'faq'     => array('title' => 'Frequently Asked Questions',   'content' => '<h2>FAQ</h2><p><strong>Do you ship internationally?</strong><br/>Yes we do!</p>'),
        'contact' => array('title' => 'Contact Us',                   'content' => '<h2>Get in Touch</h2><p>Email us at support@minimore.local</p>')
    );
    foreach ($pages_to_create as $slug => $page) {
        $page_check = get_page_by_path($slug);
        if (!isset($page_check->ID)) {
            wp_insert_post(array(
                'post_title'   => $page['title'],
                'post_content' => $page['content'],
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_name'    => $slug
            ));
        }
    }
}

// ---------------------------------------------------------
// 3. Custom Authentication Endpoints
// ---------------------------------------------------------
add_action('rest_api_init', function () {
    register_rest_route('minimore/v1', '/login', array(
        'methods' => 'POST',
        'callback' => 'minimore_api_login',
        'permission_callback' => '__return_true'
    ));
    register_rest_route('minimore/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'minimore_api_register',
        'permission_callback' => '__return_true'
    ));
});

function minimore_api_register(WP_REST_Request $request) {
    $email      = $request->get_param('email');
    $password   = $request->get_param('password');
    $first_name = $request->get_param('first_name');
    $last_name  = $request->get_param('last_name');
    if (email_exists($email)) {
        return new WP_Error('email_exists', 'An account with this email already exists.', array('status' => 400));
    }
    $user_id = wp_create_user($email, $password, $email);
    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));
    }
    wp_update_user(array('ID' => $user_id, 'first_name' => $first_name, 'last_name' => $last_name, 'role' => 'customer'));
    return minimore_api_login($request);
}

function minimore_api_login(WP_REST_Request $request) {
    $email    = $request->get_param('email');
    $password = $request->get_param('password');
    $user     = wp_authenticate($email, $password);
    if (is_wp_error($user)) {
        return new WP_Error('invalid_credentials', 'Invalid email or password.', array('status' => 401));
    }
    $token = wp_generate_password(64, false);
    update_user_meta($user->ID, 'minimore_headless_token', $token);
    return array(
        'token'       => $token,
        'customer_id' => $user->ID,
        'first_name'  => $user->first_name,
        'last_name'   => $user->last_name,
        'email'       => $user->user_email
    );
}

// ---------------------------------------------------------
// 4. Headless Checkout Sync
// ---------------------------------------------------------
add_action('wp_loaded', 'minimore_checkout_sync_handler');
function minimore_checkout_sync_handler() {
    if (isset($_GET['minimore_checkout_sync']) && !empty($_GET['minimore_checkout_sync'])) {
        $payload = base64_decode(stripslashes($_GET['minimore_checkout_sync']));
        $items   = json_decode($payload, true);
        if (is_array($items)) {
            if (is_null(WC()->cart)) { wc_load_cart(); }
            WC()->cart->empty_cart();
            foreach ($items as $item) {
                if (isset($item['id']) && isset($item['qty'])) {
                    WC()->cart->add_to_cart($item['id'], $item['qty']);
                }
            }
            wp_safe_redirect(wc_get_checkout_url());
            exit;
        }
    }
}
