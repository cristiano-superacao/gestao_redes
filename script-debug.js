// ===== NetBairro Manager - Script Simplificado Para Debug =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - iniciando debug...');
    
    // Verificar elementos
    const adminAccess = document.getElementById('adminAccess');
    const adminModal = document.getElementById('adminModal');
    const adminForm = document.getElementById('adminLoginForm');
    const adminPassword = document.getElementById('adminPassword');
    const googleLogin = document.getElementById('googleLogin');
    
    console.log('Elementos encontrados:', {
        adminAccess: !!adminAccess,
        adminModal: !!adminModal,
        adminForm: !!adminForm,
        adminPassword: !!adminPassword,
        googleLogin: !!googleLogin
    });
    
    // ===== Google Login Simples =====
    if (googleLogin) {
        googleLogin.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Google login clicado');
            
            // Simular login
            showLoading('Conectando com Google...');
            
            setTimeout(() => {
                hideLoading();
                showNotification('Login realizado com sucesso!', 'success');
                
                // Salvar estado
                localStorage.setItem('currentUser', JSON.stringify({
                    email: 'usuario@gmail.com',
                    name: 'Usuário Teste',
                    uid: 'test_' + Date.now()
                }));
                localStorage.setItem('isAuthenticated', 'true');
                
                // Redirecionar
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            }, 1000);
        });
    }
    
    // ===== Admin Access =====
    if (adminAccess) {
        adminAccess.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Admin access clicado');
            
            if (adminModal) {
                adminModal.style.display = 'block';
                adminModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // ===== Admin Form =====
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Admin form submetido');
            
            const password = adminPassword ? adminPassword.value : '';
            const correctPassword = 'NetBairro@Admin2024#';
            
            console.log('Senha inserida:', password);
            console.log('Senha correta:', correctPassword);
            console.log('Senhas iguais:', password === correctPassword);
            
            if (!password) {
                showNotification('Digite a senha de administrador', 'error');
                return;
            }
            
            showLoading('Verificando credenciais...');
            
            setTimeout(() => {
                hideLoading();
                
                if (password === correctPassword) {
                    showNotification('Login administrativo realizado!', 'success');
                    
                    // Salvar estado admin
                    localStorage.setItem('isAdmin', 'true');
                    localStorage.setItem('adminLoginTime', new Date().toISOString());
                    
                    // Fechar modal
                    if (adminModal) {
                        adminModal.style.display = 'none';
                        adminModal.classList.remove('show');
                        document.body.style.overflow = '';
                    }
                    
                    // Redirecionar
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                    
                } else {
                    showNotification('Senha de administrador incorreta', 'error');
                }
            }, 800);
        });
    }
    
    // ===== Modal Close =====
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-close') || 
            e.target.classList.contains('modal-backdrop')) {
            
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('show');
            });
            document.body.style.overflow = '';
        }
    });
    
    // ===== Funções Utilitárias =====
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
        } else {
            overlay.querySelector('p').textContent = message;
        }
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
                <span id="toastMessage">${message}</span>
            `;
            document.body.appendChild(toast);
        }
        
        const icon = toast.querySelector('i');
        const messageEl = toast.querySelector('#toastMessage');
        
        // Atualizar conteúdo
        messageEl.textContent = message;
        
        // Atualizar ícone
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-triangle';
            toast.style.background = '#ef4444';
        } else if (type === 'warning') {
            icon.className = 'fas fa-exclamation-circle';
            toast.style.background = '#f59e0b';
        } else {
            icon.className = 'fas fa-check-circle';
            toast.style.background = '#10b981';
        }
        
        // Mostrar
        toast.classList.add('show');
        
        // Esconder após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    console.log('Script de debug carregado com sucesso!');
});