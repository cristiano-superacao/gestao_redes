// ===== Serviço de Integração com APIs de Monitoramento =====
// Gestão de Provedores - Monitoring APIs Integration

class MonitoringService {
    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.providers = {
            mikrotik: {
                name: 'Mikrotik RouterOS',
                enabled: false,
                config: {}
            },
            ubiquiti: {
                name: 'Ubiquiti UniFi',
                enabled: false,
                config: {}
            },
            prtg: {
                name: 'PRTG Network Monitor',
                enabled: false,
                config: {}
            },
            zabbix: {
                name: 'Zabbix',
                enabled: false,
                config: {}
            },
            cacti: {
                name: 'Cacti',
                enabled: false,
                config: {}
            }
        };
    }

    getApiBaseUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8888/.netlify/functions';
        }
        return '/.netlify/functions';
    }

    // ===== Mikrotik RouterOS API =====
    async mikrotikConnect(config) {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'mikrotik',
                        action: 'connect',
                        config
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao conectar com Mikrotik');
            }

            const data = await response.json();
            this.providers.mikrotik.enabled = true;
            this.providers.mikrotik.config = config;
            
            return data;
        } catch (error) {
            console.error('Erro ao conectar Mikrotik:', error);
            throw error;
        }
    }

    async mikrotikGetDevices() {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'mikrotik',
                        action: 'get-devices'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar dispositivos Mikrotik');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar dispositivos Mikrotik:', error);
            throw error;
        }
    }

    async mikrotikGetInterfaces(deviceId) {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'mikrotik',
                        action: 'get-interfaces',
                        deviceId
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar interfaces');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar interfaces:', error);
            throw error;
        }
    }

    async mikrotikGetBandwidth(deviceId, interfaceId) {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'mikrotik',
                        action: 'get-bandwidth',
                        deviceId,
                        interfaceId
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar largura de banda');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar bandwidth:', error);
            throw error;
        }
    }

    // ===== Ubiquiti UniFi API =====
    async ubiquitiConnect(config) {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'ubiquiti',
                        action: 'connect',
                        config
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao conectar com UniFi');
            }

            const data = await response.json();
            this.providers.ubiquiti.enabled = true;
            this.providers.ubiquiti.config = config;
            
            return data;
        } catch (error) {
            console.error('Erro ao conectar UniFi:', error);
            throw error;
        }
    }

    async ubiquitiGetDevices() {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'ubiquiti',
                        action: 'get-devices'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar dispositivos UniFi');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar dispositivos UniFi:', error);
            throw error;
        }
    }

    async ubiquitiGetClients() {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'ubiquiti',
                        action: 'get-clients'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar clientes UniFi');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar clientes UniFi:', error);
            throw error;
        }
    }

    // ===== PRTG Network Monitor API =====
    async prtgConnect(config) {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'prtg',
                        action: 'connect',
                        config
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao conectar com PRTG');
            }

            const data = await response.json();
            this.providers.prtg.enabled = true;
            this.providers.prtg.config = config;
            
            return data;
        } catch (error) {
            console.error('Erro ao conectar PRTG:', error);
            throw error;
        }
    }

    async prtgGetSensors() {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'prtg',
                        action: 'get-sensors'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar sensores PRTG');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar sensores PRTG:', error);
            throw error;
        }
    }

    async prtgGetAlarms() {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'prtg',
                        action: 'get-alarms'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar alarmes PRTG');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar alarmes PRTG:', error);
            throw error;
        }
    }

    // ===== Zabbix API =====
    async zabbixConnect(config) {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'zabbix',
                        action: 'connect',
                        config
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao conectar com Zabbix');
            }

            const data = await response.json();
            this.providers.zabbix.enabled = true;
            this.providers.zabbix.config = config;
            
            return data;
        } catch (error) {
            console.error('Erro ao conectar Zabbix:', error);
            throw error;
        }
    }

    async zabbixGetHosts() {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'zabbix',
                        action: 'get-hosts'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar hosts Zabbix');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar hosts Zabbix:', error);
            throw error;
        }
    }

    async zabbixGetTriggers() {
        try {
            const response = await window.JWTAuth.authenticatedFetch(
                `${this.apiBaseUrl}/monitoring`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        provider: 'zabbix',
                        action: 'get-triggers'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Falha ao buscar triggers Zabbix');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar triggers Zabbix:', error);
            throw error;
        }
    }

    // ===== Status Geral =====
    async getNetworkStatus() {
        try {
            const promises = [];
            
            if (this.providers.mikrotik.enabled) {
                promises.push(this.mikrotikGetDevices());
            }
            
            if (this.providers.ubiquiti.enabled) {
                promises.push(this.ubiquitiGetDevices());
            }
            
            if (this.providers.prtg.enabled) {
                promises.push(this.prtgGetSensors());
            }
            
            if (this.providers.zabbix.enabled) {
                promises.push(this.zabbixGetHosts());
            }

            const results = await Promise.allSettled(promises);
            
            return {
                mikrotik: results[0]?.value || null,
                ubiquiti: results[1]?.value || null,
                prtg: results[2]?.value || null,
                zabbix: results[3]?.value || null
            };
        } catch (error) {
            console.error('Erro ao buscar status da rede:', error);
            throw error;
        }
    }

    // ===== Configuração =====
    saveConfiguration() {
        localStorage.setItem('monitoring_providers', JSON.stringify(this.providers));
    }

    loadConfiguration() {
        const saved = localStorage.getItem('monitoring_providers');
        if (saved) {
            this.providers = JSON.parse(saved);
        }
    }

    getProviders() {
        return this.providers;
    }

    isProviderEnabled(providerName) {
        return this.providers[providerName]?.enabled || false;
    }
}

// Exportar instância única
const monitoringService = new MonitoringService();

// Expor globalmente
if (typeof window !== 'undefined') {
    window.MonitoringService = monitoringService;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonitoringService;
}
