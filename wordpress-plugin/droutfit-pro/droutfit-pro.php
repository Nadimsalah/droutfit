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
        <div class="wrap">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; background: white; padding: 20px; border-radius: 12px; border: 1px solid #ccd0d4; box-shadow: 0 1px 1px rgba(0,0,0,.04);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 32px; height: 32px; background: #2271b1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">Dr</div>
                    <h1 style="margin:0; font-size: 20px; font-weight: 600;"><?php _e('DrOutfit Virtual Try-On', 'droutfit-pro'); ?></h1>
                    <span style="font-size: 9px; background: #f0f0f1; color: #646970; padding: 2px 6px; border-radius: 4px; font-weight: 600; border: 1px solid #dcdcde;">NATIVE V2.0</span>
                </div>
            </div>

            <?php if ($error): ?>
                <div class="notice notice-error is-dismissible"><p><?php echo esc_html($error); ?></p></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="notice notice-success is-dismissible"><p><?php echo esc_html($success); ?></p></div>
            <?php endif; ?>

            <div class="card" style="max-width: 800px; margin-top: 20px; padding: 30px; border-radius: 8px;">
                <?php if (!$merchant_id): ?>
                    <h2><?php _e('Connect to DrOutfit', 'droutfit-pro'); ?></h2>
                    <p><?php _e('Log in with your DrOutfit account to enable AI Virtual Try-On for your WooCommerce products.', 'droutfit-pro'); ?></p>
                    
                    <form method="post" action="">
                        <?php wp_nonce_field('droutfit_login_action', 'droutfit_login_nonce'); ?>
                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row"><label for="email"><?php _e('Email Address', 'droutfit-pro'); ?></label></th>
                                <td><input name="email" type="email" id="email" value="" class="regular-text" required placeholder="you@example.com"></td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="password"><?php _e('Password', 'droutfit-pro'); ?></label></th>
                                <td><input name="password" type="password" id="password" value="" class="regular-text" required placeholder="••••••••"></td>
                            </tr>
                        </table>
                        <p class="submit">
                            <button type="submit" name="droutfit_login" value="1" class="button button-primary button-large" style="padding: 0 30px; height: 40px;"><?php _e('Login & Connect', 'droutfit-pro'); ?></button>
                        </p>
                    </form>
                    <p class="description"><?php _e("Don't have an account?", 'droutfit-pro'); ?> <a href="https://droutfit.com/en/signup" target="_blank"><?php _e('Create one for free', 'droutfit-pro'); ?></a></p>
                <?php else: ?>
                    <div style="display: flex; gap: 40px; margin-bottom: 30px;">
                        <div>
                            <p style="margin:0; font-size: 11px; text-transform: uppercase; color: #646970; font-weight: 600;"><?php _e('Connection Status', 'droutfit-pro'); ?></p>
                            <p style="margin:5px 0 0; font-size: 16px; font-weight: 600; color: #00a32a;"><span class="dashicons dashicons-yes-alt" style="color: #00a32a; margin-top: -2px;"></span> <?php _e('Connected', 'droutfit-pro'); ?></p>
                        </div>
                        <div>
                            <p style="margin:0; font-size: 11px; text-transform: uppercase; color: #646970; font-weight: 600;"><?php _e('Available Credits', 'droutfit-pro'); ?></p>
                            <p style="margin:5px 0 0; font-size: 24px; font-weight: 800; color: #2271b1;"><?php echo esc_html($this->get_credits($merchant_id)); ?></p>
                        </div>
                    </div>

                    <div style="background: #f6f7f7; padding: 20px; border-radius: 6px; border: 1px solid #dcdcde; margin-bottom: 30px;">
                        <p style="margin: 0 0 10px;"><strong><?php _e('Account Email:', 'droutfit-pro'); ?></strong> <?php echo esc_html($merchant_email); ?></p>
                        <p style="margin: 0;"><strong><?php _e('Merchant ID:', 'droutfit-pro'); ?></strong> <code style="font-size: 11px;"><?php echo esc_html($merchant_id); ?></code></p>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <a href="https://droutfit.com/dashboard" target="_blank" class="button"><?php _e('Open DrOutfit Dashboard', 'droutfit-pro'); ?> <span class="dashicons dashicons-external" style="font-size: 14px; margin-top: 4px;"></span></a>
                        
                        <form method="post" action="" onsubmit="return confirm('Are you sure you want to disconnect?');">
                            <?php wp_nonce_field('droutfit_disconnect_action', 'droutfit_disconnect_nonce'); ?>
                            <input type="hidden" name="disconnect" value="true">
                            <button type="submit" style="color: #d63638; background: none; border: none; padding: 0; font-size: 13px; cursor: pointer; text-decoration: underline;"><?php _e('Disconnect Store', 'droutfit-pro'); ?></button>
                        </form>
                    </div>
                <?php endif; ?>
            </div>
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
