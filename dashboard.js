// ===== NetBairro Manager - Dashboard Script =====

// Dashboard State
const DashboardState = {
    currentSection: 'dashboard',
    sidebarCollapsed: false,
    charts: {},
    data: {
        clients: [],
        stats: {},
        activities: []
    }
};

// ===== Dashboard Manager =====
class DashboardManager {
    constructor() {
        this.initComponents();
        this.bindEvents();
        this.loadDashboardData();
    }

    initComponents() {
        // Inicializar componentes do dashboard
        this.sidebarManager = new SidebarManager();
        this.chartManager = new ChartManager();
        this.notificationManager = new NotificationManager();
        this.tableManager = new TableManager();
        this.modalManager = new ModalManager();
        
        // Verificar autenticação
        this.checkAuthentication();
    }

    bindEvents() {
        // Navigation events
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-section]');
            if (navLink) {
                e.preventDefault();
                this.switchSection(navLink.dataset.section);
            }
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.sidebarManager.toggleMobile();
            });
        }
    }

    switchSection(sectionName) {
        // Remover active de todas as seções
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Ativar nova seção
        const targetSection = document.getElementById(`${sectionName}-section`);
        const targetNavLink = document.querySelector(`[data-section="${sectionName}"]`);

        if (targetSection) {
            targetSection.classList.add('active');
        }

        if (targetNavLink) {
            targetNavLink.classList.add('active');
        }

        // Atualizar título da página
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = this.getSectionTitle(sectionName);
        }

        // Atualizar estado
        DashboardState.currentSection = sectionName;

        // Carregar dados da seção se necessário
        this.loadSectionData(sectionName);
    }

    getSectionTitle(sectionName) {
        const titles = {
            dashboard: 'Dashboard',
            clientes: 'Gestão de Clientes',
            rede: 'Monitoramento de Rede',
            financeiro: 'Gestão Financeira',
            suporte: 'Central de Suporte',
            relatorios: 'Relatórios',
            configuracoes: 'Configurações'
        };
        return titles[sectionName] || 'Dashboard';
    }

    async loadDashboardData() {
        try {
            // Simular carregamento de dados
            const data = await this.fetchDashboardData();
            DashboardState.data = data;

            // Atualizar componentes com os dados
            this.updateKPICards(data.stats);
            this.chartManager.updateCharts(data.charts);
            this.updateRecentActivity(data.activities);

        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            window.toastManager?.show('Erro ao carregar dados do dashboard', 'error');
        }
    }

    async fetchDashboardData() {
        // Simular dados do dashboard
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    stats: {
                        activeClients: 1247,
                        monthlyRevenue: 78540,
                        uptime: 99.8,
                        openTickets: 5
                    },
                    charts: {
                        bandwidth: this.generateBandwidthData(),
                        network: this.generateNetworkData()
                    },
                    activities: [
                        {
                            icon: 'fas fa-user-plus text-success',
                            title: 'João Silva foi cadastrado como novo cliente',
                            time: '5 minutos atrás'
                        },
                        {
                            icon: 'fas fa-exclamation-triangle text-warning',
                            title: 'Detectada alta latência no Servidor SP-01',
                            time: '12 minutos atrás'
                        },
                        {
                            icon: 'fas fa-credit-card text-info',
                            title: 'Pagamento de R$ 89,90 recebido de Maria Santos',
                            time: '25 minutos atrás'
                        }
                    ]
                });
            }, 500);
        });
    }

    generateBandwidthData() {
        const labels = [];
        const data = [];
        const now = new Date();

        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            data.push(Math.random() * 100 + 200); // 200-300 Mbps
        }

        return { labels, data };
    }

    generateNetworkData() {
        return {
            labels: ['Online', 'Manutenção', 'Offline'],
            data: [85, 10, 5],
            colors: ['#10b981', '#f59e0b', '#ef4444']
        };
    }

    updateKPICards(stats) {
        // Animar contadores dos KPIs
        Object.keys(stats).forEach(key => {
            const element = document.querySelector(`[data-target="${stats[key]}"]`);
            if (element) {
                this.animateCounter(element, stats[key]);
            }
        });
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current);
        }, stepTime);
    }

    updateRecentActivity(activities) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.title}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    loadSectionData(sectionName) {
        // Carregar dados específicos da seção
        switch (sectionName) {
            case 'clientes':
                this.loadClientsData();
                break;
            case 'rede':
                this.loadNetworkData();
                break;
            case 'financeiro':
                this.loadFinancialData();
                break;
            // Adicionar outros casos conforme necessário
        }
    }

    async loadClientsData() {
        // Implementar carregamento de dados de clientes
        console.log('Carregando dados de clientes...');
    }

    checkAuthentication() {
        // Verificar se o usuário está autenticado
        if (!AppState.isAuthenticated) {
            // Simular verificação de token
            const token = Utils.storage.get('authToken');
            if (!token) {
                window.location.href = 'index.html';
                return;
            }
        }
    }
}

