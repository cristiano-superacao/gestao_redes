// ===== Dados de Demonstração =====

// Simular dados para demonstração quando Firebase não estiver configurado
const DEMO_USERS = [
    {
        id: 'user1',
        name: 'João Silva',
        email: 'joao.silva@provedor.com',
        status: 'approved',
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-11-09'),
        company: 'Internet Silva Ltda'
    },
    {
        id: 'user2', 
        name: 'Maria Santos',
        email: 'maria.santos@telecom.com',
        status: 'pending',
        createdAt: new Date('2024-11-08'),
        lastLogin: null,
        company: 'Santos Telecom'
    },
    {
        id: 'user3',
        name: 'Pedro Costa',
        email: 'pedro@netcosta.com.br',
        status: 'approved',
        createdAt: new Date('2024-10-20'),
        lastLogin: new Date('2024-11-07'),
        company: 'NetCosta Provedor'
    },
    {
        id: 'user4',
        name: 'Ana Oliveira',
        email: 'ana.oliveira@fibernet.com',
        status: 'suspended',
        createdAt: new Date('2024-09-10'),
        lastLogin: new Date('2024-10-15'),
        company: 'FiberNet'
    }
];

const DEMO_REQUESTS = [
    {
        id: 'req1',
        name: 'Carlos Mendes',
        email: 'carlos@speednet.com',
        company: 'SpeedNet Provedor',
        reason: 'Preciso acessar o sistema para gerenciar minha rede de fibra óptica. Tenho 500+ clientes e preciso de uma solução profissional.',
        timestamp: new Date('2024-11-09'),
        status: 'pending',
        processed: false
    },
    {
        id: 'req2',
        name: 'Fernanda Lima',
        email: 'fernanda@conecta.net.br',
        company: 'Conecta Internet',
        reason: 'Sou administradora de rede e preciso de acesso para monitoramento e gestão de clientes.',
        timestamp: new Date('2024-11-08'),
        status: 'approved',
        processed: true,
        adminNotes: 'Aprovado após verificação da empresa.'
    }
];

const DEMO_ACTIVITIES = [
    {
        id: 'act1',
        userId: 'user1',
        action: 'login',
        timestamp: new Date('2024-11-09T14:30:00'),
        ip: '192.168.1.100'
    },
    {
        id: 'act2',
        userId: 'user2',
        action: 'user_approved',
        timestamp: new Date('2024-11-09T10:15:00'),
        ip: '192.168.1.1'
    },
    {
        id: 'act3',
        userId: 'user1',
        action: 'logout',
        timestamp: new Date('2024-11-09T12:45:00'),
        ip: '192.168.1.100'
    },
    {
        id: 'act4',
        userId: 'user3',
        action: 'login',
        timestamp: new Date('2024-11-07T16:20:00'),
        ip: '10.0.0.50'
    }
];

// ===== Modo Demo =====
class DemoService {
    constructor() {
        this.demoMode = true;
        console.log('🎭 Executando em modo demonstração');
        console.log('📝 Para usar com dados reais, configure o Firebase seguindo FIREBASE_SETUP.md');
    }

    // Simular dados de stats
    async getStats() {
        return {
            totalUsers: DEMO_USERS.length,
            pendingUsers: DEMO_USERS.filter(u => u.status === 'pending').length,
            approvedUsers: DEMO_USERS.filter(u => u.status === 'approved').length,
            todayActivities: DEMO_ACTIVITIES.filter(a => {
                const today = new Date();
                const actDate = new Date(a.timestamp);
                return actDate.toDateString() === today.toDateString();
            }).length
        };
    }

    // Simular lista de usuários
    async getPendingUsers() {
        return DEMO_USERS.filter(u => u.status === 'pending');
    }

    async getAllUsers() {
        return DEMO_USERS;
    }

    // Simular solicitações de acesso
    async getAccessRequests() {
        return DEMO_REQUESTS;
    }

    // Simular logs de atividade
    async getActivityLogs(limit = 50) {
        return DEMO_ACTIVITIES.slice(0, limit);
    }

    // Simular aprovação de usuário
    async approveUser(userId) {
        const user = DEMO_USERS.find(u => u.id === userId);
        if (user) {
            user.status = 'approved';
            
            // Adicionar atividade
            DEMO_ACTIVITIES.unshift({
                id: 'act' + Date.now(),
                userId: userId,
                action: 'user_approved',
                timestamp: new Date(),
                ip: '192.168.1.1'
            });
        }
        return Promise.resolve();
    }

