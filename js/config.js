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
  
// Modalità locale senza server API
const USE_LOCAL_MODE = true;
const API_BASE_URL = ''; // Lascia vuoto in modalità locale
  
// Configurazione per le richieste fetch
const fetchConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
};