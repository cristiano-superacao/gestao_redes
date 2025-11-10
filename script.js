// ===== NetBairro Manager - Script Principal =====

// Configurações e constantes
const CONFIG = {
    API_BASE_URL: 'https://api.netbairro.com',
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    STATS_ANIMATION_DURATION: 2000
};

// Estado da aplicação
const AppState = {
    isAuthenticated: false,
    currentUser: null,
    theme: 'dark'
};

// ===== Utilitários =====
const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validações
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePassword(password) {
        return password.length >= 6;
    },

    // Storage
    storage: {
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        get(key) {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch {
                return null;
            }
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    },

    // Animação de scroll suave
    smoothScroll(target, duration = 800) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }
};

// ===== Componente de Toast =====
class ToastManager {
    constructor() {
        this.toastElement = document.getElementById('toast');
        this.messageElement = document.getElementById('toastMessage');
    }

    show(message, type = 'success') {
        const icon = this.toastElement.querySelector('i');
        
        // Definir ícone baseado no tipo
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                icon.style.color = '#10b981';
                break;
            case 'error':
                icon.className = 'fas fa-times-circle';
                icon.style.color = '#ef4444';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                icon.style.color = '#f59e0b';
                break;
            case 'info':
                icon.className = 'fas fa-info-circle';
                icon.style.color = '#3b82f6';
                break;
        }

        this.messageElement.textContent = message;
        this.toastElement.classList.add('show');

        setTimeout(() => {
            this.hide();
        }, CONFIG.TOAST_DURATION);
    }

    hide() {
        this.toastElement.classList.remove('show');
    }
}

// ===== Componente de Loading =====
class LoadingManager {
    constructor() {
        this.loadingElement = document.getElementById('loadingOverlay');
    }

    show(message = 'Carregando...') {
        const messageElement = this.loadingElement.querySelector('p');
        if (messageElement) messageElement.textContent = message;
        this.loadingElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.loadingElement.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== Animação das Estatísticas =====
class StatsAnimator {
    constructor() {
        this.stats = document.querySelectorAll('.stat-number');
        this.hasAnimated = false;
        this.init();
    }

    init() {
        // Observar quando as estatísticas entram na viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateStats();
                    this.hasAnimated = true;
                }
            });
        });

        this.stats.forEach(stat => observer.observe(stat));
    }

    animateStats() {
        this.stats.forEach(stat => {
            const target = parseFloat(stat.dataset.target);
            let current = 0;
            const increment = target / 100;
            const duration = CONFIG.STATS_ANIMATION_DURATION;
            const stepTime = duration / 100;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Formatação especial para diferentes tipos de número
                if (stat.dataset.target.includes('.')) {
                    stat.textContent = current.toFixed(1);
                } else if (target >= 1000) {
                    stat.textContent = Math.floor(current).toLocaleString();
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, stepTime);
        });
    }
}

// ===== Componente de Partículas =====
class ParticleSystem {
    constructor() {
        this.particlesContainer = document.getElementById('particles');
        this.particles = [];
        this.isActive = true;
        this.init();
    }

    init() {
        // Verificar se o usuário prefere movimento reduzido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isActive = false;
            return;
        }

