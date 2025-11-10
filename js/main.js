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
    setupFooterLinks();
    setupFormValidation();
    setupRequestForm();
    
    // Configuração específica por página
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'dashboard.html') {
        setupDashboardNavigation();
        
        // Load initial dashboard section from URL hash
        const hash = window.location.hash.slice(1);
        if (hash) {
            showDashboardSection(hash);
            
            // Set active navigation link
            const navLink = document.querySelector(`.nav-link[data-section="${hash}"]`);
            if (navLink) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    }
    
    if (currentPage === 'admin.html') {
        setupAdminFunctions();
    }
    
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
    
    // Request access link
    const requestAccessLink = document.querySelector('a[href="#"]:not(.admin-link)');
    if (requestAccessLink) {
        requestAccessLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('requestModal');
        });
    }
    
    // Request access form
    const requestForm = document.getElementById('requestAccessForm');
    if (requestForm) {
        requestForm.addEventListener('submit', handleAccessRequest);
    }
    
    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
    
    // Footer links
    setupFooterLinks();
    
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
    
    // Remember me checkbox
    const rememberCheckbox = document.getElementById('remember');
    if (rememberCheckbox) {
        // Load saved state
        const remembered = localStorage.getItem('rememberLogin') === 'true';
        rememberCheckbox.checked = remembered;
        
        if (remembered) {
            const savedEmail = localStorage.getItem('savedEmail');
            const emailInput = document.getElementById('email');
            if (savedEmail && emailInput) {
                emailInput.value = savedEmail;
            }
        }
        
        rememberCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('rememberLogin', e.target.checked);
            if (!e.target.checked) {
                localStorage.removeItem('savedEmail');
            }
        });
    }
    
    // Dashboard navigation (se estiver na página do dashboard)
    if (window.location.pathname.includes('dashboard')) {
        setupDashboardNavigation();
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

// ===== Forgot Password =====
function handleForgotPassword(event) {
    event.preventDefault();
    
    showNotification('Funcionalidade de recuperação de senha em desenvolvimento', 'info');
    
    // Implementar modal de reset de senha
    const resetModal = createResetPasswordModal();
    document.body.appendChild(resetModal);
    showModal('resetPasswordModal');
}

function createResetPasswordModal() {
    const modal = document.createElement('div');
    modal.id = 'resetPasswordModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-key"></i> Recuperar Senha</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="resetPasswordForm">
                    <div class="form-group">
                        <label for="resetEmail" class="form-label">
                            <i class="fas fa-envelope"></i>
                            E-mail para recuperação
                        </label>
                        <input 
                            type="email" 
                            id="resetEmail" 
                            class="form-input" 
                            placeholder="Seu e-mail cadastrado"
                            required
                        >
                    </div>
                    <button type="submit" class="btn-primary full-width">
                        <span>Enviar Link de Recuperação</span>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    `;
    
    // Add event listener for reset form
    modal.querySelector('#resetPasswordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = modal.querySelector('#resetEmail').value;
        
        showLoading('Enviando e-mail...');
        
        setTimeout(() => {
            hideLoading();
            showNotification('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
            closeModals();
            modal.remove();
        }, 2000);
    });
    
    return modal;
}

// ===== Modal Functions =====
function showFeatureModal() {
    const modal = createInfoModal('features', 'Funcionalidades', `
        <div class="features-grid">
            <div class="feature-item">
                <i class="fas fa-users"></i>
                <h4>Gestão de Clientes</h4>
                <p>Cadastro completo, histórico de atendimento, controle de pagamentos</p>
            </div>
            <div class="feature-item">
                <i class="fas fa-network-wired"></i>
                <h4>Monitoramento de Rede</h4>
                <p>Monitoramento em tempo real, alertas automáticos, relatórios de performance</p>
            </div>
            <div class="feature-item">
                <i class="fas fa-chart-line"></i>
                <h4>Analytics Avançado</h4>
                <p>Dashboards interativos, métricas de negócio, relatórios customizáveis</p>
            </div>
            <div class="feature-item">
                <i class="fas fa-headset"></i>
                <h4>Central de Suporte</h4>
                <p>Sistema de tickets, base de conhecimento, chat em tempo real</p>
            </div>
            <div class="feature-item">
                <i class="fas fa-mobile-alt"></i>
                <h4>App Mobile</h4>
                <p>Aplicativo nativo para iOS e Android com todas as funcionalidades</p>
            </div>
            <div class="feature-item">
                <i class="fas fa-shield-alt"></i>
                <h4>Segurança Avançada</h4>
                <p>Criptografia ponta a ponta, autenticação multi-fator, backup automático</p>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    showModal('featuresModal');
}

function showPricingModal() {
    const modal = createInfoModal('pricing', 'Planos e Preços', `
        <div class="pricing-grid">
            <div class="pricing-card">
                <div class="plan-name">Básico</div>
                <div class="plan-price">R$ 99<span>/mês</span></div>
                <ul class="plan-features">
                    <li><i class="fas fa-check"></i> Até 500 clientes</li>
                    <li><i class="fas fa-check"></i> Monitoramento básico</li>
                    <li><i class="fas fa-check"></i> Suporte por email</li>
                    <li><i class="fas fa-check"></i> Relatórios básicos</li>
                </ul>
                <button class="btn-primary full-width">Escolher Plano</button>
            </div>
            <div class="pricing-card featured">
                <div class="plan-badge">Mais Popular</div>
                <div class="plan-name">Profissional</div>
                <div class="plan-price">R$ 199<span>/mês</span></div>
                <ul class="plan-features">
                    <li><i class="fas fa-check"></i> Até 2.000 clientes</li>
                    <li><i class="fas fa-check"></i> Monitoramento avançado</li>
                    <li><i class="fas fa-check"></i> Suporte prioritário</li>
                    <li><i class="fas fa-check"></i> Analytics completo</li>
                    <li><i class="fas fa-check"></i> App mobile</li>
                </ul>
                <button class="btn-primary full-width">Escolher Plano</button>
            </div>
            <div class="pricing-card">
                <div class="plan-name">Enterprise</div>
                <div class="plan-price">R$ 399<span>/mês</span></div>
                <ul class="plan-features">
                    <li><i class="fas fa-check"></i> Clientes ilimitados</li>
                    <li><i class="fas fa-check"></i> Recursos personalizados</li>
                    <li><i class="fas fa-check"></i> Suporte 24/7</li>
                    <li><i class="fas fa-check"></i> API dedicada</li>
                    <li><i class="fas fa-check"></i> Integração customizada</li>
                </ul>
                <button class="btn-primary full-width">Falar com Vendas</button>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    showModal('pricingModal');
}

function showIntegrationsModal() {
    const modal = createInfoModal('integrations', 'Integrações Disponíveis', `
        <div class="integrations-grid">
            <div class="integration-item">
                <img src="https://via.placeholder.com/60x60" alt="WhatsApp">
                <h4>WhatsApp Business</h4>
                <p>Comunique-se diretamente com seus clientes</p>
            </div>
            <div class="integration-item">
                <img src="https://via.placeholder.com/60x60" alt="Mikrotik">
                <h4>Mikrotik</h4>
                <p>Integração completa com equipamentos Mikrotik</p>
            </div>
            <div class="integration-item">
                <img src="https://via.placeholder.com/60x60" alt="Ubiquiti">
                <h4>Ubiquiti UniFi</h4>
                <p>Gerencie sua rede Ubiquiti centralmente</p>
            </div>
            <div class="integration-item">
                <img src="https://via.placeholder.com/60x60" alt="Asaas">
                <h4>Asaas</h4>
                <p>Gateway de pagamento integrado</p>
            </div>
            <div class="integration-item">
                <img src="https://via.placeholder.com/60x60" alt="Pagseguro">
                <h4>PagSeguro</h4>
                <p>Processamento de pagamentos</p>
            </div>
            <div class="integration-item">
                <img src="https://via.placeholder.com/60x60" alt="Correios">
                <h4>Correios</h4>
                <p>Rastreamento de entregas e logística</p>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    showModal('integrationsModal');
}

function showFaqModal() {
    const modal = createInfoModal('faq', 'Perguntas Frequentes', `
        <div class="faq-list">
            <div class="faq-item">
                <div class="faq-question">
                    <h4>Como funciona o período de teste?</h4>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>Oferecemos 30 dias de teste gratuito com acesso completo a todas as funcionalidades do plano Profissional.</p>
                </div>
            </div>
            <div class="faq-item">
                <div class="faq-question">
                    <h4>Posso migrar meus dados de outro sistema?</h4>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>Sim! Nossa equipe oferece suporte completo para migração de dados de outros sistemas de gestão.</p>
                </div>
            </div>
            <div class="faq-item">
                <div class="faq-question">
                    <h4>O sistema funciona offline?</h4>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>O sistema funciona online, mas dados essenciais são sincronizados localmente para consultas básicas.</p>
                </div>
            </div>
            <div class="faq-item">
                <div class="faq-question">
                    <h4>Como é feito o backup dos dados?</h4>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>Fazemos backup automático diário em servidores seguros com redundância geográfica.</p>
                </div>
            </div>
        </div>
    `);
    
    // Add FAQ accordion functionality
    setTimeout(() => {
        const faqQuestions = modal.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const answer = item.querySelector('.faq-answer');
                const icon = question.querySelector('i');
                
                item.classList.toggle('open');
                
                if (item.classList.contains('open')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    answer.style.maxHeight = '0';
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }, 100);
    
    document.body.appendChild(modal);
    showModal('faqModal');
}

function showAboutModal() {
    const modal = createInfoModal('about', 'Sobre Nós', `
        <div class="about-content">
            <div class="company-info">
                <h3>Gestão de Provedores</h3>
                <p class="lead">Somos uma empresa especializada em soluções tecnológicas para provedores de internet, com mais de 10 anos de experiência no mercado.</p>
                
                <h4>Nossa Missão</h4>
                <p>Simplificar a gestão de provedores de internet através de tecnologia inovadora e suporte especializado.</p>
                
                <h4>Nossa Visão</h4>
                <p>Ser a principal plataforma de gestão para provedores de internet no Brasil, democratizando o acesso a ferramentas profissionais.</p>
                
                <h4>Nossos Valores</h4>
                <ul>
                    <li><i class="fas fa-check"></i> Inovação constante</li>
                    <li><i class="fas fa-check"></i> Foco no cliente</li>
                    <li><i class="fas fa-check"></i> Transparência total</li>
                    <li><i class="fas fa-check"></i> Suporte excepcional</li>
                </ul>
            </div>
            
            <div class="team-info">
                <h4>Nosso Time</h4>
                <div class="team-stats">
                    <div class="stat-item">
                        <span class="stat-number">50+</span>
                        <span class="stat-label">Profissionais</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">1000+</span>
                        <span class="stat-label">Clientes Ativos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">99.9%</span>
                        <span class="stat-label">Uptime</span>
                    </div>
                </div>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    showModal('aboutModal');
}

function showContactModal() {
    const modal = createInfoModal('contact', 'Entre em Contato', `
        <div class="contact-content">
            <div class="contact-info">
                <h4>Fale Conosco</h4>
                <div class="contact-methods">
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <div>
                            <strong>Telefone</strong>
                            <p>(11) 3000-0000</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <strong>E-mail</strong>
                            <p>contato@gestaoprovedores.com</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>Endereço</strong>
                            <p>São Paulo, SP - Brasil</p>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Horário de Atendimento</strong>
                            <p>Segunda a Sexta: 8h às 18h</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <form class="contact-form" id="contactForm">
                <h4>Envie sua Mensagem</h4>
                <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" class="form-input">
                </div>
                <div class="form-group">
                    <label>Assunto</label>
                    <select class="form-input" required>
                        <option value="">Selecione um assunto</option>
                        <option value="vendas">Informações de Vendas</option>
                        <option value="suporte">Suporte Técnico</option>
                        <option value="parceria">Parcerias</option>
                        <option value="outros">Outros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Mensagem</label>
                    <textarea class="form-input" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn-primary full-width">
                    <span>Enviar Mensagem</span>
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    `);
    
    // Add form submission handler
    setTimeout(() => {
        const form = modal.querySelector('#contactForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showLoading('Enviando mensagem...');
            
            setTimeout(() => {
                hideLoading();
                showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
                closeModals();
                modal.remove();
            }, 2000);
        });
    }, 100);
    
    document.body.appendChild(modal);
    showModal('contactModal');
}

function showHelpModal() {
    const modal = createInfoModal('help', 'Central de Ajuda', `
        <div class="help-content">
            <div class="help-search">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Como podemos ajudar?" id="helpSearch">
                </div>
            </div>
            
            <div class="help-categories">
                <h4>Categorias Populares</h4>
                <div class="category-grid">
                    <div class="category-item" data-category="primeiros-passos">
                        <i class="fas fa-rocket"></i>
                        <h5>Primeiros Passos</h5>
                        <p>Guia de configuração inicial</p>
                    </div>
                    <div class="category-item" data-category="clientes">
                        <i class="fas fa-users"></i>
                        <h5>Gestão de Clientes</h5>
                        <p>Como gerenciar seus clientes</p>
                    </div>
                    <div class="category-item" data-category="rede">
                        <i class="fas fa-network-wired"></i>
                        <h5>Monitoramento</h5>
                        <p>Configuração de rede</p>
                    </div>
                    <div class="category-item" data-category="financeiro">
                        <i class="fas fa-chart-line"></i>
                        <h5>Financeiro</h5>
                        <p>Relatórios e cobranças</p>
                    </div>
                </div>
            </div>
            
            <div class="help-articles">
                <h4>Artigos em Destaque</h4>
                <div class="article-list">
                    <div class="article-item">
                        <i class="fas fa-file-text"></i>
                        <div>
                            <h5>Como configurar o monitoramento automático</h5>
                            <p>Passo a passo para configurar alertas automáticos</p>
                        </div>
                    </div>
                    <div class="article-item">
                        <i class="fas fa-file-text"></i>
                        <div>
                            <h5>Integrando com sistemas de pagamento</h5>
                            <p>Configure gateways de pagamento facilmente</p>
                        </div>
                    </div>
                    <div class="article-item">
                        <i class="fas fa-file-text"></i>
                        <div>
                            <h5>Relatórios personalizados</h5>
                            <p>Crie relatórios sob medida para seu negócio</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="help-contact">
                <h4>Ainda precisa de ajuda?</h4>
                <div class="contact-options">
                    <button class="btn-secondary" onclick="showContactModal()">
                        <i class="fas fa-envelope"></i>
                        <span>Enviar Ticket</span>
                    </button>
                    <button class="btn-secondary" onclick="showNotification('Chat em desenvolvimento', 'info')">
                        <i class="fas fa-comments"></i>
                        <span>Chat Online</span>
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    showModal('helpModal');
}

function showStatusModal() {
    const modal = createInfoModal('status', 'Status do Sistema', `
        <div class="status-content">
            <div class="status-overview">
                <div class="status-indicator operational">
                    <i class="fas fa-check-circle"></i>
                    <span>Todos os Sistemas Operacionais</span>
                </div>
            </div>
            
            <div class="status-services">
                <h4>Status dos Serviços</h4>
                <div class="service-list">
                    <div class="service-item">
                        <div class="service-info">
                            <h5>API Principal</h5>
                            <span class="status-badge operational">Operacional</span>
                        </div>
                        <div class="service-uptime">99.99%</div>
                    </div>
                    <div class="service-item">
                        <div class="service-info">
                            <h5>Dashboard Web</h5>
                            <span class="status-badge operational">Operacional</span>
                        </div>
                        <div class="service-uptime">99.98%</div>
                    </div>
                    <div class="service-item">
                        <div class="service-info">
                            <h5>App Mobile</h5>
                            <span class="status-badge operational">Operacional</span>
                        </div>
                        <div class="service-uptime">99.97%</div>
                    </div>
                    <div class="service-item">
                        <div class="service-info">
                            <h5>Sistema de Notificações</h5>
                            <span class="status-badge operational">Operacional</span>
                        </div>
                        <div class="service-uptime">99.95%</div>
                    </div>
                    <div class="service-item">
                        <div class="service-info">
                            <h5>Backup e Sincronização</h5>
                            <span class="status-badge operational">Operacional</span>
                        </div>
                        <div class="service-uptime">100%</div>
                    </div>
                </div>
            </div>
            
            <div class="status-history">
                <h4>Últimas Atualizações</h4>
                <div class="update-list">
                    <div class="update-item">
                        <div class="update-date">Hoje - 14:30</div>
                        <div class="update-content">
                            <h5>Melhoria de Performance</h5>
                            <p>Otimização dos tempos de resposta da API</p>
                        </div>
                    </div>
                    <div class="update-item">
                        <div class="update-date">Ontem - 09:15</div>
                        <div class="update-content">
                            <h5>Nova Funcionalidade</h5>
                            <p>Lançamento do sistema de notificações em tempo real</p>
                        </div>
                    </div>
                    <div class="update-item">
                        <div class="update-date">2 dias atrás - 16:45</div>
                        <div class="update-content">
                            <h5>Manutenção Programada</h5>
                            <p>Atualização de segurança realizada com sucesso</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    showModal('statusModal');
}

function showTermsModal() {
    const modal = createInfoModal('terms', 'Termos de Uso', `
        <div class="terms-content">
            <div class="terms-section">
                <h4>1. Aceitação dos Termos</h4>
                <p>Ao acessar e usar o sistema Gestão de Provedores, você aceita estar vinculado a estes termos de serviço e todas as leis e regulamentações aplicáveis.</p>
            </div>
            
            <div class="terms-section">
                <h4>2. Uso do Serviço</h4>
                <p>Você pode usar nosso serviço para fins comerciais legítimos relacionados à gestão de provedores de internet. É proibido usar o serviço para atividades ilegais ou não autorizadas.</p>
            </div>
            
            <div class="terms-section">
                <h4>3. Privacidade e Dados</h4>
                <p>Respeitamos sua privacidade e protegemos seus dados conforme nossa Política de Privacidade. Não compartilhamos informações pessoais com terceiros sem consentimento.</p>
            </div>
            
            <div class="terms-section">
                <h4>4. Limitação de Responsabilidade</h4>
                <p>O serviço é fornecido "como está" sem garantias expressas ou implícitas. Não nos responsabilizamos por danos diretos ou indiretos resultantes do uso do serviço.</p>
            </div>
            
            <div class="terms-section">
                <h4>5. Modificações</h4>
                <p>Reservamos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação.</p>
            </div>
            
            <div class="terms-section">
                <h4>6. Contato</h4>
                <p>Para dúvidas sobre estes termos, entre em contato conosco através do e-mail: legal@gestaoprovedores.com</p>
            </div>
            
            <div class="terms-footer">
                <p><strong>Última atualização:</strong> Janeiro de 2025</p>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
    showModal('termsModal');
}

function createInfoModal(id, title, content) {
    const modal = document.createElement('div');
    modal.id = id + 'Modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content large">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> ${title}</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    return modal;
}
function setupFooterLinks() {
    const footerLinks = document.querySelectorAll('footer a[href="#"]');
    
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const linkText = link.textContent.trim();
            
            switch (linkText) {
                case 'Funcionalidades':
                    showFeatureModal();
                    break;
                case 'Preços':
                    showPricingModal();
                    break;
                case 'Integrações':
                    showIntegrationsModal();
                    break;
                case 'FAQ':
                    showFaqModal();
                    break;
                case 'Sobre Nós':
                    showAboutModal();
                    break;
                case 'Blog':
                    showNotification('Blog em construção. Em breve!', 'info');
                    break;
                case 'Carreiras':
                    showNotification('Página de carreiras em desenvolvimento', 'info');
                    break;
                case 'Contato':
                    showContactModal();
                    break;
                case 'Central de Ajuda':
                    showHelpModal();
                    break;
                case 'Documentação':
                    showNotification('Acessando documentação...', 'info');
                    setTimeout(() => {
                        window.open('https://docs.gestaoprovedores.com', '_blank');
                    }, 1000);
                    break;
                case 'Status do Sistema':
                    showStatusModal();
                    break;
                case 'Termos de Uso':
                    showTermsModal();
                    break;
                default:
                    showNotification('Link em desenvolvimento', 'info');
            }
        });
    });
    
    // Social media links
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Redes sociais em breve!', 'info');
        });
    });
}

