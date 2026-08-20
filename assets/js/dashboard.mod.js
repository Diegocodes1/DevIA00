import { onAuthStateChanged } from '../../backend/firebase/auth.js';
import { getProgress } from '../../backend/firebase/firestore.js';

const ICONE_POR_TIPO = { chat: '💬', curriculo: '📄', curriculo_ats: '📄', entrevista: '🎯' };

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
  const initials = displayName.split(' ').slice(0, 2).map((p) => p[0] || '').join('').toUpperCase() || 'U';

  if (sidebarName) sidebarName.textContent = displayName;
  if (sidebarRole) sidebarRole.textContent = user.email || 'Usuário autenticado';
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (greeting) greeting.textContent = `Olá, ${displayName} 👋`;
}

function calcularStreak(diasEstudados) {
  const dias = new Set(diasEstudados || []);
  if (dias.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  if (!dias.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dias.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calcularHorasEstimadas(activities) {
  const MINUTOS = { chat: 4, curriculo: 15, curriculo_ats: 10, entrevista: 20 };
  const totalMinutos = (activities || []).reduce((soma, a) => soma + (MINUTOS[a.tipo] || 5), 0);
  return totalMinutos / 60;
}

function tempoRelativo(isoDate) {
  const diffMin = Math.round((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return diffH === 1 ? 'há 1 hora' : `há ${diffH} horas`;
  const diffDias = Math.round(diffH / 24);
  return diffDias === 1 ? 'ontem' : `há ${diffDias} dias`;
}

function renderAtividades(activities) {
  const lista = document.querySelector('.activity-list');
  if (!lista) return;

  if (!activities || activities.length === 0) {
    lista.innerHTML = '<li class="activity-item"><div class="activity-text"><p>Nenhuma atividade ainda. Use o chat, analise um currículo ou simule uma entrevista para começar.</p></div></li>';
    return;
  }

  lista.innerHTML = activities.slice(0, 4).map((a) => `
    <li class="activity-item">
      <span class="activity-icon">${ICONE_POR_TIPO[a.tipo] || '•'}</span>
      <div class="activity-text">
        <strong>${a.titulo}</strong>
        ${a.descricao ? `<p>${a.descricao}</p>` : ''}
      </div>
      <span class="activity-time">${tempoRelativo(a.data)}</span>
    </li>
  `).join('');
}

function renderCalendario(diasEstudados) {
  const container = document.getElementById('studyCalendar');
  if (!container) return;

  const dias = new Set(diasEstudados || []);
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const hojeChave = hoje.toISOString().slice(0, 10);

  let html = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((l) => `<span class="cal-label">${l}</span>`).join('');
  for (let i = 0; i < primeiroDiaSemana; i += 1) html += '<span class="cal-day empty"></span>';

  for (let dia = 1; dia <= totalDias; dia += 1) {
    const chave = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const classes = ['cal-day'];
    if (dias.has(chave)) classes.push('studied');
    if (chave === hojeChave) classes.push('today');
    html += `<span class="${classes.join(' ')}">${dia}</span>`;
  }

  container.innerHTML = html;
}

async function renderProgressoReal(uid) {
  const progresso = await getProgress(uid);
  const activities = progresso?.activities || [];
  const diasEstudados = progresso?.diasEstudados || [];

  const horas = calcularHorasEstimadas(activities);
  const streak = calcularStreak(diasEstudados);
  const projetosConcluidos = activities.filter((a) => a.tipo === 'curriculo' || a.tipo === 'curriculo_ats' || a.tipo === 'entrevista').length;
  const progressoPercentual = Math.min(100, Math.round((activities.length / 40) * 100));

  const el = (id) => document.getElementById(id);
  if (el('progressValue')) el('progressValue').textContent = `${progressoPercentual}%`;
  if (el('progressBar')) { el('progressBar').setAttribute('data-value', progressoPercentual); el('progressBar').style.width = `${progressoPercentual}%`; }
  if (el('hoursValue')) el('hoursValue').textContent = `${horas.toFixed(1).replace('.0', '')}h`;
  if (el('hoursDelta')) el('hoursDelta').textContent = activities.length ? `${activities.length} atividades registradas` : 'nenhuma atividade ainda';
  if (el('projectsValue')) el('projectsValue').textContent = `${projetosConcluidos}`;
  if (el('projectsDelta')) el('projectsDelta').textContent = projetosConcluidos ? 'currículos e entrevistas' : 'nenhum ainda';
  if (el('streakValue')) el('streakValue').textContent = `${streak} ${streak === 1 ? 'dia' : 'dias'}`;
  if (el('streakDelta')) el('streakDelta').textContent = streak > 0 ? 'continue assim!' : 'comece hoje';

  renderCalendario(diasEstudados);
  renderAtividades(activities);
}

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged((user) => {
    updateUserUI(user);
    if (user) renderProgressoReal(user.uid);
  });
});