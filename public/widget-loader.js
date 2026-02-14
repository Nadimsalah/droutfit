(function () {
    // Utilities
    function getBaseUrl() {
        var scripts = document.getElementsByTagName('script');
        var currentScript = scripts[scripts.length - 1];
        return currentScript.src.substring(0, currentScript.src.lastIndexOf('/'));
    }

    var baseUrl = getBaseUrl();

    // Global Object
    window.DrOutfit = {
        open: function (productId) {
            // Create Overlay
            var overlay = document.createElement('div');
            overlay.id = 'droutfit-modal-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.backdropFilter = 'blur(5px)';
            overlay.style.zIndex = '999999';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.padding = '20px';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';

            // Create Container
            var container = document.createElement('div');
            container.style.width = '100%';
            container.style.maxWidth = '480px';
            container.style.height = '90vh';
            container.style.maxHeight = '800px';
            container.style.backgroundColor = 'transparent';
            container.style.borderRadius = '24px';
            container.style.position = 'relative';
            container.style.transform = 'scale(0.95)';
            container.style.transition = 'transform 0.3s ease';
            container.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

            // Create Close Button
            var closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '-15px';
            closeBtn.style.right = '-15px';
            closeBtn.style.width = '36px';
            closeBtn.style.height = '36px';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.backgroundColor = 'white';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '24px';
            closeBtn.style.lineHeight = '36px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            closeBtn.style.display = 'flex';
            closeBtn.style.alignItems = 'center';
            closeBtn.style.justifyContent = 'center';
            closeBtn.style.zIndex = '1000000';

            closeBtn.onclick = function () {
                overlay.style.opacity = '0';
                container.style.transform = 'scale(0.95)';
                setTimeout(function () {
                    document.body.removeChild(overlay);
                }, 300);
            };

            // Create Iframe
            var iframe = document.createElement('iframe');
            iframe.src = baseUrl + '/widget/' + productId;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '24px';
            iframe.style.backgroundColor = 'white'; // Prevent transparency while loading

            // Assemble
            container.appendChild(closeBtn);
            container.appendChild(iframe);
            overlay.appendChild(container);
            document.body.appendChild(overlay);

            // Animate In
            requestAnimationFrame(function () {
                overlay.style.opacity = '1';
                container.style.transform = 'scale(1)';
            });
        }
    };

    // Auto-Initialize Embedded Widgets
    function initEmbeddedWidgets() {
        var scripts = document.getElementsByTagName('script');

        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            var productId = script.getAttribute('data-product-id');

            // Only process if it hasn't been processed yet and has a product ID
            if (productId && !script.getAttribute('data-droutfit-processed')) {
                script.setAttribute('data-droutfit-processed', 'true');

                var containerClass = script.getAttribute('data-container-class');

                var iframe = document.createElement('iframe');
                iframe.src = baseUrl + '/widget/' + productId;
                iframe.width = '100%';
                iframe.height = '600px';
                iframe.style.border = 'none';
                iframe.style.borderRadius = '12px';
                iframe.style.overflow = 'hidden';
                iframe.title = 'Virtual Try-On Widget';

                var wrapper = document.createElement('div');
                wrapper.className = 'droutfit-widget-container ' + (containerClass || '');
                wrapper.style.width = '100%';
                wrapper.style.maxWidth = '480px';
                wrapper.style.margin = '0 auto';
                wrapper.style.position = 'relative';

                wrapper.appendChild(iframe);

                script.parentNode.insertBefore(wrapper, script.nextSibling);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmbeddedWidgets);
    } else {
        initEmbeddedWidgets();
    }
})();
