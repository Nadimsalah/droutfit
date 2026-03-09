<?php
/**
 * Plugin Name: DrOutfit Virtual Try-On
 * Plugin URI: https://droutfit.com
 * Description: AI-Powered Virtual Try-On for WooCommerce.
 * Version: 1.0.0
 * Author: DrOutfit
 * Text Domain: droutfit-tryon
 */

if (!defined('ABSPATH')) exit;

class DrOutfit_TryOn {
    public function __construct() {
        // Add settings page
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'settings_init']);

        // Inject button into WooCommerce
        add_action('woocommerce_after_add_to_cart_button', [$this, 'inject_tryon_button']);
        
        // Enqueue scripts
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    public function add_admin_menu() {
        add_options_page(
            'DrOutfit Settings',
            'DrOutfit Try-On',
            'manage_options',
            'droutfit-tryon',
            [$this, 'settings_page']
        );
    }

    public function settings_init() {
        register_setting('droutfit_settings', 'droutfit_engine_url');
        register_setting('droutfit_settings', 'droutfit_merchant_id');

        // Handle the redirect from Next.js
        if (isset($_GET['connected']) && $_GET['connected'] === 'true' && isset($_GET['merchant_id'])) {
            update_option('droutfit_merchant_id', sanitize_text_field($_GET['merchant_id']));
            // Optionally set the engine URL if it was not set
            if (!get_option('droutfit_engine_url')) {
                // Determine the home URL of the app (defaulting to current request if possible, but better to keep it static or use the site_url)
                // For now, let's just assume the user might need to set it once or we fallback to your production URL
                update_option('droutfit_engine_url', 'https://your-droutfit-app.vercel.app'); 
            }
        }
    }

    public function settings_page() {
        $merchant_id = get_option('droutfit_merchant_id');
        $engine_url = get_option('droutfit_engine_url', 'https://your-droutfit-app.vercel.app');
        $site_url = get_site_url();
        $connect_url = rtrim($engine_url, '/') . "/dashboard/wordpress/connect?site=" . urlencode($site_url);
        ?>
        <div class="wrap" style="max-width: 800px; margin: 40px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
            <div style="background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); padding: 40px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                    <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: flex; items-center: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">Dr</div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #1e293b;">DrOutfit Virtual Try-On</h1>
                </div>

                <?php if ($merchant_id): ?>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 25px; margin-bottom: 30px; display: flex; align-items: center; gap: 20px;">
                        <div style="width: 40px; height: 40px; background: #22c55e; border-radius: 50%; display: flex; items-center: center; justify-content: center; color: white;">✓</div>
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: #166534; font-weight: 700;">Account Connected</h3>
                            <p style="margin: 0; color: #15803d; font-size: 14px;">Your store is successfully linked to DrOutfit (Merchant ID: <?php echo esc_html($merchant_id); ?>)</p>
                        </div>
                    </div>
                <?php else: ?>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center;">
                        <h2 style="margin: 0 0 10px 0; color: #334155; font-size: 18px; font-weight: 700;">Ready to revolutionize your store?</h2>
                        <p style="color: #64748b; font-size: 15px; margin-bottom: 25px;">Connect your DrOutfit account to enable AI Virtual Try-On for your products.</p>
                        <a href="<?php echo esc_url($connect_url); ?>" 
                           style="display: inline-flex; align-items: center; gap: 10px; background: #2563eb; color: white; padding: 14px 30px; border-radius: 12px; text-decoration: none; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);"
                           onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-2px)';"
                           onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)';"
                        >
                            Login or Create Account
                        </a>
                    </div>
                <?php endif; ?>

                <form method="post" action="options.php" style="border-top: 1px solid #f1f5f9; padding-top: 30px;">
                    <?php settings_fields('droutfit_settings'); ?>
                    <h3 style="margin-top: 0; font-size: 16px; font-weight: 700; color: #475569;">Advanced Configuration</h3>
                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row">DrOutfit Engine URL</th>
                            <td>
                                <input type="url" name="droutfit_engine_url" value="<?php echo esc_attr($engine_url); ?>" class="regular-text" style="border-radius: 8px; border: 1px solid #cbd5e1; padding: 10px;">
                                <p class="description">Link to your DrOutfit Next.js app.</p>
                            </td>
                        </tr>
                        <?php if ($merchant_id): ?>
                        <tr valign="top">
                            <th scope="row">Merchant ID</th>
                            <td>
                                <input type="text" name="droutfit_merchant_id" value="<?php echo esc_attr($merchant_id); ?>" class="regular-text" style="background: #f1f5f9; border-radius: 8px; border: 1px solid #cbd5e1; padding: 10px;" readonly>
                            </td>
                        </tr>
                        <?php endif; ?>
                    </table>
                    <?php submit_button('Update Settings', 'primary', 'submit', true, ['style' => 'background: #475569; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 14px; margin-top: 20px;']); ?>
                </form>
            </div>
        </div>
        <?php
    }

    public function inject_tryon_button() {
        global $product;
        if (!$product) return;

        $product_id = $product->get_id();
        $engine_url = get_option('droutfit_engine_url');

        if (!$engine_url) return;

        // The widget URL structure: {engine_url}/widget/{product_id}?shop=wordpress
        $widget_url = rtrim($engine_url, '/') . "/widget/" . $product_id . "?shop=wordpress";

        echo '<button type="button" 
                id="droutfit-tryon-btn" 
                class="button alt" 
                style="margin-top: 10px; width: 100%; height: 50px; border-radius: 12px; background: linear-gradient(90deg, #2563eb, #7c3aed); color: white; border: none; font-weight: bold; cursor: pointer; display: flex; items-center: center; justify-content: center; gap: 8px;"
                data-url="' . esc_attr($widget_url) . '">
                <span style="font-size: 1.2em;">✨</span> Virtual Try-On
              </button>';
    }

    public function enqueue_assets() {
        if (is_product()) {
            wp_enqueue_script('droutfit-widget', plugin_dir_url(__FILE__) . 'assets/js/droutfit-widget.js', [], '1.0.0', true);
            wp_enqueue_style('droutfit-style', plugin_dir_url(__FILE__) . 'assets/css/droutfit-style.css');
        }
    }
}

new DrOutfit_TryOn();
