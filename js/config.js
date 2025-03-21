// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBCwlQZ2wBlPjzLhHGmvySktJjQgW_FojM",
    authDomain: "edilcoperture-ore-app.firebaseapp.com",
    projectId: "edilcoperture-ore-app",
    storageBucket: "edilcoperture-ore-app.firebasestorage.app",
    messagingSenderId: "299314312883",
    appId: "1:299314312883:web:6e9d75741f202c9c8722c6",
    measurementId: "G-MX9TS4XJS5"
  };
  
// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
  
// Modalità locale senza server API - IMPORTANTE: questa deve essere true
const USE_LOCAL_MODE = false;
  
// URL base dell'API - impostato a stringa vuota per evitare richieste
const API_BASE_URL = '';
  
// Configurazione per le richieste fetch
const fetchConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
};