// ===== Sidebar Manager =====
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.bindEvents();
    }

    bindEvents() {
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggle();
            });
        }

        // Auto-collapse em telas menores
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    toggle() {
        this.sidebar.classList.toggle('collapsed');
        DashboardState.sidebarCollapsed = !DashboardState.sidebarCollapsed;
    }

    toggleMobile() {
        this.sidebar.classList.toggle('mobile-open');
    }

    handleResize() {
        if (window.innerWidth <= 1024 && !this.sidebar.classList.contains('collapsed')) {
            this.sidebar.classList.add('collapsed');
            DashboardState.sidebarCollapsed = true;
        }
    }
}

// ===== Chart Manager =====
class ChartManager {
    constructor() {
        this.charts = {};
        this.initCharts();
    }

    initCharts() {
        this.createBandwidthChart();
        this.createNetworkChart();
    }

    createBandwidthChart() {
        const ctx = document.getElementById('bandwidthChart');
        if (!ctx) return;

        this.charts.bandwidth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Uso da Banda (Mbps)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    createNetworkChart() {
        const ctx = document.getElementById('networkChart');
        if (!ctx) return;

        this.charts.network = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Online', 'Manutenção', 'Offline'],
                datasets: [{
                    data: [85, 10, 5],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    updateCharts(chartData) {
        if (this.charts.bandwidth && chartData.bandwidth) {
            this.charts.bandwidth.data.labels = chartData.bandwidth.labels;
            this.charts.bandwidth.data.datasets[0].data = chartData.bandwidth.data;
            this.charts.bandwidth.update('none');
        }

        if (this.charts.network && chartData.network) {
            this.charts.network.data.datasets[0].data = chartData.network.data;
            this.charts.network.update('none');
        }
    }
}

// ===== Notification Manager =====
class NotificationManager {
    constructor() {
        this.notificationToggle = document.getElementById('notificationToggle');
        this.notificationMenu = document.getElementById('notificationMenu');
        this.bindEvents();
    }

    bindEvents() {
        if (this.notificationToggle) {
            this.notificationToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-dropdown')) {
                this.close();
            }
        });

        // Mark all as read
        const markAllRead = document.querySelector('.mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }
    }

    toggle() {
        this.notificationMenu.classList.toggle('show');
    }

    close() {
        this.notificationMenu.classList.remove('show');
    }

    markAllAsRead() {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });

        // Atualizar badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }

        window.toastManager?.show('Todas as notificações foram marcadas como lidas', 'success');
    }
}

// ===== Table Manager =====
class TableManager {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        // Search functionality
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('search-input')) {
                this.filterTable(e.target.value);
            }
        });

        // Filter functionality
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('filter-select')) {
                this.applyFilter(e.target.value);
            }
        });
    }

    filterTable(searchTerm) {
        const rows = document.querySelectorAll('.data-table tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm.toLowerCase());
            row.style.display = shouldShow ? '' : 'none';
        });
    }

    applyFilter(filterValue) {
        // Implementar lógica de filtro
        console.log('Aplicando filtro:', filterValue);
    }
}

// ===== Modal Manager =====
class ModalManager {
    constructor() {
        this.modal = document.getElementById('modal');
        this.bindEvents();
    }

