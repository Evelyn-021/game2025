import Phaser from "phaser";

// 📦 Detectamos el modo actual (arcade o production)
const mode = import.meta.env.VITE_MODE;

// 🔹 Configuración de Firebase (usa tus variables del .env)
// NOTA: Cambia los nombres para que coincidan con tu .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  // Cambiado de VITE_API_KEY
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,  // Cambiado de VITE_AUTH_DOMAIN
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,  // Cambiado de VITE_PROJECT_ID
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,  // Cambiado de VITE_STORAGE_BUCKET
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,  // Cambiado de VITE_MESSAGING_SENDER_ID
  appId: import.meta.env.VITE_FIREBASE_APP_ID,  // Cambiado de VITE_APP_ID
};

// 🔧 Inicializador asíncrono (ahora dentro de una función)
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
    createUserWithEmailAndPassword: auth.createUserWithEmailAndPassword,
    signInWithEmailAndPassword: auth.signInWithEmailAndPassword,
    signInAnonymously: auth.signInAnonymously,
    signInWithPopup: auth.signInWithPopup,
    onAuthStateChanged: auth.onAuthStateChanged,
    GoogleAuthProvider: auth.GoogleAuthProvider,
    GithubAuthProvider: auth.GithubAuthProvider,
  };
}

// 🔸 Clase del Plugin de Firebase
export default class FirebasePlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);

    this.ready = false;
    this.db = null;
    this.auth = null;
    this.onLoggedInCallback = () => {};

    if (mode !== "production") {
      console.warn("🎮 Modo arcade: Firebase deshabilitado.");
      return;
    }

    // Cargar Firebase dinámicamente dentro de una función async
    this.initFirebase();
  }

  async initFirebase() {
    try {
      const {
        initializeApp,
        getFirestore,
        getAuth,
        setDoc,
        doc,
        addDoc,
        collection,
        query,
        orderBy,
        limit,
        getDocs,
        getDoc,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signInAnonymously,
        signInWithPopup,
        onAuthStateChanged,
        GoogleAuthProvider,
        GithubAuthProvider,
      } = await loadFirebaseModules();

      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
      this.auth = getAuth(app);
      this.ready = true;

      // Guardamos referencias a los métodos globales
      this.firebaseFns = {
        setDoc,
        doc,
        addDoc,
        collection,
        query,
        orderBy,
        limit,
        getDocs,
        getDoc,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signInAnonymously,
        signInWithPopup,
        onAuthStateChanged,
        GoogleAuthProvider,
        GithubAuthProvider,
      };

      // Detectar inicio de sesión
      onAuthStateChanged(this.auth, (user) => {
        if (user && this.onLoggedInCallback) this.onLoggedInCallback(user);
      });

      console.log("✅ Firebase inicializado correctamente");
    } catch (err) {
      console.error("🔥 Error al inicializar Firebase:", err);
    }
  }

  destroy() {
    super.destroy();
  }

  onLoggedIn(callback) {
    this.onLoggedInCallback = callback;
  }

  // 🧩 Métodos principales de Firebase Auth
  async createUserWithEmail(email, password) {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { createUserWithEmailAndPassword } = this.firebaseFns;
    const credentials = await createUserWithEmailAndPassword(this.auth, email, password);
    return credentials.user;
  }

  async signInWithEmail(email, password) {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { signInWithEmailAndPassword } = this.firebaseFns;
    const credentials = await signInWithEmailAndPassword(this.auth, email, password);
    return credentials.user;
  }

  async signInAnonymously() {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { signInAnonymously } = this.firebaseFns;
    const credentials = await signInAnonymously(this.auth);
    console.log("✅ Usuario anónimo:", credentials.user.uid);
    return credentials.user;
  }

  async signInWithGoogle() {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { signInWithPopup, GoogleAuthProvider } = this.firebaseFns;
    const provider = new GoogleAuthProvider();
    const credentials = await signInWithPopup(this.auth, provider);
    console.log("✅ Usuario Google:", credentials.user.displayName);
    return credentials.user;
  }

  async signInWithGithub() {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { signInWithPopup, GithubAuthProvider } = this.firebaseFns;
    const provider = new GithubAuthProvider();
    const credentials = await signInWithPopup(this.auth, provider);
    console.log("✅ Usuario GitHub:", credentials.user.displayName);
    return credentials.user;
  }

  getUser() {
    if (!this.ready) return null;
    return this.auth.currentUser;
  }

  // 🧠 Métodos para guardar/cargar datos
  async saveGameData(userId, data) {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { setDoc, doc } = this.firebaseFns;
    await setDoc(doc(this.db, "game-data", userId), data);
  }

  async loadGameData(userId) {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { getDoc, doc } = this.firebaseFns;
    const snap = await getDoc(doc(this.db, "game-data", userId));
    return snap.data();
  }

  async addHighScore(name, score) {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { addDoc, collection } = this.firebaseFns;
    await addDoc(collection(this.db, "high-scores"), {
      name,
      score,
      createdAt: new Date(),
    });
  }

  async getHighScores() {
    if (!this.ready) return console.warn("Firebase no está listo todavía");
    const { query, collection, orderBy, limit, getDocs } = this.firebaseFns;
    const q = query(collection(this.db, "high-scores"), orderBy("score", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const scores = [];
    querySnapshot.forEach((d) => scores.push(d.data()));
    return scores;
  }
}