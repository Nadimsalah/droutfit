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
        register_setting('droutfit_settings', 'droutfit_merchant_email');
        register_setting('droutfit_settings', 'droutfit_access_token');

        // Handle native login form submission
        if (isset($_POST['droutfit_login']) && check_admin_referer('droutfit_login_action', 'droutfit_login_nonce')) {
            $email = sanitize_email($_POST['email']);
            $password = $_POST['password']; // Will be sent securely via POST over HTTPS

            $response = wp_remote_post('https://droutfit.com/api/wp/login', [
                'body' => json_encode([
                    'email' => $email,
                    'password' => $password
                ]),
                'headers' => ['Content-Type' => 'application/json'],
                'timeout' => 15
            ]);

            if (is_wp_error($response)) {
                set_transient('droutfit_error', 'Connection error: ' . $response->get_error_message(), 30);
            } else {
                $body = json_decode(wp_remote_retrieve_body($response), true);
                if (isset($body['success']) && $body['success']) {
                    update_option('droutfit_merchant_id', $body['user']['id']);
                    update_option('droutfit_merchant_email', $body['user']['email']);
                    update_option('droutfit_access_token', $body['user']['token']);
                    set_transient('droutfit_success', 'Successfully connected to DrOutfit!', 30);
                } else {
                    set_transient('droutfit_error', 'Login failed: ' . ($body['error'] ?? 'Invalid credentials'), 30);
                }
            }
            wp_redirect(admin_url('options-general.php?page=droutfit-pro'));
            exit;
        }
        
        // Handle disconnect
        if (isset($_POST['disconnect']) && check_admin_referer('droutfit_disconnect_action', 'droutfit_disconnect_nonce')) {
            delete_option('droutfit_merchant_id');
            delete_option('droutfit_merchant_email');
            delete_option('droutfit_access_token');
            wp_redirect(admin_url('options-general.php?page=droutfit-pro'));
            exit;
        }
    }

    private function get_credits($merchant_id) {
        $response = wp_remote_get('https://droutfit.com/api/wp/profile?merchant_id=' . $merchant_id);
        if (is_wp_error($response)) return 'Error';
        $body = json_decode(wp_remote_retrieve_body($response), true);
        return isset($body['credits']) ? $body['credits'] : 0;
    }

    public function settings_page() {
        $merchant_id = get_option('droutfit_merchant_id');
        $merchant_email = get_option('droutfit_merchant_email');
        $error = get_transient('droutfit_error');
        $success = get_transient('droutfit_success');
        delete_transient('droutfit_error');
        delete_transient('droutfit_success');
        ?>
        <div class="wrap" style="max-width: 800px; margin: 40px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 44px; height: 44px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">Dr</div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">DrOutfit Dashboard</h1>
                </div>
            </div>

            <?php if ($error): ?>
                <div style="padding: 15px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; color: #dc2626; margin-bottom: 20px; font-weight: 500;">
                    <?php echo esc_html($error); ?>
                </div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div style="padding: 15px; background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 12px; color: #16a34a; margin-bottom: 20px; font-weight: 500;">
                    <?php echo esc_html($success); ?>
                </div>
            <?php endif; ?>

            <?php if (!$merchant_id): ?>
                <!-- Login View -->
                <div style="background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="margin: 0; font-size: 20px; color: #334155;">Connect your Store</h2>
                        <p style="color: #64748b; margin-top: 5px;">Enter your DrOutfit credentials to activate virtual try-on.</p>
                    </div>

                    <form method="post" action="">
                        <?php wp_nonce_field('droutfit_login_action', 'droutfit_login_nonce'); ?>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 8px;">Email Address</label>
                            <input type="email" name="email" required style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px;" placeholder="you@example.com">
                        </div>
                        <div style="margin-bottom: 30px;">
                            <label style="display: block; font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 8px;">Password</label>
                            <input type="password" name="password" required style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px;" placeholder="••••••••">
                        </div>
                        <button type="submit" name="droutfit_login" value="1" style="width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.2s;">
                            Login & Connect
                        </button>
                    </form>

                    <div style="margin-top: 25px; text-align: center; border-top: 1px solid #f1f5f9; pt: 20px;">
                        <p style="color: #64748b; font-size: 14px;">Don't have an account? <a href="https://droutfit.com/en/signup" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">Sign up for free</a></p>
                    </div>
                </div>
            <?php else: ?>
                <!-- Connected View -->
                <div style="background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
                    <div style="display: flex; gap: 30px; align-items: center;">
                        <div style="flex: 1;">
                            <p style="text-transform: uppercase; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px;">Status</p>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                                <span style="font-weight: 600; color: #1e293b;">Active & Connected</span>
                            </div>
                        </div>
                        <div style="flex: 1; border-left: 1px solid #f1f5f9; padding-left: 30px;">
                            <p style="text-transform: uppercase; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 5px;">Available Credits</p>
                            <span style="font-size: 24px; font-weight: 800; color: #2563eb;"><?php echo esc_html($this->get_credits($merchant_id)); ?></span>
                        </div>
                    </div>

                    <div style="margin-top: 40px; padding: 25px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9;">
                        <div style="margin-bottom: 15px;">
                            <p style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px;">Connected Account</p>
                            <p style="font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;"><?php echo esc_html($merchant_email); ?></p>
                        </div>
                        <div>
                            <p style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 4px;">Merchant ID</p>
                            <code style="font-size: 13px; color: #334155;"><?php echo esc_html($merchant_id); ?></code>
                        </div>
                    </div>

                    <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: center;">
                        <a href="https://droutfit.com/dashboard" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px;">Open DrOutfit Portal ↗</a>
                        
                        <form method="post" action="">
                            <?php wp_nonce_field('droutfit_disconnect_action', 'droutfit_disconnect_nonce'); ?>
                            <input type="hidden" name="disconnect" value="true">
                            <button type="submit" style="background: none; border: none; color: #ef4444; font-weight: 600; cursor: pointer; font-size: 14px;">Disconnect Store</button>
                        </form>
                    </div>
                </div>
            <?php endif; ?>
        </div>
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
