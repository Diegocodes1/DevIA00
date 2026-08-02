const authForm = document.getElementById('authForm');

if (authForm) {
  const firebaseConfig = {
    apiKey: 'AIzaSyC6oefyAK_tYdJT5WjDZbuL3KHJRO0U8rg',
    authDomain: 'devmentorai-fa135.firebaseapp.com',
    projectId: 'devmentorai-fa135',
    storageBucket: 'devmentorai-fa135.firebasestorage.app',
    messagingSenderId: '635119831471',
    appId: '1:635119831471:web:1ab95b1f573c65e5d4075a',
    measurementId: 'G-E8Z7DX5F75'
  };

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const authStatus = document.getElementById('authStatus');
  const submitButton = document.getElementById('authSubmit');
  const tabs = document.querySelectorAll('.auth-tab');
  let mode = 'login';

  function setMode(nextMode) {
    mode = nextMode;
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.authMode === mode));
    submitButton.textContent = mode === 'signup' ? 'Criar conta' : 'Entrar';
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    submitButton.disabled = true;
    submitButton.textContent = 'Aguarde...';
    authStatus.textContent = 'Processando autenticação...';

    try {
      if (mode === 'signup') {
        await auth.createUserWithEmailAndPassword(email, password);
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }

      window.location.href = 'dashboard.html';
    } catch (error) {
      authStatus.textContent = error.message || 'Não foi possível completar a autenticação.';
      submitButton.disabled = false;
      submitButton.textContent = mode === 'signup' ? 'Criar conta' : 'Entrar';
    }
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      authStatus.textContent = `Bem-vindo, ${user.email}.`;
    }
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setMode(tab.dataset.authMode));
  });

  authForm.addEventListener('submit', handleAuthSubmit);

  setMode('login');
}