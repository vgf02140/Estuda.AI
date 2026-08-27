// ============================================
// ESTUDA+
// FIREBASE
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyDe8Koh4JIy0vJdDwrAsCHr42Ci2Ckv5Tc",
    authDomain: "resume-ai-8c0ab.firebaseapp.com",
    projectId: "resume-ai-8c0ab",
    storageBucket: "resume-ai-8c0ab.appspot.com",
    messagingSenderId: "687956768440",
    appId: "1:687956768440:web:93d8e7104bf09821c4264d"
};


// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


// Serviços
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();


// Configura persistência do login
auth.setPersistence(
    firebase.auth.Auth.Persistence.LOCAL
).catch(function (erro) {

    console.error(
        "Erro ao configurar persistência:",
        erro
    );

});


// Disponibiliza globalmente
window.auth = auth;
window.db = db;
window.storage = storage;
