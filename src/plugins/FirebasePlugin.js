import Phaser from "phaser";

// 📦 Detectamos el modo actual (arcade o production)
const mode = import.meta.env.VITE_MODE;

// 🔹 Configuración de Firebase
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🔧 Cargamos módulos de Firebase dinámicamente
async function loadFirebaseModules() {
    console.log("🌐 Modo producción: inicializando Firebase...");

    const firebaseApp = await import("firebase/app");
    const firestore = await import("firebase/firestore");
    const auth = await import("firebase/auth");

    return {
        initializeApp: firebaseApp.initializeApp,
        getFirestore: firestore.getFirestore,
        setDoc: firestore.setDoc,
        doc: firestore.doc,
        addDoc: firestore.addDoc,
        collection: firestore.collection,
        query: firestore.query,
        orderBy: firestore.orderBy,
        limit: firestore.limit,
        getDocs: firestore.getDocs,
        getDoc: firestore.getDoc,

        getAuth: auth.getAuth,
        signInWithPopup: auth.signInWithPopup,
        GoogleAuthProvider: auth.GoogleAuthProvider,
        GithubAuthProvider: auth.GithubAuthProvider,
        signInAnonymously: auth.signInAnonymously,
        onAuthStateChanged: auth.onAuthStateChanged,
    };
}

// -------------------------------------------------
// 🔥 PLUGIN PRINCIPAL
// -------------------------------------------------
export default class FirebasePlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);

        this.ready = false;
        this.db = null;
        this.auth = null;
        this.firebaseFns = {};
        this.onLoggedInCallback = () => {};

        if (mode !== "production") {
            console.warn("🎮 Modo arcade: Firebase deshabilitado.");
            return;
        }

        this.initFirebase();
    }

    async initFirebase() {
        try {
            const fns = await loadFirebaseModules();

            const app = fns.initializeApp(firebaseConfig);
            this.db = fns.getFirestore(app);
            this.auth = fns.getAuth(app);
            this.firebaseFns = fns;
            this.ready = true;

            // Evento cuando se loguea alguien
            fns.onAuthStateChanged(this.auth, (user) => {
                if (user && this.onLoggedInCallback) {
                    console.log("👤 Usuario logueado:", user.email || user.uid);
                    this.onLoggedInCallback(user);
                }
            });

            console.log("✅ Firebase inicializado correctamente");
        } catch (err) {
            console.error("🔥 Error al inicializar Firebase:", err);
        }
    }

    onLoggedIn(callback) {
        this.onLoggedInCallback = callback;
    }

    // ================================================
    // 🧩 MÉTODOS DE LOGIN
    // ================================================
    async signInAnonymously() {
        if (!this.ready) return null;
        return await this.firebaseFns.signInAnonymously(this.auth);
    }

    async signInWithGoogle() {
    if (!this.ready) return null;
    
    // 🔧 Configurar el provider con parámetros para reducir errores
    const provider = new this.firebaseFns.GoogleAuthProvider();
    
    // Agregar scopes personalizados si es necesario
    provider.addScope('profile');
    provider.addScope('email');
    
    // Configurar personalización si es necesario
    provider.setCustomParameters({
        'display': 'popup'
    });
    
    try {
        return await this.firebaseFns.signInWithPopup(this.auth, provider);
    } catch (err) {
        console.error("❌ Error en Google SignIn:", err);
        return null;
    }
}

async signInWithGithub() {
    if (!this.ready) return null;
    
    const provider = new this.firebaseFns.GithubAuthProvider();
    
    try {
        return await this.firebaseFns.signInWithPopup(this.auth, provider);
    } catch (err) {
        console.error("❌ Error en GitHub SignIn:", err);
        return null;
    }
}

    getUser() {
        if (!this.ready) return null;
        return this.auth.currentUser;
    }

    // ================================================
    // 🏆 SISTEMA DE SCORES — VERSIÓN FINAL
    // ================================================
    async saveScore(nombre, puntaje) {
        if (!this.ready) return;
        const { addDoc, collection } = this.firebaseFns;

        try {
            await addDoc(collection(this.db, "scores"), {
                nombre,
                puntaje,
                fecha: Date.now()
            });

            console.log("🏆 Score guardado:", nombre, puntaje);
        } catch (err) {
            console.error("❌ Error guardando score:", err);
        }
    }

    async getTopScores(limitCount = 5) { // 🔥 Cambiado de 10 a 5
    if (!this.ready) return [];

    const { collection, query, orderBy, limit, getDocs } = this.firebaseFns;

    try {
        const q = query(
            collection(this.db, "scores"),
            orderBy("puntaje", "desc"),
            orderBy("fecha", "desc"), // 🔥 Ordenar también por fecha si hay empate
            limit(limitCount)
        );

        const snap = await getDocs(q);
        const resultados = [];

        snap.forEach(doc => {
            const data = doc.data();
            resultados.push({
                ...data,
                id: doc.id // 🔥 Incluir ID del documento
            });
        });

        console.log("📥 Scores cargados:", resultados.length);
        return resultados;
    } catch (err) {
        console.error("❌ Error leyendo scores:", err);
        return [];
    }
}
    }
