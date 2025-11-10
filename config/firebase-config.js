// ===== Configuração Firebase =====
const firebaseConfig = {
  apiKey: "AIzaSyBk8X7mY9n2P3qR4sT5uV6wX7yZ8A9bC0dE1fG2h",
  authDomain: "netbairro-manager.firebaseapp.com",
  projectId: "netbairro-manager",
  storageBucket: "netbairro-manager.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: "G-ABCDEFGHIJ"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar serviços
const auth = firebase.auth();
const db = firebase.firestore();

// Configuração do Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Configurações de segurança
const ADMIN_PASSWORD = "NetBairro@Admin2024#"; // Senha master do administrador
const ADMIN_EMAIL = "admin@netbairro.com"; // Email do administrador

// Status de usuário
const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

// Configuração de rate limiting
const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  REQUEST_COOLDOWN: 300000 // 5 minutos em ms
};

export { 
  auth, 
  db, 
  googleProvider, 
  ADMIN_PASSWORD, 
  ADMIN_EMAIL, 
  USER_STATUS,
  RATE_LIMITS 
};