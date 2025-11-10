// ===== Sistema de Autenticação JWT =====
// Gestão de Provedores - JWT Authentication Service

class JWTAuthService {
    constructor() {
        this.tokenKey = 'jwt_token';
        this.refreshTokenKey = 'jwt_refresh_token';
        this.userKey = 'jwt_user';
        this.apiBaseUrl = this.getApiBaseUrl();
    }

    getApiBaseUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8888/.netlify/functions';
        }
        return '/.netlify/functions';
    }

    // ===== Autenticação =====
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    email,
                    password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao fazer login');
            }

            const data = await response.json();
            
            // Armazenar tokens
            this.setToken(data.token);
            this.setRefreshToken(data.refreshToken);
            this.setUser(data.user);

            return data;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    async loginAdmin(password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login-admin',
                    password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Senha incorreta');
            }

            const data = await response.json();
            
            // Armazenar tokens
            this.setToken(data.token);
            this.setRefreshToken(data.refreshToken);
            this.setUser(data.user);

            return data;
        } catch (error) {
            console.error('Erro no login admin:', error);
            throw error;
        }
    }

    async loginWithGoogle(credential) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login-google',
                    credential
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao fazer login com Google');
            }

            const data = await response.json();
            
            // Armazenar tokens
            this.setToken(data.token);
            this.setRefreshToken(data.refreshToken);
            this.setUser(data.user);

            return data;
        } catch (error) {
            console.error('Erro no login Google:', error);
            throw error;
        }
    }

    // ===== Logout =====
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userKey);
        
        // Limpar cookies se existirem
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    }

    // ===== Refresh Token =====
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken) {
            throw new Error('Refresh token não encontrado');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'refresh',
                    refreshToken
                })
            });

            if (!response.ok) {
                throw new Error('Falha ao renovar token');
            }

            const data = await response.json();
            
            this.setToken(data.token);
            
            if (data.refreshToken) {
                this.setRefreshToken(data.refreshToken);
            }

            return data.token;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            this.logout();
            throw error;
        }
    }

    // ===== Token Management =====
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    setRefreshToken(token) {
        localStorage.setItem(this.refreshTokenKey, token);
    }

    getRefreshToken() {
        return localStorage.getItem(this.refreshTokenKey);
    }

    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    // ===== Token Validation =====
    isTokenValid(token) {
        if (!token) return false;

        try {
            const payload = this.decodeToken(token);
            const now = Date.now() / 1000;
            
            return payload.exp > now;
        } catch (error) {
            return false;
        }
    }

    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }

    // ===== Authentication Check =====
    isAuthenticated() {
        const token = this.getToken();
        return token && this.isTokenValid(token);
    }

    async ensureAuthenticated() {
        if (!this.isAuthenticated()) {
            try {
                await this.refreshToken();
                return true;
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    // ===== API Request Helper =====
    async authenticatedFetch(url, options = {}) {
        // Garantir que estamos autenticados
        const isAuth = await this.ensureAuthenticated();
        
        if (!isAuth) {
            throw new Error('Usuário não autenticado');
        }

        const token = this.getToken();
        
        // Adicionar header de autenticação
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Se token expirado, tentar renovar
            if (response.status === 401) {
                await this.refreshToken();
                
                // Tentar novamente com novo token
                const newToken = this.getToken();
                headers.Authorization = `Bearer ${newToken}`;
                
                return fetch(url, {
                    ...options,
                    headers
                });
            }

            return response;
        } catch (error) {
            console.error('Erro na requisição autenticada:', error);
            throw error;
        }
    }

    // ===== User Permissions =====
    hasPermission(permission) {
        const user = this.getUser();
        if (!user || !user.permissions) return false;
        
        return user.permissions.includes(permission) || user.permissions.includes('*');
    }

    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }

    // ===== Token Expiration Warning =====
    setupTokenExpirationWarning() {
        const token = this.getToken();
        
        if (!token) return;

        const payload = this.decodeToken(token);
        if (!payload) return;

        const expiresIn = payload.exp * 1000 - Date.now();
        const warningTime = expiresIn - (5 * 60 * 1000); // 5 minutos antes

        if (warningTime > 0) {
            setTimeout(() => {
                this.showExpirationWarning();
            }, warningTime);
        }
    }

    showExpirationWarning() {
        if (window.GestaoProvedores && window.GestaoProvedores.showNotification) {
            window.GestaoProvedores.showNotification(
                'Sua sessão está prestes a expirar. Deseja renovar?',
                'warning'
            );
        }
    }
}

// Exportar instância única
const jwtAuth = new JWTAuthService();

// Expor globalmente
if (typeof window !== 'undefined') {
    window.JWTAuth = jwtAuth;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JWTAuthService;
}