// ===== Dashboard Navigation =====
function setupDashboardNavigation() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            
            // Save sidebar state
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
        
        // Restore sidebar state
        const savedState = localStorage.getItem('sidebarCollapsed') === 'true';
        if (savedState) {
            sidebar.classList.add('collapsed');
        }
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Get section to show
            const sectionId = link.getAttribute('data-section');
            showDashboardSection(sectionId);
            
            // Update URL without page reload
            if (history.pushState) {
                history.pushState(null, '', `#${sectionId}`);
            }
        });
    });
    
    // User menu toggle
    const userToggle = document.getElementById('userToggle');
    const userMenu = document.querySelector('.user-menu');
    
    if (userToggle && userMenu) {
        userToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('show');
        });
        
        // Close user menu when clicking outside
        document.addEventListener('click', () => {
            userMenu.classList.remove('show');
        });
    }
    
    // Notification toggle
    const notificationToggle = document.getElementById('notificationToggle');
    const notificationPanel = document.querySelector('.notification-panel');
    
    if (notificationToggle && notificationPanel) {
        notificationToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPanel.classList.toggle('show');
        });
        
        // Close notification panel when clicking outside
        document.addEventListener('click', () => {
            notificationPanel.classList.remove('show');
        });
        
        // Mark all as read
        const markAllRead = document.querySelector('.mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                const notifications = document.querySelectorAll('.notification-item.unread');
                notifications.forEach(notification => {
                    notification.classList.remove('unread');
                });
                showNotification('Todas as notificações foram marcadas como lidas', 'success');
            });
        }
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
}

