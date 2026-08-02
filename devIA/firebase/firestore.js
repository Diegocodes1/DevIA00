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

window.devmentorFirestore = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  saveProgress,
  getProgress
};
