// ===== Gestão de Provedores - Script Principal Unificado =====

// Configurações globais
const CONFIG = {
    ADMIN_PASSWORD: 'GestaoProvedores@2025#',
    GOOGLE_CLIENT_ID: 'seu_google_client_id_aqui', // Configurar em produção
    API_BASE: window.location.hostname.includes('localhost') 
        ? 'http://localhost:8888/.netlify/functions' 
        : '/.netlify/functions',
    isDevelopment: window.location.hostname.includes('localhost'),
    isNetlify: !window.location.hostname.includes('localhost')
};

// Estado da aplicação
const AppState = {
    isAuthenticated: false,
    currentUser: null,
    isAdmin: false,
    theme: 'dark'
};

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Gestão de Provedores iniciando...');
    initializeApp();
});

function initializeApp() {
    // Verificar estado de autenticação
    checkAuthStatus();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar componentes
    initComponents();
    
    // Configurar Google OAuth se disponível
    if (typeof google !== 'undefined' && !CONFIG.isDevelopment) {
        setupGoogleAuth();
    }
    
    console.log('✅ Aplicação inicializada com sucesso');
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Google login
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Admin access
    const adminAccessBtn = document.getElementById('adminAccess');
    const adminModal = document.getElementById('adminModal');
    if (adminAccessBtn && adminModal) {
        adminAccessBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('adminModal');
        });
    }
    
    // Admin login form
    const adminForm = document.getElementById('adminLoginForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Request access
    const requestAccessBtn = document.querySelector('a[href="#"]:not(.admin-link)');
    if (requestAccessBtn) {
        requestAccessBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('requestModal');
        });
    }
    
    // Request access form
    const requestForm = document.getElementById('requestAccessForm');
    if (requestForm) {
        requestForm.addEventListener('submit', handleAccessRequest);
    }
    
    // Modal close handlers
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close') || 
            e.target.classList.contains('modal-backdrop')) {
            closeModals();
        }
    });
    
    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePassword.querySelector('i').className = 
                isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }
}

// ===== Autenticação =====
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    showLoading('Fazendo login...');
    
    try {
        // Simular login local em desenvolvimento
        if (CONFIG.isDevelopment) {
            await simulateLogin(email, password);
        } else {
            await apiLogin(email, password);
        }
    } catch (error) {
        showNotification(error.message || 'Erro no login', 'error');
    } finally {
        hideLoading();
    }
}

