<?php
/**
 * Plugin Name: DrOutfit Ultra-Safe v8
 * Plugin URI: https://droutfit.com
 * Description: AI Virtual Try-On (V8 Ultra-Reliable Fix)
 * Version: 8.0.0
 * Author: DrOutfit
 * Text Domain: dr-ai-v8-final
 */

if (!defined('ABSPATH')) exit;

class DrOutfit_AI_v8 {
    public function __construct() {
        // Add settings page
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'settings_init']);

        // Inject button into WooCommerce
        add_action('woocommerce_after_add_to_cart_button', [$this, 'inject_tryon_button']);
        
        // Add meta box to product page
        add_action('add_meta_boxes', [$this, 'add_product_meta_box']);
        add_action('save_post', [$this, 'save_product_meta']);

        // Inject modal logic directly into footer (Bypasses Elementor/Cache issues)
        add_action('wp_footer', [$this, 'inject_footer_js'], 999);
    }

    public function add_admin_menu() {
        add_menu_page(
            'DrOutfit Settings',
            'DrOutfit v8',
            'manage_options',
            'droutfit-v8',
            [$this, 'settings_page'],
            'dashicons-smiley',
            56
        );
    }

    public function settings_init() {
        register_setting('droutfit_settings', 'droutfit_merchant_id');
        register_setting('droutfit_settings', 'droutfit_merchant_email');
        register_setting('droutfit_settings', 'droutfit_access_token');

        if (isset($_POST['droutfit_login']) && check_admin_referer('droutfit_login_action', 'droutfit_login_nonce')) {
            $email = sanitize_email($_POST['email']);
            $password = $_POST['password'];

            $response = wp_remote_post('https://droutfit.com/api/wp/login', [
                'body' => json_encode(['email' => $email, 'password' => $password]),
                'headers' => ['Content-Type' => 'application/json'],
                'timeout' => 15
            ]);

            if (!is_wp_error($response)) {
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
            wp_redirect(admin_url('admin.php?page=droutfit-v8'));
            exit;
        }
        
        if (isset($_POST['disconnect']) && check_admin_referer('droutfit_disconnect_action', 'droutfit_disconnect_nonce')) {
            delete_option('droutfit_merchant_id');
            delete_option('droutfit_merchant_email');
            delete_option('droutfit_access_token');
            wp_redirect(admin_url('admin.php?page=droutfit-v8'));
            exit;
        }
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
                    <span style="font-size: 9px; background: #f0f0f1; color: #646970; padding: 2px 6px; border-radius: 4px; font-weight: 600; border: 1px solid #dcdcde;">ULTRA-SAFE v8</span>
                </div>
            </div>

            <?php if ($error): ?><div class="notice notice-error"><p><?php echo esc_html($error); ?></p></div><?php endif; ?>
            <?php if ($success): ?><div class="notice notice-success"><p><?php echo esc_html($success); ?></p></div><?php endif; ?>

            <div class="card" style="max-width: 800px; padding: 30px; border-radius: 8px;">
                <?php if (!$merchant_id): ?>
                    <h2>Connect to DrOutfit</h2>
                    <form method="post">
                        <?php wp_nonce_field('droutfit_login_action', 'droutfit_login_nonce'); ?>
                        <p><label>Email: <input name="email" type="email" class="regular-text" required></label></p>
                        <p><label>Password: <input name="password" type="password" class="regular-text" required></label></p>
                        <p><button type="submit" name="droutfit_login" value="1" class="button button-primary">Login & Connect</button></p>
                    </form>
                <?php else: ?>
                    <p><strong>Connected as:</strong> <?php echo esc_html($merchant_email); ?></p>
                    <form method="post">
                        <?php wp_nonce_field('droutfit_disconnect_action', 'droutfit_disconnect_nonce'); ?>
                        <button type="submit" name="disconnect" class="button">Disconnect</button>
                    </form>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    public function add_product_meta_box() {
        add_meta_box('dr_vto', 'DrOutfit Try-On', [$this, 'render_product_meta_box'], 'product', 'side');
    }

    public function render_product_meta_box($post) {
        $enabled = get_post_meta($post->ID, '_droutfit_enabled', true);
        if ($enabled === '') $enabled = 'yes';
        echo '<label><input type="checkbox" name="droutfit_enabled" value="yes" ' . checked($enabled, 'yes', false) . '> Show Try-On button</label>';
    }

    public function save_product_meta($post_id) {
        if (isset($_POST['droutfit_enabled'])) update_post_meta($post_id, '_droutfit_enabled', 'yes');
        else if (isset($_POST['post_type']) && $_POST['post_type'] == 'product') update_post_meta($post_id, '_droutfit_enabled', 'no');
    }

    public function inject_tryon_button() {
        global $product;
        if (!$product || get_post_meta($product->get_id(), '_droutfit_enabled', true) === 'no') return;
        
        $merchant_id = get_option('droutfit_merchant_id');
        if (!$merchant_id) return;

        $product_id = $product->get_id();
        $product_name = $product->get_name();
        $product_image = wp_get_attachment_url($product->get_image_id());

        $widget_url = "https://droutfit.com/widget/" . $product_id . "?shop=wordpress&name=" . urlencode($product_name) . "&image=" . urlencode($product_image) . "&m=" . $merchant_id;
        ?>
        <button type="button" 
                id="dr-vto-btn-v8" 
                class="button alt" 
                onclick="window.dr_vto_open_v8(this)"
                style="margin-top: 15px; width: 100%; height: 50px; border-radius: 12px; background: linear-gradient(90deg, #2563eb, #7c3aed); color: white; border: none; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);"
                data-url="<?php echo esc_attr($widget_url); ?>">
                <span style="font-size: 1.2em;">✨</span> Virtual Try-On
        </button>
        <?php
    }

    public function inject_footer_js() {
        ?>
        <script>
        (function() {
            window.dr_vto_open_v8 = function(btn) {
                if (!btn) return;
                const url = btn.getAttribute('data-url');
                if (!url) return;

                // Remove existing
                const old = document.getElementById('dr-v8-overlay');
                if (old) old.remove();

                const overlay = document.createElement('div');
                overlay.id = 'dr-v8-overlay';
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);z-index:2147483647;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;';

                const container = document.createElement('div');
                container.style.cssText = 'width:95%;max-width:480px;height:85vh;background:white;border-radius:24px;overflow:hidden;position:relative;transform:translateY(20px);transition:transform 0.4s ease;';

                const close = document.createElement('button');
                close.innerHTML = '&times;';
                close.style.cssText = 'position:absolute;top:15px;right:15px;width:36px;height:36px;border-radius:50%;background:#eee;border:none;font-size:24px;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;';
                close.onclick = function() {
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.remove(), 300);
                };

                const iframe = document.createElement('iframe');
                iframe.src = url;
                iframe.style.cssText = 'width:100%;height:100%;border:none;';

                container.appendChild(close);
                container.appendChild(iframe);
                overlay.appendChild(container);
                document.body.appendChild(overlay);

                setTimeout(() => {
                    overlay.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                }, 10);
            };

            // Global listener for backup
            document.addEventListener('click', function(e) {
                const btn = e.target.closest('#dr-vto-btn-v8');
                if (btn) {
                    e.preventDefault();
                    window.dr_vto_open_v8(btn);
                }
            });
        })();
        </script>
        <?php
    }
}
new DrOutfit_AI_v8();
