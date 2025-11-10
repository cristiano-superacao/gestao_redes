// Service Worker para PWA - Gestão de Provedores
// Versão do cache - incrementar quando houver mudanças
const CACHE_VERSION = 'gestao-provedores-v1.0.0';
const CACHE_NAME = `${CACHE_VERSION}`;

// Arquivos para cache offline
const OFFLINE_CACHE_FILES = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/admin.html',
    '/css/main.css',
    '/css/components.css',
    '/css/dashboard.css',
    '/css/admin.css',
    '/js/main.js',
    '/config/database.js',
    '/assets/favicon.svg',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Arquivos dinâmicos (não fazer cache)
const DYNAMIC_CACHE_BLACKLIST = [
    '/api/',
    '/.netlify/',
    'firebasestorage.googleapis.com',
    'supabase.co'
];

// ===== Instalação do Service Worker =====
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cache aberto');
                return cache.addAll(OFFLINE_CACHE_FILES);
            })
            .then(() => {
                console.log('[Service Worker] Instalação completa');
                return self.skipWaiting(); // Ativa imediatamente
            })
            .catch((error) => {
                console.error('[Service Worker] Erro na instalação:', error);
            })
    );
});

// ===== Ativação do Service Worker =====
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Ativando...', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Remover caches antigos
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Ativação completa');
                return self.clients.claim(); // Assume controle imediatamente
            })
    );
});

// ===== Interceptação de Requisições =====
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorar requisições blacklisted (APIs dinâmicas)
    if (DYNAMIC_CACHE_BLACKLIST.some(item => url.href.includes(item))) {
        return;
    }
    
    // Estratégia: Network First, fallback para Cache
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Se a resposta for válida, adicionar ao cache
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                
                return response;
            })
            .catch(() => {
                // Se falhar (offline), buscar do cache
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // Se não houver cache, retornar página offline
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// ===== Sincronização em Background =====
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background Sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        // Sincronizar dados pendentes quando online
        const pendingData = await getPendingData();
        
        if (pendingData && pendingData.length > 0) {
            for (const item of pendingData) {
                await sendToServer(item);
            }
            
            await clearPendingData();
            console.log('[Service Worker] Dados sincronizados com sucesso');
        }
    } catch (error) {
        console.error('[Service Worker] Erro na sincronização:', error);
        throw error;
    }
}

async function getPendingData() {
    // Buscar dados pendentes do IndexedDB
    return new Promise((resolve) => {
        const request = indexedDB.open('GestaoProvedoresDB', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['pendingSync'], 'readonly');
            const store = transaction.objectStore('pendingSync');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };
        };
        
        request.onerror = () => {
            resolve([]);
        };
    });
}

async function sendToServer(data) {
    const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Falha ao sincronizar dados');
    }
    
    return response.json();
}

async function clearPendingData() {
    return new Promise((resolve) => {
        const request = indexedDB.open('GestaoProvedoresDB', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['pendingSync'], 'readwrite');
            const store = transaction.objectStore('pendingSync');
            store.clear();
            
            transaction.oncomplete = () => {
                resolve();
            };
        };
    });
}

// ===== Notificações Push =====
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push recebido');
    
    const options = {
        body: event.data ? event.data.text() : 'Nova notificação',
        icon: '/assets/favicon.svg',
        badge: '/assets/favicon.svg',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir',
                icon: '/assets/favicon.svg'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/assets/favicon.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Gestão de Provedores', options)
    );
});

// ===== Clique em Notificação =====
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notificação clicada:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[Service Worker] Carregado com sucesso:', CACHE_VERSION);
