<?php
/**
 * Plugin Name:       DrOutfit Virtual Try-On
 * Plugin URI:        https://droutfit.com
 * Description:       AI Virtual Try-On (V8.4.1 Stable)
 * Version:           8.4.1
 * Author:            DrOutfit
 * Text Domain:       droutfit-virtual-try-on
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
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
        register_setting('droutfit_settings', 'droutfit_merchant_id', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('droutfit_settings', 'droutfit_merchant_email', ['sanitize_callback' => 'sanitize_email']);
        register_setting('droutfit_settings', 'droutfit_access_token', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('droutfit_settings', 'droutfit_api_key', ['sanitize_callback' => 'sanitize_text_field']);

        if (isset($_POST['droutfit_connect_api']) && check_admin_referer('droutfit_login_action', 'droutfit_login_nonce')) {
            $api_key = sanitize_text_field($_POST['api_key']);
            
            $response = wp_remote_get('https://droutfit.com/api/wp/profile?api_key=' . $api_key, [
                'timeout' => 15
            ]);

            if (!is_wp_error($response)) {
                $body = json_decode(wp_remote_retrieve_body($response), true);
                if (isset($body['success']) && $body['success']) {
                    update_option('droutfit_merchant_id', $body['user']['id']);
                    update_option('droutfit_merchant_email', $body['user']['email']);
                    update_option('droutfit_api_key', $api_key);
                    set_transient('droutfit_success', 'Successfully connected via API Key!', 30);
                } else {
                    set_transient('droutfit_error', 'Invalid API Key: ' . ($body['error'] ?? 'Please check your key in the dashboard.'), 30);
                }
            }
            wp_redirect(admin_url('admin.php?page=droutfit-v8'));
            exit;
        }

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
            delete_option('droutfit_api_key');
            wp_redirect(admin_url('admin.php?page=droutfit-v8'));
            exit;
        }
    }

    private function get_dashboard_data($merchant_id) {
        $api_key = get_option('droutfit_api_key');
        $url = 'https://droutfit.com/api/wp/profile?merchant_id=' . $merchant_id;
        if ($api_key) $url .= '&api_key=' . $api_key;
        
        $response = wp_remote_get($url);
        if (is_wp_error($response)) return null;
        return json_decode(wp_remote_retrieve_body($response), true);
    }

    public function settings_page() {
        $merchant_id = get_option('droutfit_merchant_id');
        $merchant_email = get_option('droutfit_merchant_email');
        $api_key = get_option('droutfit_api_key');
        $error = get_transient('droutfit_error');
        $success = get_transient('droutfit_success');
        delete_transient('droutfit_error');
        delete_transient('droutfit_success');

        $data = $merchant_id ? $this->get_dashboard_data($merchant_id) : null;
        $credits = isset($data['credits']) ? $data['credits'] : 0;
        $logs = isset($data['logs']) ? $data['logs'] : [];
        ?>
        <div class="wrap">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; background: white; padding: 20px; border-radius: 12px; border: 1px solid #ccd0d4; box-shadow: 0 1px 1px rgba(0,0,0,.04);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 32px; height: 32px; background: #2271b1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">Dr</div>
                    <h1 style="margin:0; font-size: 20px; font-weight: 600;"><?php _e('DrOutfit Virtual Try-On', 'droutfit-virtual-try-on'); ?></h1>
                    <span style="font-size: 9px; background: #f0f0f1; color: #646970; padding: 2px 6px; border-radius: 4px; font-weight: 600; border: 1px solid #dcdcde;">ULTRA-SAFE v8.4</span>
                </div>
            </div>

            <?php if ($error): ?><div class="notice notice-error"><p><?php echo esc_html($error); ?></p></div><?php endif; ?>
            <?php if ($success): ?><div class="notice notice-success"><p><?php echo esc_html($success); ?></p></div><?php endif; ?>

            <?php if (!$merchant_id): ?>
                <div class="card" style="max-width: 600px; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <h2 style="margin-top:0;"><?php _e('Connect to DrOutfit', 'droutfit-virtual-try-on'); ?></h2>
                    <p style="color: #646970;"><?php _e('Choose your preferred connection method to enable AI Virtual Try-On.', 'droutfit-virtual-try-on'); ?></p>
                    
                    <div style="margin-top: 30px; display: flex; flex-direction: column; gap: 30px;">
                        <!-- Option 1: API Key -->
                        <div style="padding: 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
                            <h3 style="margin:0 0 15px; font-size: 14px; color: #1e293b;"><?php _e('Option 1: Connect with API Key (Recommended)', 'droutfit-virtual-try-on'); ?></h3>
                            <form method="post">
                                <?php wp_nonce_field('droutfit_login_action', 'droutfit_login_nonce'); ?>
                                <div style="display: flex; gap: 10px;">
                                    <input name="api_key" type="text" class="regular-text" placeholder="dr_..." required style="flex:1; border-radius: 8px; border: 1px solid #cbd5e1; height: 40px;">
                                    <button type="submit" name="droutfit_connect_api" value="1" class="button button-primary" style="height: 40px; border-radius: 8px; background: #2563eb;"><?php _e('Connect', 'droutfit-virtual-try-on'); ?></button>
                                </div>
                                <p style="font-size: 11px; color: #64748b; margin: 10px 0 0;">
                                    <?php _e('Find your key in', 'droutfit-virtual-try-on'); ?> <a href="https://droutfit.com/dashboard/integrations" target="_blank" style="color: #2563eb; text-decoration: none;">Dashboard > Integrations</a>
                                </p>
                            </form>
                        </div>

                        <div style="display: flex; align-items: center; gap: 15px;">
                            <hr style="flex:1; border: 0; border-top: 1px solid #e2e8f0;">
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;"><?php _e('OR', 'droutfit-virtual-try-on'); ?></span>
                            <hr style="flex:1; border: 0; border-top: 1px solid #e2e8f0;">
                        </div>

                        <!-- Option 2: Login -->
                        <div style="padding: 20px; background: white; border-radius: 16px; border: 1px solid #e2e8f0;">
                            <h3 style="margin:0 0 15px; font-size: 14px; color: #1e293b;"><?php _e('Option 2: Account Login', 'droutfit-virtual-try-on'); ?></h3>
                            <form method="post">
                                <?php wp_nonce_field('droutfit_login_action', 'droutfit_login_nonce'); ?>
                                <p><label style="display:block; margin-bottom:5px; font-size: 12px; font-weight: 600; color: #475569;">Email</label><input name="email" type="email" class="regular-text" required style="width:100%; border-radius: 8px; border: 1px solid #cbd5e1;"></p>
                                <p><label style="display:block; margin-bottom:5px; font-size: 12px; font-weight: 600; color: #475569;">Password</label><input name="password" type="password" class="regular-text" required style="width:100%; border-radius: 8px; border: 1px solid #cbd5e1;"></p>
                                <p style="margin-top:20px;"><button type="submit" name="droutfit_login" value="1" class="button button-large" style="width:100%; height:45px; border-radius: 8px; font-weight: 600;"><?php _e('Login & Connect', 'droutfit-virtual-try-on'); ?></button></p>
                            </form>
                        </div>
                    </div>

                    <p style="margin-top: 30px; text-align: center; color: #646970; font-size: 13px;">
                        Don't have an account? <a href="https://droutfit.com/signup" target="_blank" style="color: #2271b1; text-decoration: none; font-weight: 600;">Create one for free</a>
                    </p>
                </div>
            <?php else: ?>
                <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px;">
                    <!-- Sidebar Stats -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="card" style="margin:0; padding: 20px; border-radius: 12px;">
                            <p style="margin:0; font-size: 11px; text-transform: uppercase; color: #646970; font-weight: 600;">Available Credits</p>
                            <p style="margin:10px 0; font-size: 32px; font-weight: 800; color: #2271b1;"><?php echo esc_html($credits); ?></p>
                            <a href="https://droutfit.com/dashboard" target="_blank" class="button button-primary" style="width:100%; text-align:center; height:35px; line-height:33px; border-radius:6px; background:#2271b1;">Top Up Credits ✨</a>
                        </div>

                        <div class="card" style="margin:0; padding: 20px; border-radius: 12px; background: #f6f7f7;">
                            <p style="margin:0 0 10px; font-size:13px;"><strong>Account:</strong><br><?php echo esc_html($merchant_email); ?></p>
                            
                            <?php if ($api_key): ?>
                                <p style="margin:15px 0 5px; font-size:11px; color:#646970; font-weight:600; text-transform:uppercase;">API Key</p>
                                <div style="display:flex; gap:5px; margin-bottom:20px;">
                                    <input type="password" value="<?php echo esc_attr($api_key); ?>" readonly style="flex:1; background:#eee; border:1px solid #ddd; height:30px; border-radius:6px; font-family:monospace; font-size:11px;" onfocus="this.type='text'" onblur="this.type='password'">
                                </div>
                            <?php endif; ?>

                            <form method="post" onsubmit="return confirm('Are you sure?');">
                                <?php wp_nonce_field('droutfit_disconnect_action', 'droutfit_disconnect_nonce'); ?>
                                <button type="submit" name="disconnect" style="color: #d63638; background: none; border: none; padding: 0; font-size: 12px; cursor: pointer; text-decoration: underline;">Disconnect Store</button>
                            </form>
                        </div>
                    </div>

                    <!-- Main History -->
                    <div class="card" style="margin:0; padding: 25px; border-radius: 12px; min-height: 400px;">
                        <h2 style="margin-top:0;">Recent Try-On History</h2>
                        <?php if (empty($logs)): ?>
                            <div style="padding: 40px; text-align: center; color: #646970;">
                                <span class="dashicons dashicons-camera" style="font-size: 40px; width: 40px; height: 40px; opacity: 0.3;"></span>
                                <p>No try-on sessions found yet.</p>
                            </div>
                        <?php else: ?>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; margin-top: 20px;">
                                <?php foreach ($logs as $log): ?>
                                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; position: relative;">
                                        <?php if ($log['image']): ?>
                                            <div style="aspect-ratio: 3/4; background: #f3f4f6; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                                <img src="<?php echo esc_url($log['image']); ?>" style="width: 100%; height: 100%; object-fit: cover;">
                                            </div>
                                        <?php else: ?>
                                            <div style="aspect-ratio: 3/4; background: #f3f4f6; display:flex; align-items:center; justify-content:center; color:#9ca3af;">
                                                <span class="dashicons dashicons-warning" title="Status: <?php echo esc_attr($log['status']); ?>"></span>
                                            </div>
                                        <?php endif; ?>
                                        <div style="padding: 8px; border-top: 1px solid #f3f4f6;">
                                            <p style="margin:0; font-size: 10px; color: #646970;"><?php echo date('M d, H:i', strtotime($log['date'])); ?></p>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
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

            // Listener for close message from iframe
            window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'droutfit-close') {
                    const overlay = document.getElementById('dr-v8-overlay');
                    if (overlay) {
                        overlay.style.opacity = '0';
                        setTimeout(() => overlay.remove(), 300);
                    }
                }
            }, false);
        })();
        </script>
        <?php
    }
}
new DrOutfit_AI_v8();
