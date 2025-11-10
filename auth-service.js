// ===== Serviço de Autenticação e Banco de Dados =====

class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    async init() {
        // Configurar listener de autenticação
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.checkUserStatus(user);
            } else {
                this.currentUser = null;
                this.isAdmin = false;
            }
        });
    }

    // Login com Google
    async loginWithGoogle() {
        try {
            const result = await firebase.auth().signInWithPopup(googleProvider);
            const user = result.user;
            
            // Verificar se usuário existe no banco
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Criar perfil de usuário
                await this.createUserProfile(user);
                throw new Error('Conta criada! Aguarde aprovação do administrador.');
            }
            
            const userData = userDoc.data();
            
            if (userData.status !== USER_STATUS.APPROVED) {
                await firebase.auth().signOut();
                throw new Error('Sua conta ainda não foi aprovada pelo administrador.');
            }

            // Registrar login
            await this.logUserActivity(user.uid, 'login', {
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ip: await this.getUserIP(),
                userAgent: navigator.userAgent
            });

            return user;
        } catch (error) {
            throw error;
        }
    }

    // Login administrativo
    async adminLogin(password) {
        if (password !== ADMIN_PASSWORD) {
            throw new Error('Senha de administrador incorreta');
        }

        this.isAdmin = true;
        
        // Registrar acesso admin
        await this.logAdminActivity('admin_login', {
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: await this.getUserIP()
        });

        return true;
    }

    // Criar perfil de usuário
    async createUserProfile(user) {
        const userProfile = {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            status: USER_STATUS.PENDING,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: null,
            accessRequests: []
        };

        await db.collection('users').doc(user.uid).set(userProfile);
        
        // Notificar admin sobre nova solicitação
        await this.notifyAdminNewUser(userProfile);
    }

    // Verificar status do usuário
    async checkUserStatus(user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Atualizar último login se aprovado
                if (userData.status === USER_STATUS.APPROVED) {
                    await db.collection('users').doc(user.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                return userData;
            }
            return null;
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            return null;
        }
    }

    // Solicitar acesso
    async requestAccess(requestData) {
        const accessRequest = {
            ...requestData,
            id: db.collection('access_requests').doc().id,
            status: USER_STATUS.PENDING,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: await this.getUserIP(),
            userAgent: navigator.userAgent
        };

        await db.collection('access_requests').add(accessRequest);
        
        // Notificar admin
        await this.notifyAdminAccessRequest(accessRequest);
        
        return accessRequest.id;
    }

    // Logout
    async logout() {
        if (this.currentUser) {
            await this.logUserActivity(this.currentUser.uid, 'logout');
        }
        
        this.isAdmin = false;
        await firebase.auth().signOut();
    }

    // Registrar atividade do usuário
    async logUserActivity(userId, action, additionalData = {}) {
        try {
            await db.collection('user_activities').add({
                userId,
                action,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ...additionalData
            });
        } catch (error) {
            console.error('Erro ao registrar atividade:', error);
        }
    }

    // Registrar atividade admin
    async logAdminActivity(action, additionalData = {}) {
        try {
            await db.collection('admin_activities').add({
                action,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ...additionalData
            });
        } catch (error) {
            console.error('Erro ao registrar atividade admin:', error);
        }
    }

    // Notificar admin sobre novo usuário
    async notifyAdminNewUser(userProfile) {
        await db.collection('admin_notifications').add({
            type: 'new_user',
            title: 'Novo usuário cadastrado',
            message: `${userProfile.name} (${userProfile.email}) se cadastrou e aguarda aprovação`,
            data: userProfile,
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // Notificar admin sobre solicitação de acesso
    async notifyAdminAccessRequest(request) {
        await db.collection('admin_notifications').add({
            type: 'access_request',
            title: 'Nova solicitação de acesso',
            message: `${request.name} (${request.email}) da empresa ${request.company} solicita acesso`,
            data: request,
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // Obter IP do usuário
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }
}

// ===== Serviço Administrativo =====
class AdminService {
    constructor() {
        this.authService = new AuthService();
    }

    // Listar usuários pendentes
    async getPendingUsers() {
        const snapshot = await db.collection('users')
            .where('status', '==', USER_STATUS.PENDING)
            .orderBy('createdAt', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Aprovar usuário
    async approveUser(userId, approvedBy = 'admin') {
        await db.collection('users').doc(userId).update({
            status: USER_STATUS.APPROVED,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy
        });

        await this.authService.logAdminActivity('user_approved', {
            userId,
            approvedBy
        });
    }

    // Rejeitar usuário
    async rejectUser(userId, reason = '') {
        await db.collection('users').doc(userId).update({
            status: USER_STATUS.REJECTED,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
            rejectionReason: reason
        });

        await this.authService.logAdminActivity('user_rejected', {
            userId,
            reason
        });
    }

    // Suspender usuário
    async suspendUser(userId, reason = '') {
        await db.collection('users').doc(userId).update({
            status: USER_STATUS.SUSPENDED,
            suspendedAt: firebase.firestore.FieldValue.serverTimestamp(),
            suspensionReason: reason
        });

        await this.authService.logAdminActivity('user_suspended', {
            userId,
            reason
        });
    }

    // Listar solicitações de acesso
    async getAccessRequests() {
        const snapshot = await db.collection('access_requests')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // Processar solicitação de acesso
    async processAccessRequest(requestId, approved, adminNotes = '') {
        const request = await db.collection('access_requests').doc(requestId).get();
        
        if (!request.exists) {
            throw new Error('Solicitação não encontrada');
        }

        const requestData = request.data();
        
        if (approved) {
            // Criar usuário temporário com dados da solicitação
            const tempUser = {
                email: requestData.email,
                name: requestData.name,
                company: requestData.company,
                status: USER_STATUS.APPROVED,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedBy: 'admin',
                fromAccessRequest: true,
                accessRequestId: requestId
            };

            // Adicionar à lista de usuários aprovados
            await db.collection('approved_access').add(tempUser);
        }

        // Atualizar solicitação
        await db.collection('access_requests').doc(requestId).update({
            processed: true,
            approved,
            processedAt: firebase.firestore.FieldValue.serverTimestamp(),
            adminNotes
        });

        await this.authService.logAdminActivity('access_request_processed', {
            requestId,
            approved,
            email: requestData.email
        });
    }

    // Obter estatísticas
    async getStats() {
        const [usersSnapshot, pendingSnapshot, activitiesSnapshot] = await Promise.all([
            db.collection('users').get(),
            db.collection('users').where('status', '==', USER_STATUS.PENDING).get(),
            db.collection('user_activities').where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))).get()
        ]);

        return {
            totalUsers: usersSnapshot.size,
            pendingUsers: pendingSnapshot.size,
            approvedUsers: usersSnapshot.docs.filter(doc => doc.data().status === USER_STATUS.APPROVED).length,
            todayActivities: activitiesSnapshot.size
        };
    }

    // Obter logs de atividade
    async getActivityLogs(limit = 50) {
        const snapshot = await db.collection('user_activities')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

// Instanciar serviços
const authService = new AuthService();
const adminService = new AdminService();

// Exportar para uso global
window.authService = authService;
window.adminService = adminService;