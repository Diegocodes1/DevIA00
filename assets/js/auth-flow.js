
import { signIn, signUp, signInWithGoogle, resetPassword, onAuthStateChanged, signOutUser } from '../../backend/firebase/auth.js';
 
let authForm;
let authChecking;
let authShell;
let authStatus;
let submitButton;
let googleButton;
let resetButton;
let logoutLink;
let nameField;
let nameGroup;
let tabs;
 
function initializeElements() {
  authForm = document.getElementById('authForm');
  authChecking = document.getElementById('authChecking');
  authShell = document.getElementById('authShell');
  authStatus = document.getElementById('authStatus');
  submitButton = document.getElementById('authSubmit');
  googleButton = document.getElementById('googleButton');
  resetButton = document.getElementById('resetPasswordButton');
  logoutLink = document.getElementById('forceLogoutLink');
  nameField = document.getElementById('displayName');
  nameGroup = nameField ? nameField.closest('.field-group') : null;
  tabs = document.querySelectorAll('.auth-tab');
}
 
let mode = 'login';
let redirecting = false;
 
const say = (msg) => { if (authStatus) authStatus.textContent = msg; };
const label = () => (mode === 'signup' ? 'Criar conta' : 'Entrar');
const busy = (isBusy) => {
  [submitButton, googleButton, resetButton].forEach((b) => { if (b) b.disabled = isBusy; });
  if (submitButton) submitButton.textContent = isBusy ? 'Aguarde...' : label();
};
 
function setMode(nextMode) {
  mode = nextMode === 'signup' ? 'signup' : 'login';
  tabs.forEach((tab) => {
    const isActive = tab.dataset.authMode === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  if (submitButton) submitButton.textContent = label();
  if (nameGroup) nameGroup.style.display = mode === 'signup' ? '' : 'none';
  if (nameField) nameField.required = mode === 'signup';
  say(mode === 'signup' ? 'Preencha seus dados para criar a conta.' : 'Pronto para entrar.');
}
 
function getNextPage() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');
  if (!next) return 'dashboard.html';
 
  const safeList = new Set(['dashboard.html', 'chat.html', 'perfil.html', 'estudos.html', 'curriculo.html', 'entrevistas.html']);
  const cleanNext = next.split('?')[0].split('#')[0];
  return safeList.has(cleanNext) ? cleanNext : 'dashboard.html';
}
 
function goToDashboard() {
  if (redirecting) return;
  redirecting = true;
  window.location.href = getNextPage();
}
 
function describe(error) {
  const map = {
    'auth/invalid-email': 'E-mail inválido.',
    'auth/missing-password': 'Informe sua senha.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/email-already-in-use': 'Este e-mail já possui uma conta. Tente entrar.',
    'auth/user-not-found': 'Não encontramos uma conta com este e-mail.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'auth/popup-closed-by-user': 'Login com Google cancelado.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.'
  };
  return map[error && error.code] || (error && error.message) || 'Não foi possível completar a autenticação.';
}
 
function prefillFormFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email')?.trim();
  const password = params.get('password')?.trim();
  const displayName = params.get('displayName')?.trim();
 
  if (email && document.getElementById('email')) {
    document.getElementById('email').value = email;
  }
  if (password && document.getElementById('password')) {
    document.getElementById('password').value = password;
  }
  if (displayName && nameField) {
    nameField.value = displayName;
  }
}
 
async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const name = nameField ? nameField.value.trim() : '';
 
  busy(true);
  say('Processando autenticação...');
 
  try {
    if (mode === 'signup') {
      await signUp(email, password, name);
    } else {
      await signIn(email, password);
    }
    goToDashboard();
  } catch (error) {
    say(describe(error));
    busy(false);
  }
}
 
async function handleGoogle() {
  busy(true);
  say('Abrindo login com Google...');
 
  try {
    await signInWithGoogle();
    goToDashboard();
  } catch (error) {
    say(describe(error));
    busy(false);
  }
}
 
async function handleReset() {
  const email = document.getElementById('email').value.trim();
  if (!email) {
    say('Digite seu e-mail acima para receber o link de recuperação.');
    return;
  }
 
  busy(true);
  try {
    await resetPassword(email);
    say(`Enviamos um link de recuperação para ${email}.`);
  } catch (error) {
    say(describe(error));
  }
  busy(false);
}
 
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
 
  if (!authForm) {
    console.warn('Formulário de autenticação não encontrado.');
    return;
  }
 
  prefillFormFromQuery();
 
  onAuthStateChanged((user) => {
    if (user) {
      goToDashboard();
      return;
    }
 
    if (authChecking) authChecking.hidden = true;
    if (authShell) authShell.hidden = false;
  });
 
  tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.authMode)));
  authForm.addEventListener('submit', handleAuthSubmit);
  if (googleButton) googleButton.addEventListener('click', handleGoogle);
  if (resetButton) resetButton.addEventListener('click', handleReset);
  if (logoutLink) {
    logoutLink.addEventListener('click', async (event) => {
      event.preventDefault();
      await signOutUser();
      say('Sessão encerrada. Faça login novamente.');
    });
  }
 
  setMode('login');
});
 