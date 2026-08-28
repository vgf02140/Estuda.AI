// ==========================================
// ESTUDA+
// CONFIGURAÇÃO DO FIREBASE
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";



// ==========================================
// CONFIGURAÇÃO DO SEU FIREBASE
// ==========================================
//
// Cole aqui a configuração fornecida
// pelo Firebase Console.
//

const firebaseConfig = {

    apiKey:
        "COLE_SUA_API_KEY_AQUI",

    authDomain:
        "SEU-PROJETO.firebaseapp.com",

    projectId:
        "SEU-PROJETO",

    storageBucket:
        "SEU-PROJETO.firebasestorage.app",

    messagingSenderId:
        "SEU_SENDER_ID",

    appId:
        "SEU_APP_ID"

};



// ==========================================
// INICIALIZAÇÃO
// ==========================================

const app =
    initializeApp(
        firebaseConfig
    );


// Firebase Authentication
const auth =
    getAuth(app);


// Firestore
const db =
    getFirestore(app);


// Storage
const storage =
    getStorage(app);



// ==========================================
// DISPONIBILIZAR PARA OS OUTROS ARQUIVOS
// ==========================================

export {

    app,

    auth,

    db,

    storage,

    onAuthStateChanged,

    signInWithEmailAndPassword,

    createUserWithEmailAndPassword,

    signOut,

    updateProfile,

    collection,

    doc,

    getDoc,

    getDocs,

    addDoc,

    setDoc,

    updateDoc,

    query,

    where,

    orderBy,

    limit,

    serverTimestamp,

    ref,

    uploadBytes,

    getDownloadURL

};
