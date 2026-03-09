<?php
/**
 * Plugin Name: DrOutfit Virtual Try-On Pro
 * Plugin URI: https://droutfit.com
 * Description: AI-Powered Virtual Try-On for WooCommerce.
 * Version: 1.1.0
 * Author: DrOutfit
 * Text Domain: droutfit-pro
 */

if (!defined('ABSPATH')) exit;

class DrOutfit_Pro {
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
            'droutfit-pro',
            [$this, 'settings_page']
        );
    }

    public function settings_init() {
        register_setting('droutfit_settings', 'droutfit_merchant_id');

        // Handle the redirect/form submission to save the merchant ID
        if (isset($_POST['droutfit_merchant_id']) && !empty($_POST['droutfit_merchant_id'])) {
            update_option('droutfit_merchant_id', sanitize_text_field($_POST['droutfit_merchant_id']));
            
            // Redirect back to avoid form resubmission warning on refresh
            if (!isset($_POST['disconnect'])) {
                 wp_redirect(admin_url('options-general.php?page=droutfit-pro'));
                 exit;
            }
        }
        
        // Handle disconnect
        if (isset($_POST['disconnect'])) {
            delete_option('droutfit_merchant_id');
            wp_redirect(admin_url('options-general.php?page=droutfit-pro'));
            exit;
        }
    }

    public function settings_page() {
        $merchant_id = get_option('droutfit_merchant_id');
        $engine_url = 'https://droutfit.com';
        $site_url = get_site_url();
        $iframe_url = $merchant_id 
            ? rtrim($engine_url, '/') . "/dashboard?shop=" . urlencode($site_url) . "&embed=1"
            : rtrim($engine_url, '/') . "/en/login?redirect=/dashboard/wordpress/connect?site=" . urlencode($site_url) . "&embed=1";
        ?>
        <div class="wrap" style="max-width: 100%; margin: 20px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; background: #2563eb; border-radius: 10px; display: flex; items-center: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">Dr</div>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #1e293b;">DrOutfit Dashboard</h1>
                </div>
                <?php if ($merchant_id): ?>
                    <form method="post" action="">
                        <input type="hidden" name="disconnect" value="true">
                        <?php submit_button('Disconnect Store', 'secondary', 'submit', false, ['style' => 'border-radius: 8px; color: #ef4444; border-color: #fca5a5; background: #fef2f2;']); ?>
                    </form>
                <?php endif; ?>
            </div>
            
            <!-- Hidden form to save the merchant ID when received from the iframe -->
            <form id="droutfit-connect-form" method="post" action="" style="display: none;">
                <input type="hidden" name="droutfit_merchant_id" id="droutfit_merchant_id_input" value="">
                <?php submit_button(); ?>
            </form>

            <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); background: #0a0d14; height: 850px; position: relative;">
                <?php if (!$merchant_id): ?>
                    <div id="droutfit-loading" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: #0a0d14; color: white; z-index: 10;">
                        Wait, loading DrOutfit...
                    </div>
                <?php endif; ?>
                
                <iframe id="droutfit-iframe" src="<?php echo esc_url($iframe_url); ?>" width="100%" height="100%" style="border:none;" onload="document.getElementById('droutfit-loading')?.style.setProperty('display', 'none')"></iframe>
            </div>
        </div>

        <script>
            window.addEventListener('message', function(event) {
                // Verify the origin for security
                if (event.origin !== "<?php echo rtrim($engine_url, '/'); ?>") return;

                const data = event.data;
                if (data && data.type === 'droutfit_connected' && data.merchantId) {
                    // Update the hidden input and submit the form to save it to WordPress db
                    document.getElementById('droutfit_merchant_id_input').value = data.merchantId;
                    document.getElementById('droutfit-connect-form').submit();
                }
            });
        </script>
        <?php
    }

    public function inject_tryon_button() {
        global $product;
        if (!$product) return;

        $merchant_id = get_option('droutfit_merchant_id');
        if (!$merchant_id) return;

        $product_id = $product->get_id();
        $engine_url = 'https://droutfit.com';


        if (!$engine_url) return;

        // The widget URL structure: {engine_url}/widget/{product_id}?shop=wordpress
        $widget_url = rtrim($engine_url, '/') . "/widget/" . $product_id . "?shop=wordpress";

        echo '<button type="button" 
                id="droutfit-pro-btn" 
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

new DrOutfit_Pro();
