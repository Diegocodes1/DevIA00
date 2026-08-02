/**
 * main.js
 * Funções compartilhadas entre todas as páginas do DevMentor AI:
 * navegação mobile, toggle da sidebar, toasts e helpers de UI.
 */

/* ---------- Menu público (navbar) ---------- */
function initNavbarToggle() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---------- Sidebar do app (área logada) ---------- */
function initSidebarToggle() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Fecha ao clicar fora, em telas pequenas
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 960) return;
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* ---------- Marca o link ativo da sidebar com base na URL atual ---------- */
function highlightActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav a').forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === current);
  });
}

/* ---------- Anima um círculo de progresso (score) via SVG stroke-dashoffset ---------- */
function animateScoreRing(el, score, max = 100) {
  const circle = el.querySelector('.fill');
  if (!circle) return;
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  requestAnimationFrame(() => {
    const offset = circumference - (score / max) * circumference;
    circle.style.strokeDashoffset = offset;
  });

  const valueEl = el.querySelector('.score-value strong, .score-value .value');
  if (valueEl) valueEl.textContent = score;
}

/* ---------- Anima barras de progresso lineares ---------- */
function animateProgressBars() {
  document.querySelectorAll('.progress-fill[data-value]').forEach((bar) => {
    const value = bar.getAttribute('data-value');
    requestAnimationFrame(() => { bar.style.width = `${value}%`; });
  });
}

/* ---------- Toast simples de feedback ---------- */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:10px;z-index:1000;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { info: 'var(--primary)', success: 'var(--success)', error: 'var(--danger)' };
  toast.textContent = message;
  toast.style.cssText = `
    background: var(--surface-elevated);
    border: 1px solid ${colors[type] || colors.info};
    color: var(--text);
    padding: 12px 18px;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    box-shadow: var(--shadow-card);
    animation: fadeUp 0.3s ease both;
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ---------- FAQ accordion (landing page) ---------- */
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---------- Inicialização comum a todas as páginas ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbarToggle();
  initSidebarToggle();
  highlightActiveNav();
  animateProgressBars();
  initFaqAccordion();

  document.querySelectorAll('.score-ring[data-score]').forEach((ring) => {
    animateScoreRing(ring, Number(ring.dataset.score));
  });
});