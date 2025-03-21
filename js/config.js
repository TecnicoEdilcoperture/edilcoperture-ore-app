// Configurazione Firebase
const firebaseConfig = {
    apiKey: "INSERISCI_LA_TUA_API_KEY",
    authDomain: "edilcoperture-ore-app.firebaseapp.com",
    projectId: "edilcoperture-ore-app",
    storageBucket: "edilcoperture-ore-app.appspot.com",
    messagingSenderId: "299314312883",
    appId: "INSERISCI_APP_ID"
};
  
// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
  
// URL base dell'API (backend remoto)
const API_BASE_URL = 'https://edilcoperture-api.onrender.com/api';
  
// Configurazione per le richieste fetch
const fetchConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
};