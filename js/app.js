// Elementi DOM
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const operaioSelect = document.getElementById('operaioSelect');
const pinCode = document.getElementById('pinCode');
const userButton = document.getElementById('userButton');
const userName = document.getElementById('userName');
const registraOreForm = document.getElementById('registraOreForm');
const dataLavoro = document.getElementById('dataLavoro');
const cantiereSelect = document.getElementById('cantiereSelect');
const oreLavorate = document.getElementById('oreLavorate');
const oreStrada = document.getElementById('oreStrada');
const straordinario = document.getElementById('straordinario');
const note = document.getElementById('note');
const riepilogoBody = document.getElementById('riepilogoBody');
const totaleOre = document.getElementById('totaleOre');
const totaleOreStrada = document.getElementById('totaleOreStrada');
const totaleStraordinario = document.getElementById('totaleStraordinario');
const logoutButton = document.getElementById('logoutButton');
const refreshButton = document.getElementById('refreshButton');
const offlineBanner = document.getElementById('offlineBanner');

// Configurazione dati
let operai = [];
let cantieri = [];

// Utente corrente
let currentUser = null;

// Stato connessione
let isOnline = navigator.onLine;

// Alla carica della pagina
document.addEventListener('DOMContentLoaded', function() {
    // Imposta la data di oggi
    const oggi = new Date();
    dataLavoro.valueAsDate = oggi;
    
    // Carica operai
    fetchOperai();
    
    // Carica cantieri
    fetchCantieri();
    
    // Gestisci login
    loginForm.addEventListener('submit', handleLogin);
    
    // Gestisci registrazione ore
    registraOreForm.addEventListener('submit', handleRegistraOre);
    
    // Gestisci logout
    logoutButton.addEventListener('click', handleLogout);
    
    // Gestisci aggiornamento riepilogo
    refreshButton.addEventListener('click', caricaRiepilogo);
    
    // Controlla lo stato online/offline
    checkOnlineStatus();
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    
    // Controlla se l'utente è già loggato
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
        fetch(`${API_BASE_URL}/operai/${savedUserId}`)
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    currentUser = data;
                    doLogin(currentUser);
                }
            })
            .catch(error => console.error('Errore nel recupero dell\'utente:', error));
    }

    if (typeof USE_LOCAL_MODE !== 'undefined' && USE_LOCAL_MODE) {
        console.log('App in modalità locale, non verrà utilizzato il server');
    }
});

// Carica operai dal server
function fetchOperai() {
    fetch(`${API_BASE_URL}/operai`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                operai = data.operai;
                
                // Popola il select
                operaioSelect.innerHTML = '<option value="">Seleziona...</option>';
                operai.forEach(operaio => {
                    const option = document.createElement('option');
                    option.value = operaio.id;
                    option.textContent = operaio.nome + ' ' + operaio.cognome;
                    operaioSelect.appendChild(option);
                });
            } else {
                alert('Errore nel caricamento degli operai');
            }
        })
        .catch(error => {
            console.error('Errore nella richiesta:', error);
            alert('Impossibile caricare gli operai. Controlla la connessione.');
        });
}

// Carica cantieri dal server
function fetchCantieri() {
    fetch(`${API_BASE_URL}/cantieri`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cantieri = data.cantieri;
                
                // Popola il select
                cantiereSelect.innerHTML = '<option value="">Seleziona cantiere...</option>';
                cantieri.forEach(cantiere => {
                    const option = document.createElement('option');
                    option.value = cantiere.id;
                    option.textContent = cantiere.nome;
                    cantiereSelect.appendChild(option);
                });
            } else {
                alert('Errore nel caricamento dei cantieri');
            }
        })
        .catch(error => {
            console.error('Errore nella richiesta:', error);
            alert('Impossibile caricare i cantieri. Controlla la connessione.');
        });
}

