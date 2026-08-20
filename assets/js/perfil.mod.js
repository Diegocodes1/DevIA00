import { auth, onAuthStateChanged } from '../../backend/firebase/auth.js';
import { getUserProfile, updateUserProfile, getProgress } from '../../backend/firebase/firestore.js';

function initProfileTabs() {
  const tabs = document.querySelectorAll('.profile-tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.hidden = panel.dataset.panel !== target;
      });
    });
  });
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
}

function calcularHorasEstimadas(activities) {
  const MINUTOS = { chat: 4, curriculo: 15, curriculo_ats: 10, entrevista: 20 };
  const totalMinutos = (activities || []).reduce((soma, a) => soma + (MINUTOS[a.tipo] || 5), 0);
  return totalMinutos / 60;
}

function getDiaChaveLocal(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function calcularStreak(diasEstudados) {
  const dias = new Set(diasEstudados || []);
  if (dias.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  if (!dias.has(getDiaChaveLocal(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dias.has(getDiaChaveLocal(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderProfile(user, profileData, progressData) {
  const name = profileData?.nome || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const email = profileData?.email || user?.email || '';
  const level = profileData?.nivel || 'Iniciante';

  const activities = progressData?.activities || [];
  const diasEstudados = progressData?.diasEstudados || [];

  const hours = calcularHorasEstimadas(activities);
  const streak = calcularStreak(diasEstudados);
  const projects = activities.filter((a) => a.tipo === 'curriculo' || a.tipo === 'curriculo_ats').length;
  const interviews = activities.filter((a) => a.tipo === 'entrevista').length;
  const progress = Math.min(100, Math.round((activities.length / 40) * 100));

  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarRole').textContent = level;
  document.getElementById('sidebarAvatar').textContent = getInitials(name);
  document.getElementById('profileAvatar').textContent = getInitials(name);
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileSummary').innerHTML = `${email || 'Seu e-mail'} · <span class="badge">${level}</span>`;
  document.getElementById('profileProgressText').textContent = activities.length
    ? `${progress}% do caminho, com base em ${activities.length} atividades registradas`
    : 'Nenhuma atividade ainda — use o chat, analise um currículo ou simule uma entrevista';
  document.querySelector('.progress-fill').style.width = `${progress}%`;
  document.querySelector('.progress-fill').setAttribute('data-value', progress);
  document.getElementById('profileHours').textContent = `${hours.toFixed(1).replace('.0', '')}h`;
  document.getElementById('profileProjects').textContent = projects;
  document.getElementById('profileInterviews').textContent = interviews;
  document.getElementById('profileStreak').textContent = `${streak} ${streak === 1 ? 'dia' : 'dias'}`;

  document.getElementById('cfgName').value = name;
  document.getElementById('cfgEmail').value = email;
  document.getElementById('cfgLevel').value = level;
}

async function loadProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const [profileData, progressData] = await Promise.all([
    getUserProfile(user.uid),
    getProgress(user.uid)
  ]);

  renderProfile(user, profileData || {}, progressData || {});
}

async function saveProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const name = document.getElementById('cfgName').value.trim();
  const email = document.getElementById('cfgEmail').value.trim();
  const level = document.getElementById('cfgLevel').value;

  const payload = {
    nome: name || user.displayName || 'Usuário',
    email: email || user.email || '',
    nivel: level
  };

  await updateUserProfile(user.uid, payload);
  await loadProfile();

  if (window.showToast) {
    window.showToast('Perfil atualizado com sucesso!', 'success');
  }
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

function attachProfileEvents() {
  document.getElementById('saveProfile')?.addEventListener('click', saveProfile);
}

document.addEventListener('DOMContentLoaded', () => {
  initProfileTabs();
  attachProfileEvents();
  onAuthStateChanged((user) => {
    if (!user) {
      redirectToLogin();
      return;
    }
    loadProfile();
  });
});