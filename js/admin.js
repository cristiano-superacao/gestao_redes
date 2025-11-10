// ===== Admin Panel JavaScript =====

class AdminPanel {
    constructor() {
        this.currentTab = 'overview';
        this.usersData = [];
        this.requestsData = [];
        this.activityData = [];
        this.init();
    }

    async init() {
        // Verificar se o usuário é admin
        if (!window.authService || !window.authService.isAdmin) {
            window.location.href = 'index.html';
            return;
        }

        this.initEventListeners();
        await this.loadData();
        this.initCharts();
    }

    initEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', this.logout.bind(this));

        // Filters
        document.getElementById('userStatusFilter')?.addEventListener('change', this.filterUsers.bind(this));
        document.getElementById('userSearch')?.addEventListener('input', this.searchUsers.bind(this));
        document.getElementById('requestStatusFilter')?.addEventListener('change', this.filterRequests.bind(this));
        document.getElementById('activityFilter')?.addEventListener('change', this.filterActivity.bind(this));
        document.getElementById('dateFilter')?.addEventListener('change', this.filterActivity.bind(this));

        // Settings
        document.getElementById('changePasswordForm')?.addEventListener('submit', this.changePassword.bind(this));
        document.getElementById('exportData')?.addEventListener('click', this.exportData.bind(this));
        document.getElementById('backupDatabase')?.addEventListener('click', this.backupDatabase.bind(this));

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') || 
                e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data if needed
        if (tabName === 'users' && this.usersData.length === 0) {
            this.loadUsers();
        } else if (tabName === 'requests' && this.requestsData.length === 0) {
            this.loadRequests();
        } else if (tabName === 'activity' && this.activityData.length === 0) {
            this.loadActivity();
        }
    }

    async loadData() {
        try {
            window.loadingManager?.show('Carregando dados...');

            // Load statistics
            const stats = await window.adminService.getStats();
            this.updateKPIs(stats);

            // Load recent activity
            const recentActivity = await window.adminService.getActivityLogs(10);
            this.renderRecentActivity(recentActivity);

            // Update badges
            document.getElementById('usersBadge').textContent = stats.pendingUsers;
            document.getElementById('requestsBadge').textContent = stats.pendingUsers;
            document.getElementById('pendingCount').textContent = stats.pendingUsers;
            document.getElementById('totalUsers').textContent = stats.totalUsers;

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            window.toastManager?.show('Erro ao carregar dados', 'error');
        } finally {
            window.loadingManager?.hide();
        }
    }

    updateKPIs(stats) {
        document.getElementById('totalUsersKpi').textContent = stats.totalUsers;
        document.getElementById('pendingKpi').textContent = stats.pendingUsers;
        document.getElementById('activeKpi').textContent = stats.approvedUsers;
        document.getElementById('todayKpi').textContent = stats.todayActivities;
    }

    renderRecentActivity(activities) {
        const container = document.getElementById('recentActivityList');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${this.getActivityIconClass(activity.action)}">
                    <i class="${this.getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-title">${this.getActivityTitle(activity)}</p>
                    <span class="activity-time">${this.formatTime(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    async loadUsers() {
        try {
            const users = await window.adminService.getPendingUsers();
            // Em um caso real, você carregaria todos os usuários aqui
            this.usersData = users;
            this.renderUsersTable(users);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            window.toastManager?.show('Erro ao carregar usuários', 'error');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${this.getInitials(user.name)}</div>
                        <div class="user-details">
                            <div class="user-name">${user.name}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="status-badge ${user.status}">${this.getStatusText(user.status)}</span></td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Nunca'}</td>
                <td>
                    <div class="action-buttons">
                        ${user.status === 'pending' ? `
                            <button class="btn-action approve" onclick="adminPanel.approveUser('${user.id}')">
                                Aprovar
                            </button>
                            <button class="btn-action reject" onclick="adminPanel.rejectUser('${user.id}')">
                                Rejeitar
                            </button>
                        ` : ''}
                        <button class="btn-action view" onclick="adminPanel.viewUser('${user.id}')">
                            Ver
                        </button>
                        ${user.status === 'approved' ? `
                            <button class="btn-action suspend" onclick="adminPanel.suspendUser('${user.id}')">
                                Suspender
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadRequests() {
        try {
            const requests = await window.adminService.getAccessRequests();
            this.requestsData = requests;
            this.renderRequestsGrid(requests);
        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
            window.toastManager?.show('Erro ao carregar solicitações', 'error');
        }
    }

    renderRequestsGrid(requests) {
        const grid = document.getElementById('requestsGrid');
        if (!grid) return;

        grid.innerHTML = requests.map(request => `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-info">
                        <h4>${request.name}</h4>
                        <p>${request.email}</p>
                        <p><strong>${request.company}</strong></p>
                    </div>
                    <span class="status-badge ${request.status}">${this.getStatusText(request.status)}</span>
                </div>
                
                <div class="request-meta">
                    <i class="fas fa-clock"></i>
                    ${this.formatDate(request.timestamp)}
                </div>
                
                <div class="request-reason">
                    <strong>Motivo:</strong><br>
                    ${request.reason}
                </div>
                
                ${!request.processed ? `
                    <div class="request-actions">
                        <button class="btn-action approve" onclick="adminPanel.processRequest('${request.id}', true)">
                            Aprovar
                        </button>
                        <button class="btn-action reject" onclick="adminPanel.processRequest('${request.id}', false)">
                            Rejeitar
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    async loadActivity() {
        try {
            const activities = await window.adminService.getActivityLogs(50);
            this.activityData = activities;
            this.renderActivityLog(activities);
        } catch (error) {
            console.error('Erro ao carregar atividades:', error);
            window.toastManager?.show('Erro ao carregar atividades', 'error');
        }
    }

    renderActivityLog(activities) {
        const log = document.getElementById('activityLog');
        if (!log) return;

        log.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${this.getActivityIconClass(activity.action)}">
                    <i class="${this.getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${this.getActivityTitle(activity)}</div>
                    <div class="activity-desc">${this.getActivityDescription(activity)}</div>
                    <div class="activity-time">${this.formatDate(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    // User management methods
    async approveUser(userId) {
        try {
            window.loadingManager?.show('Aprovando usuário...');
            await window.adminService.approveUser(userId);
            window.toastManager?.show('Usuário aprovado com sucesso!', 'success');
            this.loadUsers();
            this.loadData();
        } catch (error) {
            window.toastManager?.show('Erro ao aprovar usuário', 'error');
        } finally {
            window.loadingManager?.hide();
        }
    }

    async rejectUser(userId) {
        const reason = prompt('Motivo da rejeição (opcional):');
        try {
            window.loadingManager?.show('Rejeitando usuário...');
            await window.adminService.rejectUser(userId, reason || '');
            window.toastManager?.show('Usuário rejeitado', 'info');
            this.loadUsers();
            this.loadData();
        } catch (error) {
            window.toastManager?.show('Erro ao rejeitar usuário', 'error');
        } finally {
            window.loadingManager?.hide();
        }
    }

    async suspendUser(userId) {
        const reason = prompt('Motivo da suspensão:');
        if (!reason) return;

        try {
            window.loadingManager?.show('Suspendendo usuário...');
            await window.adminService.suspendUser(userId, reason);
            window.toastManager?.show('Usuário suspenso', 'warning');
            this.loadUsers();
            this.loadData();
        } catch (error) {
            window.toastManager?.show('Erro ao suspender usuário', 'error');
        } finally {
            window.loadingManager?.hide();
        }
    }

    async processRequest(requestId, approved) {
        const adminNotes = approved ? 
            prompt('Notas administrativas (opcional):') :
            prompt('Motivo da rejeição:');

        try {
            window.loadingManager?.show('Processando solicitação...');
            await window.adminService.processAccessRequest(requestId, approved, adminNotes || '');
            window.toastManager?.show(
                approved ? 'Solicitação aprovada!' : 'Solicitação rejeitada', 
                approved ? 'success' : 'info'
            );
            this.loadRequests();
            this.loadData();
        } catch (error) {
            window.toastManager?.show('Erro ao processar solicitação', 'error');
        } finally {
            window.loadingManager?.hide();
        }
    }

    // Filter methods
    filterUsers() {
        const statusFilter = document.getElementById('userStatusFilter').value;
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        
        let filteredUsers = this.usersData;
        
        if (statusFilter) {
            filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
        }
        
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderUsersTable(filteredUsers);
    }

    searchUsers() {
        this.filterUsers();
    }

    filterRequests() {
        const statusFilter = document.getElementById('requestStatusFilter').value;
        let filteredRequests = this.requestsData;
        
        if (statusFilter) {
            if (statusFilter === 'pending') {
                filteredRequests = filteredRequests.filter(req => !req.processed);
            } else {
                filteredRequests = filteredRequests.filter(req => 
                    req.processed && req.approved === (statusFilter === 'approved')
                );
            }
        }
        
        this.renderRequestsGrid(filteredRequests);
    }

    filterActivity() {
        const actionFilter = document.getElementById('activityFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        let filteredActivity = this.activityData;
        
        if (actionFilter) {
            filteredActivity = filteredActivity.filter(activity => 
                activity.action === actionFilter
            );
        }
        
        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            filteredActivity = filteredActivity.filter(activity => {
                const activityDate = activity.timestamp.toDate ? 
                    activity.timestamp.toDate() : new Date(activity.timestamp);
                return activityDate.toDateString() === filterDate.toDateString();
            });
        }
        
        this.renderActivityLog(filteredActivity);
    }

    // Charts
    initCharts() {
        this.initUsersChart();
        this.initActivityChart();
    }

    initUsersChart() {
        const ctx = document.getElementById('usersChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aprovados', 'Pendentes', 'Rejeitados', 'Suspensos'],
                datasets: [{
                    data: [65, 15, 10, 10],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
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

    initActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Acessos',
                    data: [12, 19, 15, 25, 22, 8, 5],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#cbd5e1'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#cbd5e1'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1'
                        }
                    }
                }
            }
        });
    }

    // Utility methods
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'Pendente',
            approved: 'Aprovado',
            rejected: 'Rejeitado',
            suspended: 'Suspenso'
        };
        return statusMap[status] || status;
    }

    getActivityIcon(action) {
        const iconMap = {
            login: 'fas fa-sign-in-alt',
            logout: 'fas fa-sign-out-alt',
            user_approved: 'fas fa-check',
            user_rejected: 'fas fa-times',
            user_suspended: 'fas fa-pause'
        };
        return iconMap[action] || 'fas fa-info';
    }

    getActivityIconClass(action) {
        const classMap = {
            login: 'success',
            logout: 'info',
            user_approved: 'success',
            user_rejected: 'danger',
            user_suspended: 'warning'
        };
        return classMap[action] || 'info';
    }

    getActivityTitle(activity) {
        const titleMap = {
            login: 'Usuário fez login',
            logout: 'Usuário fez logout',
            user_approved: 'Usuário aprovado',
            user_rejected: 'Usuário rejeitado',
            user_suspended: 'Usuário suspenso'
        };
        return titleMap[activity.action] || 'Atividade';
    }

    getActivityDescription(activity) {
        // Aqui você pode adicionar mais detalhes baseados nos dados da atividade
        return `ID: ${activity.userId || 'N/A'}`;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        const now = new Date();
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} dias atrás`;
    }

    // Settings methods
    async changePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            window.toastManager?.show('As senhas não coincidem', 'error');
            return;
        }
        
        // Aqui você implementaria a lógica para alterar a senha
        window.toastManager?.show('Funcionalidade em desenvolvimento', 'info');
    }

    async exportData() {
        try {
            window.loadingManager?.show('Exportando dados...');
            // Implementar lógica de exportação
            window.toastManager?.show('Funcionalidade em desenvolvimento', 'info');
        } finally {
            window.loadingManager?.hide();
        }
    }

    async backupDatabase() {
        try {
            window.loadingManager?.show('Fazendo backup...');
            // Implementar lógica de backup
            window.toastManager?.show('Funcionalidade em desenvolvimento', 'info');
        } finally {
            window.loadingManager?.hide();
        }
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    async logout() {
        try {
            await window.authService.logout();
            window.location.href = 'index.html';
        } catch (error) {
            window.toastManager?.show('Erro ao fazer logout', 'error');
        }
    }
}

// Instanciar o painel administrativo
const adminPanel = new AdminPanel();

// Disponibilizar globalmente
window.adminPanel = adminPanel;