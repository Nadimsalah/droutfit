window.droutfit_open = function (btn) {
    if (!btn) return;
    const url = btn.getAttribute('data-url');
    if (!url) return;

    const existing = document.getElementById('droutfit-modal-overlay');
    if (existing) existing.remove();

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
        z-index: 9999999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
        width: 95%;
        max-width: 480px;
        height: 85vh;
        background: white;
        border-radius: 24px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        transform: translateY(20px);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(0,0,0,0.1);
        border: none;
        color: #333;
        font-size: 24px;
        cursor: pointer;
        z-index: 1000;
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

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeBtn.click();
    });
};

document.addEventListener('click', function (e) {
    const btn = e.target.closest('#droutfit-pro-btn');
    if (!btn) return;
    e.preventDefault();
    window.droutfit_open(btn);
});