    // Simular rejeição de usuário
    async rejectUser(userId, reason = '') {
        const user = DEMO_USERS.find(u => u.id === userId);
        if (user) {
            user.status = 'rejected';
            user.rejectionReason = reason;

            DEMO_ACTIVITIES.unshift({
                id: 'act' + Date.now(),
                userId: userId,
                action: 'user_rejected',
                timestamp: new Date(),
                ip: '192.168.1.1'
            });
        }
        return Promise.resolve();
    }

    // Simular suspensão de usuário
    async suspendUser(userId, reason = '') {
        const user = DEMO_USERS.find(u => u.id === userId);
        if (user) {
            user.status = 'suspended';
            user.suspensionReason = reason;

            DEMO_ACTIVITIES.unshift({
                id: 'act' + Date.now(),
                userId: userId,
                action: 'user_suspended',
                timestamp: new Date(),
                ip: '192.168.1.1'
            });
        }
        return Promise.resolve();
    }

    // Simular processamento de solicitação
    async processAccessRequest(requestId, approved, adminNotes = '') {
        const request = DEMO_REQUESTS.find(r => r.id === requestId);
        if (request) {
            request.processed = true;
            request.approved = approved;
            request.adminNotes = adminNotes;
            request.status = approved ? 'approved' : 'rejected';
        }
        return Promise.resolve();
    }

    // Simular login
    async loginWithGoogle() {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const demoUser = {
            uid: 'demo_user_123',
            email: 'demo@netbairro.com',
            displayName: 'Usuário Demo',
            photoURL: null
        };

        // Verificar se usuário existe
        const existingUser = DEMO_USERS.find(u => u.email === demoUser.email);
        if (!existingUser) {
            // Criar novo usuário demo
            DEMO_USERS.push({
                id: demoUser.uid,
                name: demoUser.displayName,
                email: demoUser.email,
                status: 'approved', // Auto-aprovar para demo
                createdAt: new Date(),
                lastLogin: new Date(),
                company: 'NetBairro Demo'
            });
        }

        return demoUser;
    }

    // Simular login admin
    async adminLogin(password) {
        if (password !== 'NetBairro@Admin2024#') {
            throw new Error('Senha de administrador incorreta');
        }
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return true;
    }

    // Simular solicitação de acesso
    async requestAccess(requestData) {
        const newRequest = {
            id: 'req' + Date.now(),
            ...requestData,
            timestamp: new Date(),
            status: 'pending',
            processed: false
        };
        
        DEMO_REQUESTS.unshift(newRequest);
        return Promise.resolve(newRequest.id);
    }
}

// ===== Verificar se Firebase está disponível =====
function initializeServices() {
    // Verificar se Firebase está configurado
    if (typeof firebase === 'undefined') {
        console.warn('🔥 Firebase não detectado. Usando modo demo.');
        
        // Usar serviços demo
        window.authService = new DemoService();
        window.adminService = new DemoService();
        window.authService.isAdmin = false;
        
        // Simular que o usuário fez login admin se na página admin
        if (window.location.pathname.includes('admin.html')) {
            window.authService.isAdmin = true;
        }
        
    } else {
        console.log('🔥 Firebase detectado. Usando modo produção.');
        
        // Carregar serviços reais se Firebase estiver disponível
        // (código dos serviços reais já está nos outros arquivos)
    }
}

// ===== Toast Demo =====
function showDemoInfo() {
    if (window.toastManager) {
        setTimeout(() => {
            window.toastManager.show('🎭 Executando em modo demonstração', 'info');
        }, 2000);
        
        setTimeout(() => {
            window.toastManager.show('📖 Verifique FIREBASE_SETUP.md para produção', 'info');
        }, 5000);
    }
}

// ===== Inicializar =====
document.addEventListener('DOMContentLoaded', () => {
    initializeServices();
    showDemoInfo();
});

// Exportar para uso global
window.DemoService = DemoService;
window.DEMO_USERS = DEMO_USERS;
window.DEMO_REQUESTS = DEMO_REQUESTS;
window.DEMO_ACTIVITIES = DEMO_ACTIVITIES;