// ===== Dashboard Sections =====
function showDashboardSection(sectionId) {
    // Hide all sections first
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => {
        if (section.hasAttribute('data-section')) {
            section.style.display = 'none';
        }
    });
    
    // Show the selected section
    const targetSection = document.querySelector(`[data-section="${sectionId}"]`);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Animate section entry
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            targetSection.style.transition = 'all 0.3s ease';
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 50);
    } else {
        // If section doesn't exist, show placeholder
        showDashboardPlaceholder(sectionId);
    }
}

function showDashboardPlaceholder(sectionId) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const sectionTitles = {
        'clientes': 'Gestão de Clientes',
        'rede': 'Monitoramento de Rede',
        'financeiro': 'Gestão Financeira',
        'suporte': 'Central de Suporte',
        'relatorios': 'Relatórios e Analytics',
        'configuracoes': 'Configurações do Sistema'
    };
    
    const sectionTitle = sectionTitles[sectionId] || 'Seção';
    
    mainContent.innerHTML = `
        <div class="section-placeholder">
            <div class="placeholder-icon">
                <i class="fas fa-tools"></i>
            </div>
            <h2>${sectionTitle}</h2>
            <p>Esta seção está em desenvolvimento.</p>
            <p>Funcionalidades completas estarão disponíveis em breve!</p>
            <button class="btn-primary" onclick="showNotification('Funcionalidade em desenvolvimento', 'info')">
                <i class="fas fa-rocket"></i>
                <span>Notificar quando pronto</span>
            </button>
        </div>
    `;
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

