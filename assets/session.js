import { onAuthStateChanged } from '../backend/firebase/auth.js';

onAuthStateChanged((user) => {
  const name = document.getElementById('sidebarName');
  const role = document.getElementById('sidebarRole');
  const avatar = document.getElementById('sidebarAvatar');

  if (user) {
    if (name) name.textContent = user.displayName || user.email?.split('@')[0] || 'Usuário';
    if (role) role.textContent = 'Online';
    if (avatar) avatar.textContent = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
  } else {
    if (role) role.textContent = 'Não conectado';
  }
});