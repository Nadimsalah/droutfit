document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('droutfit-pro-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
        const url = btn.getAttribute('data-url');

        // Create Overlay
        const overlay = document.createElement('div');
        overlay.id = 'droutfit-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Create Container
        const container = document.createElement('div');
        container.style.cssText = `
            width: 90%;
            max-width: 500px;
            height: 80vh;
            background: white;
            border-radius: 32px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            transform: translateY(20px);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        // Close Button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        `;
        closeBtn.onclick = () => {
            overlay.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            setTimeout(() => overlay.remove(), 300);
        };

        // Iframe
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
        `;

        container.appendChild(closeBtn);
        container.appendChild(iframe);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeBtn.click();
        });
    });
});