        this.createParticles();
        this.animate();
    }

    createParticles() {
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(59, 130, 246, 0.3);
                border-radius: 50%;
                pointer-events: none;
            `;

            this.resetParticle(particle);
            this.particlesContainer.appendChild(particle);
            this.particles.push({
                element: particle,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    resetParticle(particle) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
    }

    animate() {
        if (!this.isActive) return;

        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Limites da tela
            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.speedY *= -1;
            }

            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ===== Gerenciador de Formulários =====
class FormManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePassword = document.getElementById('togglePassword');
        this.rememberCheckbox = document.getElementById('remember');
        this.manusLoginBtn = document.getElementById('manusLogin');
        this.googleLoginBtn = document.getElementById('googleLogin');
        this.adminAccessBtn = document.getElementById('adminAccess');
        this.requestAccessBtn = document.querySelector('a[href="#"]:not(.admin-link)');
        
        this.init();
    }

    init() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        if (this.togglePassword) {
            this.togglePassword.addEventListener('click', this.togglePasswordVisibility.bind(this));
        }

        if (this.manusLoginBtn) {
            this.manusLoginBtn.addEventListener('click', this.handleManusLogin.bind(this));
        }

        if (this.googleLoginBtn) {
            this.googleLoginBtn.addEventListener('click', this.handleGoogleLogin.bind(this));
        }

        // Modal handlers
        this.initModalHandlers();

        // Validação em tempo real
        if (this.emailInput) {
            this.emailInput.addEventListener('blur', this.validateEmailField.bind(this));
        }

        if (this.passwordInput) {
            this.passwordInput.addEventListener('blur', this.validatePasswordField.bind(this));
        }

        // Auto-fill de dados salvos
        this.loadSavedCredentials();
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const remember = this.rememberCheckbox.checked;

        // Validação
        if (!this.validateForm(email, password)) return;

        // Mostrar loading
        window.loadingManager.show('Fazendo login...');

        try {
            // Simular chamada de API
            await this.simulateLogin(email, password);

            // Salvar credenciais se solicitado
            if (remember) {
                Utils.storage.set('rememberedEmail', email);
            }

            // Sucesso
            window.toastManager.show('Login realizado com sucesso!', 'success');
            
            // Redirecionar após um delay
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1000);

        } catch (error) {
            window.toastManager.show(error.message, 'error');
        } finally {
            window.loadingManager.hide();
        }
    }

    validateForm(email, password) {
        let isValid = true;

        // Validar email
        if (!Utils.validateEmail(email)) {
            this.showFieldError(this.emailInput, 'Email inválido');
            isValid = false;
        } else {
            this.clearFieldError(this.emailInput);
        }

        // Validar senha
        if (!Utils.validatePassword(password)) {
            this.showFieldError(this.passwordInput, 'Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        } else {
            this.clearFieldError(this.passwordInput);
        }

        return isValid;
    }

    validateEmailField() {
        const email = this.emailInput.value.trim();
        if (email && !Utils.validateEmail(email)) {
            this.showFieldError(this.emailInput, 'Email inválido');
            return false;
        } else {
            this.clearFieldError(this.emailInput);
            return true;
        }
    }

    validatePasswordField() {
        const password = this.passwordInput.value;
        if (password && !Utils.validatePassword(password)) {
            this.showFieldError(this.passwordInput, 'Senha deve ter pelo menos 6 caracteres');
            return false;
        } else {
            this.clearFieldError(this.passwordInput);
            return true;
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remover erro anterior
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();

        // Adicionar novo erro
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        `;
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) errorElement.remove();
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        const icon = this.togglePassword.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    async handleGoogleLogin() {
        window.loadingManager.show('Conectando com Google...');
        
        try {
            const user = await window.authService.loginWithGoogle();
            window.toastManager.show('Login realizado com sucesso!', 'success');
            
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1000);
            
        } catch (error) {
            window.toastManager.show(error.message, 'error');
        } finally {
            window.loadingManager.hide();
        }
    }

    initModalHandlers() {
        // Admin modal
        if (this.adminAccessBtn) {
            this.adminAccessBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAdminModal();
            });
        }

        // Request access modal
        if (this.requestAccessBtn) {
            this.requestAccessBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRequestModal();
            });
        }

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') || 
                e.target.classList.contains('modal-close')) {
                this.closeModals();
            }
        });

        // Admin login form
        const adminForm = document.getElementById('adminLoginForm');
        if (adminForm) {
            adminForm.addEventListener('submit', this.handleAdminLogin.bind(this));
        }

        // Request access form
        const requestForm = document.getElementById('requestAccessForm');
        if (requestForm) {
            requestForm.addEventListener('submit', this.handleAccessRequest.bind(this));
        }
    }

    showAdminModal() {
        document.getElementById('adminModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    showRequestModal() {
        document.getElementById('requestModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    async handleAdminLogin(e) {
        e.preventDefault();
        
        const password = document.getElementById('adminPassword').value;
        
        window.loadingManager.show('Verificando credenciais...');
        
        try {
            await window.authService.adminLogin(password);
            window.toastManager.show('Acesso administrativo autorizado!', 'success');
            this.closeModals();
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            
        } catch (error) {
            window.toastManager.show(error.message, 'error');
        } finally {
            window.loadingManager.hide();
        }
    }

    async handleAccessRequest(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('requestName').value,
            email: document.getElementById('requestEmail').value,
            company: document.getElementById('requestCompany').value,
            reason: document.getElementById('requestReason').value
        };
        
        window.loadingManager.show('Enviando solicitação...');
        
        try {
            await window.authService.requestAccess(formData);
            window.toastManager.show('Solicitação enviada com sucesso! Você receberá um e-mail quando for aprovada.', 'success');
            this.closeModals();
            
            // Limpar formulário
            document.getElementById('requestAccessForm').reset();
            
        } catch (error) {
            window.toastManager.show('Erro ao enviar solicitação: ' + error.message, 'error');
        } finally {
            window.loadingManager.hide();
        }
    }

    async simulateLogin(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular validação
                if (email === 'admin@netbairro.com' && password === '123456') {
                    AppState.isAuthenticated = true;
                    AppState.currentUser = { email, name: 'Administrador' };
                    resolve();
                } else {
                    reject(new Error('Credenciais inválidas'));
                }
            }, 1500);
        });
    }

    loadSavedCredentials() {
        const savedEmail = Utils.storage.get('rememberedEmail');
        if (savedEmail && this.emailInput) {
            this.emailInput.value = savedEmail;
            this.rememberCheckbox.checked = true;
        }
    }

    redirectToDashboard() {
        // Verificar se dashboard.html existe, senão criar
        window.location.href = 'dashboard.html';
    }
}

