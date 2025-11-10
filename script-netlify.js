// ===== NetBairro Manager - Script Principal =====

let currentUser = null;
let isAdmin = false;

// URLs das funções Netlify
const API_BASE = window.location.hostname.includes('localhost') 
    ? 'http://localhost:8888/.netlify/functions' 
    : '/.netlify/functions';

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    initAnimations();
    checkAuthStatus();
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Google Login
    setupGoogleAuth();
    
    // Admin Modal
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModal = document.querySelector('.close-admin-modal');
    
    if (adminBtn) {
        adminBtn.onclick = () => adminModal.style.display = 'block';
    }
    
    if (closeAdminModal) {
        closeAdminModal.onclick = () => adminModal.style.display = 'none';
    }
    
    // Admin Login Form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.onsubmit = handleAdminLogin;
    }
    
    // Access Request Form
    const accessRequestForm = document.getElementById('accessRequestForm');
    if (accessRequestForm) {
        accessRequestForm.onsubmit = handleAccessRequest;
    }
    
    // Close modals on outside click
    window.onclick = function(event) {
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
        }
    };
}

// ===== Google Authentication =====
function setupGoogleAuth() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: "SEU_GOOGLE_CLIENT_ID", // Substituir pelo ID real
            callback: handleGoogleLogin,
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // Renderizar botão de login
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        if (googleLoginBtn) {
            google.accounts.id.renderButton(googleLoginBtn, {
                theme: 'filled_blue',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left'
            });
        }
    }
}

async function handleGoogleLogin(response) {
    try {
        const credential = response.credential;
        const payload = JSON.parse(atob(credential.split('.')[1]));
        
        const userData = {
            email: payload.email,
            name: payload.name,
            photoUrl: payload.picture,
            googleId: payload.sub
        };

        showLoading('Fazendo login...');
        
        const result = await apiCall('/auth', {
            action: 'login',
            ...userData
        });

        hideLoading();

        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Login realizado com sucesso!', 'success');
            
            // Redirecionar para dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            if (result.status === 'pending') {
                showNotification('Sua conta está pendente de aprovação. Aguarde a análise do administrador.', 'warning');
            } else {
                showNotification(result.error || 'Erro no login', 'error');
            }
        }
    } catch (error) {
        hideLoading();
        console.error('Erro no login do Google:', error);
        showNotification('Erro ao processar login. Tente novamente.', 'error');
    }
}

// ===== Admin Login =====
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const password = formData.get('adminPassword');
    
    if (!password) {
        showNotification('Digite a senha de administrador', 'error');
        return;
    }

    try {
        showLoading('Verificando credenciais...');
        
        const result = await apiCall('/auth', {
            action: 'admin_login',
            password: password
        });

        hideLoading();

        if (result.success) {
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            
            showNotification('Login administrativo realizado!', 'success');
            
            // Fechar modal
            document.getElementById('adminModal').style.display = 'none';
            
            // Redirecionar para admin
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } else {
            showNotification(result.error || 'Senha incorreta', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Erro no login admin:', error);
        showNotification('Erro ao verificar credenciais', 'error');
    }
}

// ===== Access Request =====
async function handleAccessRequest(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const requestData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        reason: formData.get('reason')
    };

    // Validação básica
    if (!requestData.name || !requestData.email || !requestData.company || !requestData.reason) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    try {
        showLoading('Enviando solicitação...');
        
        const result = await apiCall('/auth', {
            action: 'request_access',
            ...requestData
        });

        hideLoading();

        if (result.success) {
            showNotification('Solicitação enviada com sucesso! Aguarde a análise do administrador.', 'success');
            event.target.reset();
        } else {
            showNotification(result.error || 'Erro ao enviar solicitação', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Erro na solicitação de acesso:', error);
        showNotification('Erro ao enviar solicitação. Tente novamente.', 'error');
    }
}

// ===== API Calls =====
async function apiCall(endpoint, data, method = 'POST') {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
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
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

// ===== Auth Status =====
function checkAuthStatus() {
    const storedUser = localStorage.getItem('currentUser');
    const storedAdmin = localStorage.getItem('isAdmin');
    
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    if (storedAdmin === 'true') {
        isAdmin = true;
    }
}

// ===== Logout =====
function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    
    showNotification('Logout realizado com sucesso!', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ===== UI Functions =====
function showLoading(message = 'Carregando...') {
    // Verificar se já existe um loading
    let loadingEl = document.getElementById('globalLoading');
    
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'globalLoading';
        loadingEl.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(loadingEl);
    } else {
        loadingEl.querySelector('p').textContent = message;
    }
    
    loadingEl.style.display = 'flex';
}

function hideLoading() {
    const loadingEl = document.getElementById('globalLoading');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        default: return 'info-circle';
    }
}

// ===== Animações =====
function initAnimations() {
    // Animação de entrada para hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('fade-in');
        }, 500);
    }
    
    // Animação para feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, 800 + (index * 200));
    });
    
    // Parallax effect no scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// ===== Utility Functions =====
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pendente',
        'approved': 'Aprovado',
        'rejected': 'Rejeitado',
        'suspended': 'Suspenso'
    };
    
    return statusMap[status] || status;
}

// ===== CSS Adicional via JavaScript =====
const additionalStyles = `
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.loading-spinner {
    text-align: center;
    color: white;
}

.loading-spinner i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.notification {
    position: fixed;
    top: 20px;
    right: -400px;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 9999;
    transition: all 0.3s ease;
    max-width: 400px;
    border-left: 4px solid var(--primary-color);
}

.notification.show {
    right: 20px;
}

.notification-success {
    border-left-color: #10b981;
}

.notification-error {
    border-left-color: #ef4444;
}

.notification-warning {
    border-left-color: #f59e0b;
}

.notification button {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 0.5rem;
}

.fade-in {
    opacity: 0;
    animation: fadeIn 0.8s ease forwards;
}

.fade-in-up {
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.8s ease forwards;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Adicionar estilos ao head
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);