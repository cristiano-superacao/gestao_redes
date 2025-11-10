// ===== Gestão de Provedores - Configuração Unificada de Banco =====

// Detectar ambiente
const isProduction = !window.location.hostname.includes('localhost');
const isNetlify = window.location.hostname.includes('netlify.app') || 
                  window.location.hostname.includes('netlify.com');

// Configuração do banco de dados
const DatabaseConfig = {
    // Configurações Supabase (Produção Netlify)
    supabase: {
        url: 'https://seu-projeto.supabase.co',
        anonKey: 'sua_chave_publica_supabase',
        serviceKey: 'sua_chave_service_supabase' // Apenas no servidor
    },
    
    // Configurações Firebase (Alternativa)
    firebase: {
        apiKey: "sua_api_key_firebase",
        authDomain: "seu-projeto.firebaseapp.com",
        projectId: "seu-projeto",
        storageBucket: "seu-projeto.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456"
    },
    
    // Configuração ativa baseada no ambiente
    active: isNetlify ? 'supabase' : 'local',
    
    // Admin password
    adminPassword: 'GestaoProvedores@2025#'
};

// ===== Classe de Gerenciamento do Banco =====
class DatabaseManager {
    constructor() {
        this.config = DatabaseConfig;
        this.client = null;
        this.isInitialized = false;
    }
    
    async initialize() {
        try {
            if (this.config.active === 'supabase') {
                await this.initializeSupabase();
            } else if (this.config.active === 'firebase') {
                await this.initializeFirebase();
            } else {
                await this.initializeLocal();
            }
            
            this.isInitialized = true;
            console.log(`✅ Banco de dados inicializado: ${this.config.active}`);
        } catch (error) {
            console.error('❌ Erro ao inicializar banco:', error);
            // Fallback para modo local
            await this.initializeLocal();
        }
    }
    
    async initializeSupabase() {
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase client não encontrado');
        }
        
        this.client = supabase.createClient(
            this.config.supabase.url,
            this.config.supabase.anonKey
        );
    }
    
    async initializeFirebase() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não encontrado');
        }
        
        if (!firebase.apps.length) {
            firebase.initializeApp(this.config.firebase);
        }
        
        this.client = {
            auth: firebase.auth(),
            firestore: firebase.firestore()
        };
    }
    
    async initializeLocal() {
        console.log('🔧 Modo local - usando localStorage');
        this.client = {
            type: 'local',
            storage: localStorage
        };
    }
    
    // ===== Métodos de Autenticação =====
    async loginWithEmail(email, password) {
        if (this.config.active === 'supabase') {
            return await this.supabaseEmailLogin(email, password);
        } else if (this.config.active === 'firebase') {
            return await this.firebaseEmailLogin(email, password);
        } else {
            return await this.localLogin(email, password);
        }
    }
    
    async loginWithGoogle() {
        if (this.config.active === 'supabase') {
            return await this.supabaseGoogleLogin();
        } else if (this.config.active === 'firebase') {
            return await this.firebaseGoogleLogin();
        } else {
            return await this.localGoogleLogin();
        }
    }
    
    async adminLogin(password) {
        if (password === this.config.adminPassword) {
            const adminUser = {
                uid: 'admin_' + Date.now(),
                email: 'admin@gestaoprovedores.com',
                name: 'Administrador',
                role: 'admin',
                isAdmin: true
            };
            
            localStorage.setItem('adminUser', JSON.stringify(adminUser));
            return adminUser;
        } else {
            throw new Error('Senha de administrador incorreta');
        }
    }
    
    // ===== Métodos Supabase =====
    async supabaseEmailLogin(email, password) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        return data.user;
    }
    
    async supabaseGoogleLogin() {
        const { data, error } = await this.client.auth.signInWithOAuth({
            provider: 'google'
        });
        
        if (error) throw error;
        return data.user;
    }
    
    // ===== Métodos Firebase =====
    async firebaseEmailLogin(email, password) {
        const result = await this.client.auth.signInWithEmailAndPassword(email, password);
        return result.user;
    }
    
    async firebaseGoogleLogin() {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await this.client.auth.signInWithPopup(provider);
        return result.user;
    }
    
    // ===== Métodos Locais (Desenvolvimento) =====
    async localLogin(email, password) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validação básica
        if (!email.includes('@')) {
            throw new Error('Email inválido');
        }
        
        if (password.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }
        
        const user = {
            uid: 'local_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            photoURL: 'https://via.placeholder.com/100'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    
    async localGoogleLogin() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = {
            uid: 'google_local_' + Date.now(),
            email: 'usuario@gmail.com',
            name: 'Usuário Teste Google',
            photoURL: 'https://via.placeholder.com/100'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }
    
    // ===== Métodos de Dados =====
    async saveUser(user) {
        if (this.config.active === 'supabase') {
            return await this.saveUserSupabase(user);
        } else if (this.config.active === 'firebase') {
            return await this.saveUserFirebase(user);
        } else {
            return await this.saveUserLocal(user);
        }
    }
    
    async getUsers() {
        if (this.config.active === 'supabase') {
            return await this.getUsersSupabase();
        } else if (this.config.active === 'firebase') {
            return await this.getUsersFirebase();
        } else {
            return await this.getUsersLocal();
        }
    }
    
    async saveUserLocal(user) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({ ...user, id: Date.now() });
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }
    
    async getUsersLocal() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }
    
    // ===== Métodos de Solicitação de Acesso =====
    async saveAccessRequest(request) {
        if (this.config.active === 'local') {
            const requests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
            requests.push({ ...request, id: Date.now(), status: 'pending' });
            localStorage.setItem('accessRequests', JSON.stringify(requests));
            return request;
        }
        // Implementar para Supabase/Firebase conforme necessário
    }
    
    async getAccessRequests() {
        if (this.config.active === 'local') {
            return JSON.parse(localStorage.getItem('accessRequests') || '[]');
        }
        // Implementar para Supabase/Firebase conforme necessário
        return [];
    }
    
    // ===== Logout =====
    async logout() {
        if (this.config.active === 'supabase') {
            await this.client.auth.signOut();
        } else if (this.config.active === 'firebase') {
            await this.client.auth.signOut();
        }
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('isAdmin');
    }
}

// ===== Instância Global =====
const dbManager = new DatabaseManager();

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    await dbManager.initialize();
});

// Exportar para uso global
window.DatabaseManager = DatabaseManager;
window.dbManager = dbManager;

console.log('🗄️  Database Manager carregado');