import { onAuthStateChanged } from '../../firebase/auth.js';

function getDisplayName(user) {
  const emailName = user?.email?.split('@')[0] || 'Usuário';
  const fallback = user?.displayName?.trim() || emailName;
  return fallback.replace(/\b\w/g, (char) => char.toUpperCase());
}

function updateUserUI(user) {
  const sidebarName = document.getElementById('sidebarName');
  const sidebarRole = document.getElementById('sidebarRole');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const greeting = document.getElementById('dashboardGreeting');

  if (!user) {
    if (sidebarName) sidebarName.textContent = 'Usuário';
    if (sidebarRole) sidebarRole.textContent = 'Faça login';
    if (sidebarAvatar) sidebarAvatar.textContent = 'U';
    if (greeting) greeting.textContent = 'Olá, usuário 👋';
    return;
  }

  const displayName = getDisplayName(user);
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || 'U';

  if (sidebarName) sidebarName.textContent = displayName;
  if (sidebarRole) sidebarRole.textContent = user.email || 'Usuário autenticado';
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (greeting) greeting.textContent = `Olá, ${displayName} 👋`;
}

function renderProgress(state) {
  const safeState = state || {
    progress: 42,
    hoursStudied: 12,
    projectsCompleted: 2,
    streakDays: 4
  };
  const progressValue = document.getElementById('progressValue');
  const progressBar = document.getElementById('progressBar');
  const hoursValue = document.getElementById('hoursValue');
  const hoursDelta = document.getElementById('hoursDelta');
  const projectsValue = document.getElementById('projectsValue');
  const projectsDelta = document.getElementById('projectsDelta');
  const streakValue = document.getElementById('streakValue');
  const streakDelta = document.getElementById('streakDelta');

  if (progressValue) progressValue.textContent = `${Math.round(safeState.progress)}%`;
  if (progressBar) {
    progressBar.setAttribute('data-value', Math.round(safeState.progress));
    progressBar.style.width = `${Math.round(safeState.progress)}%`;
  }
  if (hoursValue) hoursValue.textContent = `${safeState.hoursStudied.toFixed(1).replace('.0', '')}h`;
  if (hoursDelta) hoursDelta.textContent = `+${Math.max(1, Math.round(safeState.hoursStudied / 2))}h esta semana`;
  if (projectsValue) projectsValue.textContent = `${Math.round(safeState.projectsCompleted)}`;
  if (projectsDelta) projectsDelta.textContent = `+${Math.max(1, Math.round(safeState.projectsCompleted / 3))} este mês`;
  if (streakValue) streakValue.textContent = `${safeState.streakDays} dias`;
  if (streakDelta) streakDelta.textContent = `recorde pessoal: ${Math.max(safeState.streakDays + 3, 14)}`;

  const greeting = document.getElementById('dashboardGreeting');
  if (greeting) {
    const message = safeState.progress >= 80
      ? 'Você está muito perto de dominar o básico. Continue assim!'
      : safeState.progress >= 50
        ? 'Você já construiu uma boa base. Continue evoluindo.'
        : 'Cada interação ajuda a acelerar seu progresso.';
    greeting.nextElementSibling.textContent = message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged((user) => updateUserUI(user));

  if (window.devmentorProgress) {
    window.devmentorProgress.loadState();
    renderProgress(window.devmentorProgress.getState());
    window.addEventListener('devmentor:progress-updated', (event) => {
      renderProgress(event.detail);
    });
  }
});
