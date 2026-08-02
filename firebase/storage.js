import { app } from './config.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js';

export const storage = getStorage(app);

export async function uploadUserFile(uid, file, path = 'uploads') {
  if (!file) throw new Error('Arquivo obrigatório.');
  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const fileRef = ref(storage, `${path}/${uid}/${safeName}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

window.devmentorStorage = {
  uploadUserFile
};