// Gestisce il login
function handleLogin(e) {
    e.preventDefault();
    
    const operaioId = operaioSelect.value;
    const pin = pinCode.value;
    
    if (!operaioId || !pin) {
        alert('Seleziona un operaio e inserisci il PIN');
        return;
    }
    
    // Trova l'operaio selezionato
    const operaio = operai.find(op => op.id == operaioId);
    
    if (!operaio) {
        alert('Operaio non trovato');
        return;
    }
    
    // Verifica PIN (in produzione dovresti verificare contro un database)
    if (operaio.pin !== pin) {
        alert('PIN non valido');
        return;
    }
    
    // Effettua login
    currentUser = operaio;
    doLogin(currentUser);
}

// Effettua il login
function doLogin(user) {
    // Salva l'ID utente nel localStorage
    localStorage.setItem('currentUserId', user.id);
    
    // Aggiorna UI
    userName.textContent = user.nome;
    userButton.classList.remove('d-none');
    loginSection.classList.add('d-none');
    appSection.classList.remove('d-none');
    
    // Carica riepilogo
    caricaRiepilogo();
}

// Gestisce la registrazione delle ore
function handleRegistraOre(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Non sei autenticato');
        return;
    }
    
    // Ottieni i valori dal form
    const cantId = cantiereSelect.value;
    const ore = parseFloat(oreLavorate.value);
    const data = dataLavoro.value;
    
    if (!cantId || isNaN(ore) || !data) {
        alert('Assicurati di specificare cantiere, ore e data');
        return;
    }
    
    const dati = {
        operaioId: currentUser.id,
        operaioNome: currentUser.nome + ' ' + currentUser.cognome,
        cantiereId: parseInt(cantId),
        cantiereName: cantieri.find(c => c.id == cantId)?.nome || '',
        data: data,
        ore_lavorate: ore,
        ore_strada: parseFloat(oreStrada.value) || 0,
        straordinario: parseFloat(straordinario.value) || 0,
        note: note.value
    };
    
    console.log('Dati da inviare:', dati);
    
    // In modalità locale o se offline, salva sempre localmente
    if (USE_LOCAL_MODE || !isOnline) {
        // Salva localmente
        salvaLocalmente(dati);
        
        alert('Ore registrate con successo (salvate localmente)');
        
        // Resetta form
        registraOreForm.reset();
        dataLavoro.valueAsDate = new Date();
        
        // Aggiorna riepilogo locale
        caricaRiepilogoLocale();
        
        return;
    }
    
    // Se online e non in modalità locale, invia al server
    fetch(`${API_BASE_URL}/registra-ore`, {
        method: 'POST',
        headers: fetchConfig.headers,
        body: JSON.stringify(dati)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Ore registrate con successo!');
            
            // Resetta form
            registraOreForm.reset();
            dataLavoro.valueAsDate = new Date();
            
            // Aggiorna riepilogo
            caricaRiepilogo();
        } else {
            alert('Errore: ' + result.message);
            console.error('Risposta server:', result);
            
            // In caso di errore, salva localmente
            salvaLocalmente(dati);
            alert('Errore nella registrazione online. I dati sono stati salvati localmente e verranno sincronizzati più tardi.');
        }
    })
    .catch(error => {
        console.error('Errore nella richiesta:', error);
        
        // In caso di errore di rete, salva localmente
        salvaLocalmente(dati);
        alert('Errore di connessione. I dati sono stati salvati localmente e verranno sincronizzati più tardi.');
        
        // Aggiorna riepilogo locale
        caricaRiepilogoLocale();
    });
}