    bindEvents() {
        // Close modal events
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalBackdrop = document.querySelector('.modal-backdrop');

        [modalClose, modalCancel, modalBackdrop].forEach(element => {
            if (element) {
                element.addEventListener('click', () => this.close());
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.close();
            }
        });
    }

    open(title, body, options = {}) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalFooter = document.getElementById('modalFooter');
        const modalConfirm = document.getElementById('modalConfirm');

        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = body;

        // Configurar botões
        if (options.confirmText && modalConfirm) {
            modalConfirm.textContent = options.confirmText;
        }

        if (options.hideFooter && modalFooter) {
            modalFooter.style.display = 'none';
        } else if (modalFooter) {
            modalFooter.style.display = 'flex';
        }

        // Callback para confirmação
        if (options.onConfirm && modalConfirm) {
            modalConfirm.onclick = options.onConfirm;
        }

        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// ===== User Dropdown Manager =====
class UserDropdownManager {
    constructor() {
        this.userToggle = document.getElementById('userToggle');
        this.userMenu = document.getElementById('userMenu');
        this.bindEvents();
    }

    bindEvents() {
        if (this.userToggle) {
            this.userToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                this.close();
            }
        });

        // Logout
        const logoutLink = document.querySelector('.user-menu-item.logout');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    toggle() {
        this.userMenu.classList.toggle('show');
    }

    close() {
        this.userMenu.classList.remove('show');
    }

    handleLogout() {
        // Limpar dados de autenticação
        Utils.storage.remove('authToken');
        AppState.isAuthenticated = false;
        AppState.currentUser = null;

        window.toastManager?.show('Logout realizado com sucesso', 'success');

        // Redirecionar após um delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ===== Real-time Updates =====
class RealTimeManager {
    constructor() {
        this.updateInterval = 30000; // 30 seconds
        this.startRealTimeUpdates();
    }

    startRealTimeUpdates() {
        // Atualizar dados em tempo real
        setInterval(() => {
            this.updateDashboardData();
        }, this.updateInterval);
    }

    async updateDashboardData() {
        try {
            // Simular atualização de dados em tempo real
            const newData = await this.fetchLatestData();
            
            // Atualizar componentes
            this.updateNetworkStatus(newData.networkStatus);
            this.updateActiveUsers(newData.activeUsers);
            
        } catch (error) {
            console.error('Erro ao atualizar dados em tempo real:', error);
        }
    }

    async fetchLatestData() {
        // Simular busca de dados atualizados
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    networkStatus: Math.random() > 0.1 ? 'online' : 'offline',
                    activeUsers: Math.floor(Math.random() * 50) + 950
                });
            }, 100);
        });
    }

    updateNetworkStatus(status) {
        const statusIndicator = document.querySelector('.network-status');
        if (statusIndicator) {
            statusIndicator.className = `network-status ${status}`;
            statusIndicator.textContent = status === 'online' ? 'Online' : 'Offline';
        }
    }

    updateActiveUsers(count) {
        const userCountElement = document.querySelector('.active-users-count');
        if (userCountElement) {
            userCountElement.textContent = count;
        }
    }
}

// ===== Inicialização do Dashboard =====
class DashboardApp {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initDashboard());
        } else {
            this.initDashboard();
        }
    }

    initDashboard() {
        // Verificar se é o dashboard
        if (!document.body.classList.contains('dashboard-body')) return;

        // Inicializar managers
        this.dashboardManager = new DashboardManager();
        this.userDropdownManager = new UserDropdownManager();
        this.realTimeManager = new RealTimeManager();

        // Configurar tema
        this.setupTheme();

        console.log('🎛️ Dashboard NetBairro Manager carregado com sucesso!');
    }

    setupTheme() {
        // Aplicar tema baseado na preferência do usuário
        const savedTheme = Utils.storage.get('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// ===== Inicializar Dashboard App =====
new DashboardApp();

// ===== Performance Monitoring =====
if (typeof performance !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`⚡ Dashboard carregado em ${loadTime}ms`);
        }, 0);
    });
}