// ===== Admin Functions =====
function setupAdminFunctions() {
    // Admin panel tabs
    const adminTabs = document.querySelectorAll('.admin-tab');
    const adminContents = document.querySelectorAll('.admin-content');
    
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs
            adminTabs.forEach(t => t.classList.remove('active'));
            adminContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.querySelector(`[data-content="${targetTab}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // User management actions
    const userActions = document.querySelectorAll('.user-action');
    userActions.forEach(action => {
        action.addEventListener('click', (e) => {
            e.stopPropagation();
            const actionType = action.dataset.action;
            const userId = action.closest('.user-item').dataset.userId;
            
            switch (actionType) {
                case 'edit':
                    editUser(userId);
                    break;
                case 'delete':
                    deleteUser(userId);
                    break;
                case 'suspend':
                    suspendUser(userId);
                    break;
                case 'activate':
                    activateUser(userId);
                    break;
            }
        });
    });
    
    // System settings form
    const settingsForm = document.getElementById('systemSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSystemSettings(new FormData(settingsForm));
        });
    }
    
    // Backup functions
    const backupBtn = document.getElementById('createBackup');
    const restoreBtn = document.getElementById('restoreBackup');
    
    if (backupBtn) {
        backupBtn.addEventListener('click', createBackup);
    }
    
    if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json,.sql';
            fileInput.onchange = (e) => restoreBackup(e.target.files[0]);
            fileInput.click();
        });
    }
}

function editUser(userId) {
    showNotification(`Editando usuário ${userId}`, 'info');
    // Implementar modal de edição de usuário
}

function deleteUser(userId) {
    if (confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
        showLoading('Removendo usuário...');
        
        setTimeout(() => {
            hideLoading();
            showNotification('Usuário removido com sucesso', 'success');
            
            // Remove user from DOM
            const userItem = document.querySelector(`[data-user-id="${userId}"]`);
            if (userItem) {
                userItem.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => userItem.remove(), 300);
            }
        }, 1500);
    }
}

function suspendUser(userId) {
    showLoading('Suspendendo usuário...');
    
    setTimeout(() => {
        hideLoading();
        showNotification('Usuário suspenso', 'warning');
        
        // Update user status in DOM
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (userItem) {
            const statusBadge = userItem.querySelector('.user-status');
            statusBadge.className = 'user-status suspended';
            statusBadge.textContent = 'Suspenso';
        }
    }, 1000);
}

function activateUser(userId) {
    showLoading('Ativando usuário...');
    
    setTimeout(() => {
        hideLoading();
        showNotification('Usuário ativado', 'success');
        
        // Update user status in DOM
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (userItem) {
            const statusBadge = userItem.querySelector('.user-status');
            statusBadge.className = 'user-status active';
            statusBadge.textContent = 'Ativo';
        }
    }, 1000);
}

function saveSystemSettings(formData) {
    showLoading('Salvando configurações...');
    
    setTimeout(() => {
        hideLoading();
        showNotification('Configurações salvas com sucesso', 'success');
    }, 2000);
}

function createBackup() {
    showLoading('Criando backup...');
    
    setTimeout(() => {
        hideLoading();
        showNotification('Backup criado com sucesso', 'success');
        
        // Simulate download
        const backupData = {
            timestamp: new Date().toISOString(),
            users: [],
            settings: {},
            data: {}
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 3000);
}

function restoreBackup(file) {
    if (!file) return;
    
    showLoading('Restaurando backup...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backupData = JSON.parse(e.target.result);
            
            setTimeout(() => {
                hideLoading();
                showNotification('Backup restaurado com sucesso', 'success');
                
                // Reload page after restore
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }, 3000);
        } catch (error) {
            hideLoading();
            showNotification('Erro ao restaurar backup. Arquivo inválido.', 'error');
        }
    };
    
    reader.readAsText(file);
}

// ===== Form Validation =====
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
        
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    clearFieldError(field);
    
    if (required && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    if (value && type === 'email' && !isValidEmail(value)) {
        showFieldError(field, 'E-mail inválido');
        return false;
    }
    
    if (value && type === 'tel' && !isValidPhone(value)) {
        showFieldError(field, 'Telefone inválido');
        return false;
    }
    
    if (field.hasAttribute('minlength') && value.length < parseInt(field.getAttribute('minlength'))) {
        showFieldError(field, `Mínimo de ${field.getAttribute('minlength')} caracteres`);
        return false;
    }
    
    return true;
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\(\)\d\s\-\+]{10,}$/;
    return phoneRegex.test(phone);
}

// ===== Request Access Form =====
function setupRequestForm() {
    const requestForm = document.getElementById('requestForm');
    
    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!validateForm(requestForm)) {
                showNotification('Por favor, corrija os erros no formulário', 'error');
                return;
            }
            
            const formData = new FormData(requestForm);
            const requestData = {
                empresa: formData.get('empresa'),
                nome: formData.get('nome'),
                email: formData.get('email'),
                telefone: formData.get('telefone'),
                clientes: formData.get('clientes'),
                observacoes: formData.get('observacoes'),
                timestamp: new Date().toISOString()
            };
            
            showLoading('Enviando solicitação...');
            
            // Simulate API call
            setTimeout(() => {
                hideLoading();
                
                // Save to localStorage for demo
                const requests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
                requests.push(requestData);
                localStorage.setItem('accessRequests', JSON.stringify(requests));
                
                showNotification('Solicitação enviada com sucesso! Entraremos em contato em breve.', 'success');
                
                // Clear form
                requestForm.reset();
                
                // Close modal if it's in a modal
                const modal = requestForm.closest('.modal');
                if (modal) {
                    setTimeout(() => {
                        closeModals();
                        modal.remove();
                    }, 2000);
                }
            }, 2000);
        });
    }
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
    setupEventListeners,
    setupFooterLinks,
    setupDashboardNavigation,
    setupAdminFunctions,
    setupFormValidation,
    setupRequestForm,
    handleForgotPassword,
    createInfoModal,
    showFeatureModal,
    showPricingModal,
    showIntegrationsModal,
    showFaqModal,
    showAboutModal,
    showContactModal,
    showHelpModal,
    showStatusModal,
    showTermsModal,
    showDashboardSection,
    showDashboardPlaceholder,
    showNotification,
    showLoading,
    hideLoading
};

console.log('🎯 Gestão de Provedores carregado');