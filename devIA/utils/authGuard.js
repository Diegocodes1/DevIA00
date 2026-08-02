import { auth, signOutUser, onAuthStateChanged } from '../firebase/auth.js';

const LOGIN_PAGE = 'login.html';
const DEFAULT_REDIRECT = 'dashboard.html';
const PUBLIC_PAGES = new Set(['index.html', LOGIN_PAGE]);
const PROTECTED_PAGES = new Set([
  'dashboard.html',
  'chat.html',
  'perfil.html',
  'estudos.html',
  'curriculo.html',
  'entrevistas.html'
]);

function getCleanPath(value) {
  if (!value) return '';
  const path = value.split('?')[0].split('#')[0].trim();
  return path.split('/').filter(Boolean).pop() || '';
}

function getSafeRedirect(next) {
  const path = getCleanPath(next);
  return PROTECTED_PAGES.has(path) ? path : DEFAULT_REDIRECT;
}

function hidePageUntilReady() {
  const style = document.createElement('style');
  style.textContent = 'html, body { visibility: hidden !important; }';
  document.documentElement.appendChild(style);
  const failSafe = window.setTimeout(() => {
    if (style.parentNode) style.remove();
  }, 8000);
  return { style, failSafe };
}

function restorePageDisplay(style, failSafe) {
  window.clearTimeout(failSafe);
  if (style?.parentNode) {
    style.remove();
  }
}

function showPage() {
  const authShell = document.getElementById('authShell');
  const authChecking = document.getElementById('authChecking');

  if (authChecking) authChecking.hidden = true;
  if (authShell) authShell.hidden = false;
}

export function requireAuth() {
  const { style, failSafe } = hidePageUntilReady();

  onAuthStateChanged(auth, (user) => {
    restorePageDisplay(style, failSafe);

    if (!user) {
      const nextPage = encodeURIComponent(window.location.pathname.split('/').pop() || '');
      window.location.replace(`${LOGIN_PAGE}?next=${nextPage}`);
    }
  });
}

export function redirectIfAuthenticated({ authShellId = 'authShell', authCheckingId = 'authChecking' } = {}) {
  const authShell = document.getElementById(authShellId);
  const authChecking = document.getElementById(authCheckingId);

  if (authShell) authShell.hidden = true;
  if (authChecking) authChecking.hidden = false;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.replace(getSafeRedirect(next));
      return;
    }

    if (authChecking) authChecking.hidden = true;
    if (authShell) authShell.hidden = false;
  });
}

export function installLogoutHandler() {
  document.addEventListener('click', async (event) => {
    const logoutAnchor = event.target.closest('[data-logout]');
    if (!logoutAnchor) return;

    event.preventDefault();
    await signOutUser();
    window.location.replace(LOGIN_PAGE);
  });
}

const currentPage = window.location.pathname.split('/').pop();

if (currentPage === LOGIN_PAGE) {
  redirectIfAuthenticated();
} else if (PROTECTED_PAGES.has(currentPage)) {
  requireAuth();
  installLogoutHandler();
} else {
  showPage();
}