// Carica riepilogo settimanale
function caricaRiepilogo() {
    if (!currentUser) return;
    
    // Prima carica i dati online
    fetch(`${API_BASE_URL}/ore/${currentUser.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let registrazioni = data.registrazioni;
                
                // Carica anche i dati locali e combinali
                const registrazioniLocali = JSON.parse(localStorage.getItem('registrazioniPendenti') || '[]')
                    .filter(r => r.operaioId == currentUser.id);
                
                // Unisci e ordina
                registrazioni = [...registrazioni, ...registrazioniLocali]
                    .sort((a, b) => new Date(b.data) - new Date(a.data));
                
                // Limita alle ultime 7 registrazioni
                const ultimeRegistrazioni = registrazioni.slice(0, 7);
                
                // Aggiorna tabella
                aggiornaTabella(ultimeRegistrazioni);
            } else {
                // Se fallisce, carica solo i dati locali
                caricaRiepilogoLocale();
            }
        })
        .catch(error => {
            console.error('Errore nella richiesta:', error);
            // In caso di errore, carica solo i dati locali
            caricaRiepilogoLocale();
        });
}

// Aggiorna la tabella del riepilogo con i dati forniti
function aggiornaTabella(registrazioni) {
    riepilogoBody.innerHTML = '';
    
    let totOre = 0;
    let totOreStrada = 0;
    let totStraordinario = 0;
    
    if (registrazioni.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" class="text-center">Nessuna registrazione recente</td>';
        riepilogoBody.appendChild(tr);
    } else {
        registrazioni.forEach(reg => {
            const tr = document.createElement('tr');
            
            // Formatta data
            const dataParts = reg.data.split('-');
            const dataFormattata = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
            
            // Determina se è una registrazione locale o sincronizzata
            const isLocale = reg.id && reg.id.toString().startsWith('locale_');
            
            tr.innerHTML = `
                <td>${dataFormattata} ${isLocale ? '<span class="badge bg-warning text-dark">Non sincronizzato</span>' : ''}</td>
                <td>${reg.cantiereName || reg.cantiere_nome}</td>
                <td>${reg.ore_lavorate}</td>
                <td>${reg.ore_strada || 0}</td>
                <td>${reg.straordinario || 0}</td>
            `;
            
            riepilogoBody.appendChild(tr);
            
            totOre += parseFloat(reg.ore_lavorate) || 0;
            totOreStrada += parseFloat(reg.ore_strada) || 0;
            totStraordinario += parseFloat(reg.straordinario) || 0;
        });
    }
    
    // Aggiorna totali
    totaleOre.textContent = totOre.toFixed(1);
    totaleOreStrada.textContent = totOreStrada.toFixed(1);
    totaleStraordinario.textContent = totStraordinario.toFixed(1);
}
// Aggiorna la tabella del riepilogo con i dati forniti
function aggiornaTabella(registrazioni) {
    riepilogoBody.innerHTML = '';
    
    let totOre = 0;
    let totOreStrada = 0;
    let totStraordinario = 0;
    
    if (registrazioni.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" class="text-center">Nessuna registrazione recente</td>';
        riepilogoBody.appendChild(tr);
    } else {
        registrazioni.forEach(reg => {
            const tr = document.createElement('tr');
            
            // Formatta data
            const dataParts = reg.data.split('-');
            const dataFormattata = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
            
            // Determina se è una registrazione locale o sincronizzata
            const isLocale = reg.id && reg.id.toString().startsWith('locale_');
            
            tr.innerHTML = `
                <td>${dataFormattata} ${isLocale ? '<span class="badge bg-warning text-dark">Non sincronizzato</span>' : ''}</td>
                <td>${reg.cantiereName || reg.cantiere_nome}</td>
                <td>${reg.ore_lavorate}</td>
                <td>${reg.ore_strada || 0}</td>
                <td>${reg.straordinario || 0}</td>
            `;
            
            riepilogoBody.appendChild(tr);
            
            totOre += parseFloat(reg.ore_lavorate) || 0;
            totOreStrada += parseFloat(reg.ore_strada) || 0;
            totStraordinario += parseFloat(reg.straordinario) || 0;
        });
    }
    
    // Aggiorna totali
    totaleOre.textContent = totOre.toFixed(1);
    totaleOreStrada.textContent = totOreStrada.toFixed(1);
    totaleStraordinario.textContent = totStraordinario.toFixed(1);
}

// Gestisce il logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUserId');
    
    // Aggiorna UI
    userButton.classList.add('d-none');
    appSection.classList.add('d-none');
    loginSection.classList.remove('d-none');
    
    // Resetta form
    loginForm.reset();
    registraOreForm.reset();
    dataLavoro.valueAsDate = new Date();
}

// Controlla stato connessione
function checkOnlineStatus() {
    const wasOffline = !isOnline;
    isOnline = navigator.onLine;
    
    if (isOnline) {
        offlineBanner.classList.add('d-none');
        
        // Se eravamo offline prima e ora siamo online, e non siamo in modalità locale
        if (wasOffline && !USE_LOCAL_MODE) {
            sincronizzaDati();
        }
    } else {
        offlineBanner.classList.remove('d-none');
    }
}

// Sincronizza dati con Firebase
function sincronizzaDati() {
    if (!isOnline) {
        console.log('Offline, impossibile sincronizzare');
        return;
    }
    
    // Recupera dati locali da sincronizzare
    const registrazioniNonSincronizzate = JSON.parse(localStorage.getItem('registrazioniPendenti') || '[]');
    
    if (registrazioniNonSincronizzate.length === 0) {
        console.log('Nessun dato da sincronizzare');
        return;
    }
    
    console.log(`Sincronizzazione di ${registrazioniNonSincronizzate.length} registrazioni`);
    
    // Sincronizza con Firestore
    const batch = db.batch();
    
    registrazioniNonSincronizzate.forEach(reg => {
        const docRef = db.collection('registrazioniOre').doc();
        batch.set(docRef, {
            ...reg,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    });
    
    batch.commit()
        .then(() => {
            // Rimuovi le registrazioni sincronizzate
            localStorage.removeItem('registrazioniPendenti');
            console.log('Sincronizzazione completata con successo');
            
            // Aggiorna il riepilogo
            caricaRiepilogo();
            
            // Nascondi il banner offline
            offlineBanner.classList.add('d-none');
        })
        .catch(error => {
            console.error('Errore nella sincronizzazione:', error);
        });
}

// Salva localmente quando offline
function salvaLocalmente(dati) {
    // Aggiungi un ID temporaneo
    dati.id = `locale_${Date.now()}`;
    dati.timestampLocale = new Date().toISOString();
    
    // Recupera le registrazioni pendenti esistenti
    const registrazioniPendenti = JSON.parse(localStorage.getItem('registrazioniPendenti') || '[]');
    
    // Aggiungi la nuova registrazione
    registrazioniPendenti.push(dati);
    
    // Salva nel localStorage
    localStorage.setItem('registrazioniPendenti', JSON.stringify(registrazioniPendenti));
    
    console.log('Dati salvati localmente:', dati);
    
    // Aggiorna l'interfaccia
    caricaRiepilogoLocale();
}

// Carica riepilogo dai dati locali
function caricaRiepilogoLocale() {
    // Recupera registrazioni pendenti
    const registrazioniPendenti = JSON.parse(localStorage.getItem('registrazioniPendenti') || '[]');
    
    // Filtra per l'operaio corrente
    const registrazioniOperaio = registrazioniPendenti.filter(r => r.operaioId == currentUser.id);
    
    // Ordina per data (più recenti prima)
    registrazioniOperaio.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Limita alle ultime 7
    const ultimeRegistrazioni = registrazioniOperaio.slice(0, 7);
    
    // Aggiorna tabella
    riepilogoBody.innerHTML = '';
    
    let totOre = 0;
    let totOreStrada = 0;
    let totStraordinario = 0;
    
    if (ultimeRegistrazioni.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="5" class="text-center">Nessuna registrazione recente</td>';
        riepilogoBody.appendChild(tr);
    } else {
        ultimeRegistrazioni.forEach(reg => {
            const tr = document.createElement('tr');
            
            // Formatta data
            const dataParts = reg.data.split('-');
            const dataFormattata = `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`;
            
            tr.innerHTML = `
                <td>${dataFormattata} <span class="badge bg-warning text-dark">Non sincronizzato</span></td>
                <td>${reg.cantiereName}</td>
                <td>${reg.ore_lavorate}</td>
                <td>${reg.ore_strada || 0}</td>
                <td>${reg.straordinario || 0}</td>
            `;
            
            riepilogoBody.appendChild(tr);
            
            totOre += parseFloat(reg.ore_lavorate) || 0;
            totOreStrada += parseFloat(reg.ore_strada) || 0;
            totStraordinario += parseFloat(reg.straordinario) || 0;
        });
    }
    
    // Aggiorna totali
    totaleOre.textContent = totOre.toFixed(1);
    totaleOreStrada.textContent = totOreStrada.toFixed(1);
    totaleStraordinario.textContent = totStraordinario.toFixed(1);
}