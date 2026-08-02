import { app } from './config.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { createUserProfile } from './firestore.js';

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

setPersistence(auth, browserLocalPersistence).catch(() => {});

export async function signUp(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  await createUserProfile(credential.user.uid, {
    displayName: displayName || credential.user.email?.split('@')[0] || 'Usuário',
    email: credential.user.email,
    photoURL: credential.user.photoURL || ''
  });
  return credential.user;
}

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await createUserProfile(result.user.uid, {
    displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Usuário',
    email: result.user.email,
    photoURL: result.user.photoURL || ''
  });
  return result.user;
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function signOutUser() {
  await signOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthStateChanged(...args) {
  if (args.length === 2) {
    return onFirebaseAuthStateChanged(args[0], args[1]);
  }

  const [listener] = args;
  return onFirebaseAuthStateChanged(auth, listener);
}

window.devmentorAuth = {
  signUp,
  signIn,
  signInWithGoogle,
  resetPassword,
  signOut: signOutUser,
  getCurrentUser,
  onAuthStateChanged
};
