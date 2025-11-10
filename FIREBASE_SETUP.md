# Configuração do Firebase para NetBairro Manager

## 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar projeto"
3. Nome: `netbairro-manager`
4. Ative o Google Analytics (opcional)
5. Escolha a região: South America (São Paulo)

## 2. Configurar Authentication

1. No console Firebase, vá para "Authentication"
2. Na aba "Sign-in method", ative:
   - **Google**: Configure com seu projeto Google Cloud
   - **Email/Password**: Para login administrativo

### Configurar Google OAuth:
```javascript
// Domínios autorizados (adicionar no Firebase):
- localhost (para desenvolvimento)
- seu-dominio.com (para produção)
```

## 3. Configurar Firestore Database

1. No console Firebase, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Modo: **Produção** (para segurança)
4. Região: `southamerica-east1` (São Paulo)

### Estrutura do Banco:

```
/users/{userId}
- uid: string
- email: string
- name: string
- photoURL: string
- status: 'pending' | 'approved' | 'rejected' | 'suspended'
- createdAt: timestamp
- lastLogin: timestamp
- accessRequests: array

/access_requests/{requestId}
- name: string
- email: string
- company: string
- reason: string
- status: 'pending' | 'approved' | 'rejected'
- timestamp: timestamp
- processed: boolean
- adminNotes: string

/user_activities/{activityId}
- userId: string
- action: string
- timestamp: timestamp
- ip: string
- userAgent: string

/admin_activities/{activityId}
- action: string
- timestamp: timestamp
- additionalData: object

/admin_notifications/{notificationId}
- type: string
- title: string
- message: string
- data: object
- read: boolean
- timestamp: timestamp

/approved_access/{approvedId}
- email: string
- name: string
- company: string
- approvedAt: timestamp
- approvedBy: string
```

## 4. Regras de Segurança Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários só podem ler/editar seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Solicitações de acesso - qualquer um pode criar, admin pode ler/editar
    match /access_requests/{requestId} {
      allow create: if true; // Permitir criação anônima
      allow read, update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/admin_users/$(request.auth.uid));
    }
    
    // Atividades - apenas leitura para usuários autenticados
    match /user_activities/{activityId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Atividades admin - apenas para admins
    match /admin_activities/{activityId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admin_users/$(request.auth.uid));
    }
    
    // Notificações admin - apenas para admins
    match /admin_notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admin_users/$(request.auth.uid));
    }
  }
}
```

## 5. Configurar Hosting (Opcional)

1. No console Firebase, vá para "Hosting"
2. Clique em "Começar"
3. Instale Firebase CLI: `npm install -g firebase-tools`
4. Faça login: `firebase login`
5. Inicialize: `firebase init hosting`
6. Deploy: `firebase deploy`

## 6. Configurações do Projeto

### Substituir no arquivo `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "netbairro-manager.firebaseapp.com",
  projectId: "netbairro-manager",
  storageBucket: "netbairro-manager.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};
```

### Configurar Google OAuth:

1. No Google Cloud Console:
   - Vá para "Credenciais"
   - Crie um "ID do cliente OAuth 2.0"
   - Adicione os domínios autorizados

2. No Firebase Authentication:
   - Configure o provedor Google
   - Adicione o Client ID e Secret

## 7. Limites Gratuitos Firebase

### Firestore:
- **Leituras**: 50.000/dia
- **Escritas**: 20.000/dia  
- **Exclusões**: 20.000/dia
- **Armazenamento**: 1GB

### Authentication:
- **Usuários ativos**: Ilimitado no plano gratuito
- **Verificações de telefone**: 10.000/mês

### Hosting:
- **Armazenamento**: 10GB
- **Transferência**: 360MB/dia

**Para 100+ usuários ativos, o plano gratuito é suficiente!**

## 8. Monitoramento

### No Firebase Console:
- Use "Analytics" para monitorar uso
- Configure alertas de cota
- Monitore Performance

### Logs importantes:
```javascript
// Adicionar ao código para monitorar uso
console.log('Firebase quota usage:', {
  reads: 'Verificar no console',
  writes: 'Verificar no console',
  storage: 'Verificar no console'
});
```

## 9. Backup e Segurança

### Backup automático:
```bash
# Exportar dados
gcloud firestore export gs://netbairro-manager-backups/backup-$(date +%Y%m%d)

# Agendar backup semanal (Cloud Scheduler)
```

### Segurança adicional:
- Ativar App Check
- Configurar CORS adequadamente
- Usar reCAPTCHA para formulários públicos
- Implementar rate limiting

## 10. Variáveis de Ambiente

### Para produção, criar arquivo `.env`:
```
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=netbairro-manager.firebaseapp.com
FIREBASE_PROJECT_ID=netbairro-manager
ADMIN_PASSWORD=SenhaSuperSegura123!
GOOGLE_OAUTH_CLIENT_ID=seu_client_id
```

## Custos Estimados (100 usuários ativos)

### Cenário típico:
- **Usuários**: 100 ativos
- **Logins diários**: 200
- **Operações DB**: ~2.000/dia
- **Armazenamento**: ~100MB

### Custo mensal: **GRATUITO** (dentro dos limites)

### Plano Blaze (se exceder):
- Firestore: ~$1-3/mês
- Authentication: Gratuito
- Hosting: Gratuito
- **Total**: $1-5/mês máximo