// ===== Gerenciador de Navegação =====
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        // Scroll suave para links âncora
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = link.getAttribute('href');
                Utils.smoothScroll(target);
            }
        });

        // Animações ao scroll
        this.initScrollAnimations();
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar elementos animáveis
        const animatedElements = document.querySelectorAll('.feature-card, .stat-card, .login-card');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// ===== Inicialização da Aplicação =====
class App {
    constructor() {
        this.init();
    }

    init() {
        // Aguardar carregamento do DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        // Inicializar managers globais
        window.toastManager = new ToastManager();
        window.loadingManager = new LoadingManager();

        // Inicializar Firebase e Auth Service
        this.initFirebase();

        // Inicializar outros componentes
        new FormManager();
        new NavigationManager();
        new StatsAnimator();
        
        // Inicializar partículas apenas se não for dispositivo móvel
        if (window.innerWidth > 768) {
            new ParticleSystem();
        }

        // Configurar eventos globais
        this.setupGlobalEvents();

        // Mostrar aplicação
        this.showApp();
    }

    initFirebase() {
        // Carregar configuração do Firebase
        const script1 = document.createElement('script');
        script1.src = 'firebase-config.js';
        script1.type = 'module';
        document.head.appendChild(script1);

        // Carregar serviços de autenticação
        const script2 = document.createElement('script');
        script2.src = 'auth-service.js';
        document.head.appendChild(script2);
    }

    setupGlobalEvents() {
        // Tratamento de erros globais
        window.addEventListener('error', (e) => {
            console.error('Erro global:', e.error);
            window.toastManager?.show('Ocorreu um erro inesperado', 'error');
        });

        // Resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC para fechar loading
            if (e.key === 'Escape') {
                window.loadingManager?.hide();
            }
        });
    }

    handleResize() {
        // Recriar partículas se necessário
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer && window.innerWidth <= 768) {
            particlesContainer.innerHTML = '';
        }
    }

    showApp() {
        document.body.classList.add('loaded');
        
        // Animação de entrada
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }

        console.log('🚀 NetBairro Manager carregado com sucesso!');
    }
}

// ===== Polyfills e Compatibilidade =====
// IntersectionObserver polyfill para browsers antigos
if (!('IntersectionObserver' in window)) {
    // Carregar polyfill se necessário
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    document.head.appendChild(script);
}

// ===== Inicializar Aplicação =====
new App();

// ===== Service Worker (PWA) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}