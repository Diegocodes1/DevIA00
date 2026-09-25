import { app } from './config.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

export const db = getFirestore(app);

export async function createUserProfile(uid, data = {}) {
  const payload = {
    nome: data.displayName || 'Usuário',
    email: data.email || '',
    foto: data.photoURL || '',
    objetivo: data.objetivo || 'Aprender e evoluir',
    nivel: data.nivel || 'Iniciante',
    tecnologias: data.tecnologias || ['HTML', 'CSS', 'JavaScript'],
    horasEstudadas: data.horasEstudadas || 0,
    projetosConcluidos: data.projetosConcluidos || 0,
    streak: data.streak || 0,
    plano: data.plano || null,
    dataCadastro: serverTimestamp(),
    ...data
  };

  await setDoc(doc(db, 'users', uid), payload, { merge: true });
  return payload;
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() };
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

export async function saveProgress(uid, progressData) {
  await setDoc(doc(db, 'progress', uid), { ...progressData, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getProgress(uid) {
  const snapshot = await getDoc(doc(db, 'progress', uid));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() };
}

const TIPOS_ATIVIDADE = {
  chat: { label: 'Conversa com o mentor', minutosEstimados: 4 },
  curriculo: { label: 'Currículo analisado', minutosEstimados: 15 },
  curriculo_ats: { label: 'Currículo otimizado para ATS', minutosEstimados: 10 },
  entrevista: { label: 'Simulado de entrevista', minutosEstimados: 20 }
};

function getDiaChave(date = new Date()) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export async function registrarAtividade(uid, tipo, descricao = '') {
  if (!uid || !TIPOS_ATIVIDADE[tipo]) return;

  const atual = await getProgress(uid);
  const activities = atual?.activities || [];
  const diasEstudados = new Set(atual?.diasEstudados || []);

  const agora = new Date();
  const novaAtividade = {
    tipo,
    titulo: TIPOS_ATIVIDADE[tipo].label,
    descricao,
    data: agora.toISOString()
  };

  diasEstudados.add(getDiaChave(agora));

  const activitiesAtualizadas = [novaAtividade, ...activities].slice(0, 30);

  await setDoc(
    doc(db, 'progress', uid),
    {
      activities: activitiesAtualizadas,
      diasEstudados: Array.from(diasEstudados),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

window.devmentorFirestore = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  saveProgress,
  getProgress,
  registrarAtividade,
};