async function handleGoogleLogin(event) {
    event.preventDefault();
    
    showLoading('Conectando com Google...');
    
    try {
        if (CONFIG.isDevelopment) {
            // Simular login do Google em desenvolvimento
            const user = {
                email: 'usuario@gmail.com',
                name: 'Usuário Teste',
                photoURL: 'https://via.placeholder.com/100',
                uid: 'google_' + Date.now()
            };
            
            await loginSuccess(user);
        } else {
            // Login real com Google
            if (typeof google !== 'undefined') {
                const result = await new Promise((resolve, reject) => {
                    google.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                            reject(new Error('Login cancelado'));
                        }
                    });
                });
            } else {
                throw new Error('Google OAuth não configurado');
            }
        }
    } catch (error) {
        showNotification(error.message || 'Erro no login do Google', 'error');
    } finally {
        hideLoading();
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    if (!password) {
        showNotification('Digite a senha de administrador', 'error');
        return;
    }
    
    showLoading('Verificando credenciais...');
    
    try {
        if (CONFIG.isNetlify) {
            // Usar API Netlify
            const result = await apiCall('/auth', {
                action: 'admin_login',
                password: password
            });
            
            if (result.success) {
                await adminLoginSuccess();
            } else {
                throw new Error(result.error || 'Senha incorreta');
            }
        } else {
            // Validação local
            if (password === CONFIG.ADMIN_PASSWORD) {
                await adminLoginSuccess();
            } else {
                throw new Error('Senha de administrador incorreta');
            }
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleAccessRequest(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('requestName'),
        email: formData.get('requestEmail'),
        company: formData.get('requestCompany'),
        reason: formData.get('requestReason')
    };
    
    if (!data.name || !data.email || !data.company || !data.reason) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    showLoading('Enviando solicitação...');
    
    try {
        if (CONFIG.isNetlify) {
            await apiCall('/auth', {
                action: 'request_access',
                ...data
            });
        } else {
            // Simular envio local
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Solicitação de acesso:', data);
        }
        
        showNotification('Solicitação enviada com sucesso!', 'success');
        event.target.reset();
        closeModals();
    } catch (error) {
        showNotification('Erro ao enviar solicitação', 'error');
    } finally {
        hideLoading();
    }
}

// ===== Funções de Sucesso =====
async function loginSuccess(user) {
    AppState.currentUser = user;
    AppState.isAuthenticated = true;
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    
    showNotification('Login realizado com sucesso!', 'success');
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

async function adminLoginSuccess() {
    AppState.isAdmin = true;
    
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminLoginTime', new Date().toISOString());
    
    showNotification('Login administrativo realizado!', 'success');
    closeModals();
    
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 1500);
}

// ===== Simulações para Desenvolvimento =====
async function simulateLogin(email, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validação simples
    if (!email.includes('@')) {
        throw new Error('Email inválido');
    }
    
    if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    const user = {
        email: email,
        name: email.split('@')[0],
        uid: 'local_' + Date.now()
    };
    
    await loginSuccess(user);
}

// ===== API Calls =====
async function apiCall(endpoint, data, method = 'POST') {
    const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

async function apiLogin(email, password) {
    const result = await apiCall('/auth', {
        action: 'login',
        email: email,
        password: password
    });
    
    if (result.success) {
        await loginSuccess(result.user);
    } else {
        throw new Error(result.error || 'Erro no login');
    }
}

// ===== Configuração Google OAuth =====
function setupGoogleAuth() {
    if (CONFIG.GOOGLE_CLIENT_ID === 'seu_google_client_id_aqui') {
        console.warn('⚠️  Google Client ID não configurado');
        return;
    }
    
    google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true
    });
}

function handleGoogleCallback(response) {
    try {
        const credential = response.credential;
        const payload = JSON.parse(atob(credential.split('.')[1]));
        
        const user = {
            email: payload.email,
            name: payload.name,
            photoURL: payload.picture,
            uid: 'google_' + payload.sub
        };
        
        loginSuccess(user);
    } catch (error) {
        showNotification('Erro ao processar login do Google', 'error');
    }
}

// ===== Verificação de Estado =====
function checkAuthStatus() {
    const storedUser = localStorage.getItem('currentUser');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (storedUser && isAuthenticated) {
        AppState.currentUser = JSON.parse(storedUser);
        AppState.isAuthenticated = true;
    }
    
    if (isAdmin) {
        AppState.isAdmin = true;
        
        // Verificar se login admin não expirou (24h)
        const loginTime = localStorage.getItem('adminLoginTime');
        if (loginTime) {
            const elapsed = Date.now() - new Date(loginTime).getTime();
            if (elapsed > 24 * 60 * 60 * 1000) { // 24 horas
                logout();
            }
        }
    }
}

// ===== Logout =====
function logout() {
    AppState.currentUser = null;
    AppState.isAuthenticated = false;
    AppState.isAdmin = false;
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    
    showNotification('Logout realizado com sucesso!', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ===== UI Components =====
function showLoading(message = 'Carregando...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
            <p>${message}</p>
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.querySelector('p').textContent = message;
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showNotification(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
    }
    
    const icon = toast.querySelector('i');
    const span = toast.querySelector('span');
    
    span.textContent = message;
    
    // Definir ícone e cor baseado no tipo
    switch (type) {
        case 'error':
            icon.className = 'fas fa-exclamation-triangle';
            toast.style.background = '#ef4444';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-circle';
            toast.style.background = '#f59e0b';
            break;
        default:
            icon.className = 'fas fa-check-circle';
            toast.style.background = '#10b981';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

// ===== Componentes de Inicialização =====
function initComponents() {
    // Animações de entrada
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.classList.add('fade-in');
        }
    }, 500);
    
    // Animação de contadores
    animateCounters();
    
    // Efeito parallax
    window.addEventListener('scroll', handleParallax);
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

function handleParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
}

// ===== Funções Utilitárias =====
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Exportar para uso global
window.GestaoProvedores = {
    CONFIG,
    AppState,
    logout,
    showNotification,
    showLoading,
    hideLoading
};

console.log('🎯 Gestão de Provedores carregado');