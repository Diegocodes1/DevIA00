export function notify(message, type = 'info') {
  if (window.showToast) {
    window.showToast(message, type);
    return;
  }

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = 'padding:10px 14px;border-radius:8px;background:var(--surface-elevated,#0f172a);color:#fff;border:1px solid rgba(255,255,255,0.15);box-shadow:0 10px 25px rgba(0,0,0,0.2);';
  container.appendChild(toast);
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 3200);
}
