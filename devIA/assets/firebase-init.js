(function () {
  const firebaseConfig = {
    apiKey: 'AIzaSyC6oefyAK_tYdJT5WjDZbuL3KHJRO0U8rg',
    authDomain: 'devmentorai-fa135.firebaseapp.com',
    projectId: 'devmentorai-fa135',
    storageBucket: 'devmentorai-fa135.firebasestorage.app',
    messagingSenderId: '635119831471',
    appId: '1:635119831471:web:1ab95b1f573c65e5d4075a',
    measurementId: 'G-E8Z7DX5F75'
  };
 
  if (!window.firebase || !window.firebase.auth) {
    console.error('SDK do Firebase não carregado. Confira as tags <script> do gstatic no HTML.');
    return;
  }
 
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }
})();
 