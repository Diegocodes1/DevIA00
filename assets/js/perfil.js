const firebaseConfig = {
  apiKey: 'AIzaSyC6oefyAK_tYdJT5WjDZbuL3KHJRO0U8rg',
  authDomain: 'devmentorai-fa135.firebaseapp.com',
  projectId: 'devmentorai-fa135',
  storageBucket: 'devmentorai-fa135.firebasestorage.app',
  messagingSenderId: '635119831471',
  appId: '1:635119831471:web:1ab95b1f573c65e5d4075a',
  measurementId: 'G-E8Z7DX5F75'
};

if (!window.firebase?.apps?.length) {
  window.firebase.initializeApp(firebaseConfig);
}

const auth = window.firebase.auth();
const db = window.firebase.firestore();

async function saveUserProfile(user, profileData) {
  if (!user) return;

  const userDoc = db.collection('users').doc(user.uid);
  await userDoc.set(profileData, { merge: true });
  return userDoc;
}

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

function renderProfile(user, profileData) {
  const name = profileData?.nome || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const email = profileData?.email || user?.email || '';
  const level = profileData?.nivel || 'Iniciante';
  const hours = profileData?.horasEstudadas || 0;
  const projects = profileData?.projetosConcluidos || 0;
  const streak = profileData?.streak || 0;
  const progress = Math.min(100, Math.max(10, (hours / 20) * 100));

  document.getElementById('sidebarName').textContent = name;
  document.getElementById('sidebarRole').textContent = level;
  document.getElementById('sidebarAvatar').textContent = getInitials(name);
  document.getElementById('profileAvatar').textContent = getInitials(name);
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileSummary').innerHTML = `${email || 'Seu e-mail'} · <span class="badge">${level}</span>`;
  document.getElementById('profileProgressText').textContent = `${Math.round(progress)}% do caminho para um próximo nível concluído`;
  document.getElementById('profileHours').textContent = `${hours}h`;
  document.getElementById('profileProjects').textContent = projects;
  document.getElementById('profileInterviews').textContent = profileData?.entrevistasRealizadas || 0;
  document.getElementById('profileStreak').textContent = `${streak} dias`;

  document.getElementById('cfgName').value = name;
  document.getElementById('cfgEmail').value = email;
  document.getElementById('cfgLevel').value = level;
}

async function loadProfile() {
  const user = auth.currentUser;
  if (!user) return;

  const userDoc = await db.collection('users').doc(user.uid).get();
  const profileData = userDoc.exists ? userDoc.data() : {};
  renderProfile(user, profileData);
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

  await saveUserProfile(user, payload);

  renderProfile(user, {
    nome: name || user.displayName || 'Usuário',
    email: email || user.email || '',
    nivel: level
  });
  if (window.showToast) {
    window.showToast('Perfil atualizado com sucesso!', 'success');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initProfileTabs();
  document.getElementById('saveProfile')?.addEventListener('click', saveProfile);

  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    loadProfile();
  });
});
