# 🌐 Gestão de Provedores - Sistema Profissional ISP

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-purple.svg)

**Sistema completo de gerenciamento para provedores de internet com PWA, autenticação JWT, monitoramento em tempo real e app mobile nativo.**

[Demo](#) • [Documentação](#-documentação) • [Instalação](#-instalação-rápida) • [Contribuir](#-contribuindo)

</div>

---

## 🎯 Visão Geral

Sistema profissional de gestão de provedores de internet (ISP) com recursos avançados:

- 📱 **Progressive Web App (PWA)** - Funciona offline e pode ser instalado
- 🔐 **Autenticação JWT** - Sistema seguro com tokens e refresh
- 📊 **Monitoramento em Tempo Real** - Integração com APIs (Mikrotik, UniFi, PRTG, Zabbix)
- 📲 **App Nativo** - Preparado para iOS e Android via Capacitor
- 🎨 **UI Moderna** - Design responsivo e profissional
- ☁️ **Cloud Ready** - Deploy automático no Netlify com Supabase

## ✨ Funcionalidades Principais

### 🔒 Autenticação & Segurança
- ✅ Login JWT com access token (1h) e refresh token (7d)
- ✅ Autenticação Google OAuth 2.0
- ✅ Autenticação Microsoft (em breve)
- ✅ Painel administrativo protegido
- ✅ Gerenciamento de permissões por role

### 📱 Progressive Web App (PWA)
- ✅ Service Worker v1.0.0 com cache inteligente
- ✅ Modo offline completo
- ✅ Background sync para sincronização automática
- ✅ Push notifications nativas
- ✅ Instalável em desktop e mobile
- ✅ Atalhos de aplicativo

### 📊 Monitoramento de Rede
- ✅ **Mikrotik RouterOS API** - Gestão completa de routers
- ✅ **Ubiquiti UniFi Controller** - Devices, sites e estatísticas
- ✅ **PRTG Network Monitor** - Sensores e monitoramento
- ✅ **Zabbix API** - Hosts, triggers e histórico
- ✅ Dashboard em tempo real
- ✅ Alertas e notificações

### 👥 Gestão de Clientes
- ✅ Cadastro completo de clientes
- ✅ Histórico de serviços
- ✅ Sistema de tickets
- ✅ Relatórios personalizados
- ✅ Exportação de dados

### 📲 Mobile Nativo (Capacitor)
- ✅ Configuração para Android e iOS
- ✅ Plugins nativos (Camera, Storage, Network)
- ✅ Build automatizado
- ✅ Deep linking

## 🚀 Versão 2.0.0 - Novidades

### 🎨 Interface Modernizada
- ✅ Novo design do formulário de login
- ✅ Indicador de força de senha em tempo real
- ✅ Checkbox customizado
- ✅ Botões com efeitos shimmer
- ✅ Modais redesenhados e centralizados
- ✅ Notificações com bordas coloridas por tipo
- ✅ Animações suaves e profissionais

### 🔧 Melhorias Técnicas
- ✅ Código refatorado e otimizado
- ✅ Sem erros de console
- ✅ Performance aprimorada
- ✅ SEO otimizado
- ✅ Acessibilidade (ARIA labels)
- ✅ 100% responsivo (320px - 4K)

## 📋 Pré-requisitos

- Node.js 16+ 
- NPM ou Yarn
- Conta Netlify (deploy)
- Conta Supabase (banco de dados)
- Git

## 🛠️ Instalação Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/cristiano-superacao/gestao_redes.git
cd gestao_redes
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Renomeie `.env.example` para `.env` e configure:

```env
# Supabase
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_publica
SUPABASE_SERVICE_KEY=sua_chave_servico

# JWT
JWT_SECRET=seu_secret_jwt_aqui
JWT_REFRESH_SECRET=seu_refresh_secret_aqui

# APIs de Monitoramento (opcional)
MIKROTIK_API_URL=
UNIFI_API_URL=
PRTG_API_URL=
ZABBIX_API_URL=
```

### 4. Inicie o Servidor Local

```bash
npm start
# ou
npx http-server -p 8080
```

Acesse: **http://localhost:8080**

## 🎨 Sistema de Autenticação

### 👤 Login de Usuário
```
Email: qualquer@email.com
Senha: qualquer (teste força de senha)
```

### 👨‍💼 Login Administrativo
```
Usuário: admin
Senha: GestaoProvedores@2025#
```

## ☁️ Deploy no Netlify

### 1. Preparação do Supabase

1. Acesse [Supabase](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Copie as credenciais em Settings > API
4. Configure as variáveis de ambiente no Netlify

### 2. Deploy Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### 3. Configuração de Variáveis

No painel do Netlify, adicione:

```
SUPABASE_URL=sua_url_aqui
SUPABASE_ANON_KEY=sua_chave_aqui
JWT_SECRET=gere_um_secret_seguro
JWT_REFRESH_SECRET=gere_outro_secret
```

## 📱 Build Mobile (Capacitor)

### Android

```bash
npm run build:android
# ou
npx cap sync android
npx cap open android
```

### iOS

```bash
npm run build:ios
# ou
npx cap sync ios
npx cap open ios
```

## 📚 Documentação Completa

- 📖 [Funcionalidades Avançadas](FUNCIONALIDADES_AVANCADAS.md)
- 🔐 [Implementação Completa](IMPLEMENTACAO_COMPLETA.md)
- 🎨 [Melhorias de Login](MELHORIAS_LOGIN.md)
- 🔧 [Configuração de APIs](docs/api-configuration.md)

## 🗂️ Estrutura do Projeto

```
gestao_redes/
├── index.html              # Página principal com login
├── dashboard.html          # Dashboard do sistema
├── admin.html             # Painel administrativo
├── manifest.json          # Configuração PWA
├── service-worker.js      # Service Worker PWA
├── capacitor.config.json  # Config mobile
│
├── css/
│   ├── main.css           # Estilos principais
│   ├── dashboard.css      # Estilos do dashboard
│   ├── admin.css          # Estilos admin
│   └── components.css     # Componentes reutilizáveis
│
├── js/
│   ├── main.js            # Lógica principal
│   ├── dashboard.js       # Lógica do dashboard
│   ├── admin.js           # Lógica admin
│   ├── jwt-auth.js        # Autenticação JWT
│   ├── monitoring-service.js  # APIs de monitoramento
│   └── demo-data.js       # Dados de demonstração
│
├── config/
│   ├── database.js        # Configuração Supabase
│   ├── firebase-config.js # Firebase (legado)
│   └── supabase-config.js # Supabase setup
│
├── netlify/
│   └── functions/
│       ├── auth.js        # Autenticação serverless
│       ├── monitoring.js  # Proxy APIs
│       └── users.js       # Gestão de usuários
│
├── assets/                # Ícones e imagens
├── docs/                  # Documentação adicional
└── tests/                 # Testes automatizados
```

## 🎯 Roadmap

### Versão 2.1 (Em Desenvolvimento)
- [ ] Autenticação de dois fatores (2FA)
- [ ] Chat em tempo real
- [ ] Integração WhatsApp Business
- [ ] App mobile publicado nas stores
- [ ] Dashboard customizável

### Versão 2.2 (Planejado)
- [ ] Módulo financeiro completo
- [ ] Integração com gateways de pagamento
- [ ] Relatórios avançados com BI
- [ ] API pública documentada
- [ ] Temas personalizáveis

## 🤝 Contribuindo

Contribuições são sempre bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Cristiano Superação**

- GitHub: [@cristiano-superacao](https://github.com/cristiano-superacao)
- LinkedIn: [Seu LinkedIn](#)

## 🙏 Agradecimentos

- [Netlify](https://netlify.com) - Hospedagem e deploy
- [Supabase](https://supabase.com) - Banco de dados
- [Font Awesome](https://fontawesome.com) - Ícones
- [Google Fonts](https://fonts.google.com) - Tipografia
- Comunidade Open Source

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

Made with ❤️ by Cristiano Superação

</div>
3. Digite a senha master: `NetBairro@Admin2024#`
4. Gerencie usuários e configurações

## 📊 Métricas e Limites
![Dashboard](https://via.placeholder.com/800x400/1e293b/f1f5f9?text=NetBairro+Manager+-+Dashboard)

## 🚀 Sobre o Projeto

O **Gestão de Provedores** é uma solução completa e moderna para provedores de internet que precisam de uma ferramenta robusta e intuitiva para:

- 👥 **Gerenciar clientes** - Cadastro, edição e monitoramento completo
- 📊 **Monitorar rede** - Análise em tempo real de performance e status
- 💰 **Controlar financeiro** - Receitas, relatórios e análise de inadimplência
- 🎯 **Dashboard inteligente** - KPIs, gráficos interativos e alertas

### ✨ Características Principais

- 🎨 **Design Moderno** - Interface clean e profissional com tema escuro
- 📱 **Totalmente Responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- ⚡ **Performance Otimizada** - Carregamento rápido e animações suaves
- ♿ **Acessível** - Seguindo padrões de acessibilidade web (WCAG)
- 🔧 **Modular** - Código organizado e reutilizável
- 🌍 **Cross-browser** - Compatível com navegadores modernos

## 📁 Estrutura do Projeto

```
netbairro-manager/
├── 📄 index.html              # Página de login e apresentação
├── 📄 dashboard.html          # Interface principal do sistema
├── 📄 documentation.html      # Documentação completa e interativa
├── 🎨 styles.css             # Estilos principais (login, componentes)
├── 🎨 dashboard.css          # Estilos específicos do dashboard
├── ⚙️ script.js              # Funcionalidades principais e autenticação
├── ⚙️ dashboard.js           # Lógica do dashboard e componentes
├── 📁 assets/
│   └── 🎨 favicon.svg        # Ícone SVG do sistema
└── 📖 README.md              # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

### Frontend Core
- **HTML5** - Estrutura semântica e moderna
- **CSS3** - Estilos avançados com Custom Properties, Grid e Flexbox
- **JavaScript ES6+** - Programação orientada a objetos e módulos

### Bibliotecas e Frameworks
- **Chart.js** - Gráficos interativos e responsivos
- **Font Awesome** - Ícones vetoriais de alta qualidade
- **Google Fonts (Inter)** - Tipografia moderna e legível

### Design System
- **CSS Custom Properties** - Variáveis para consistência visual
- **Responsive Design** - Mobile-first approach
- **Dark Theme** - Interface profissional e moderna
- **Animations** - Transições suaves e feedback visual

### Padrões de Desenvolvimento
- **Module Pattern** - Organização modular do código
- **Observer Pattern** - Comunicação entre componentes
- **Progressive Enhancement** - Funcionalidade crescente
- **Vanilla JavaScript** - Sem dependências pesadas

## 🚀 Instalação e Execução

### Pré-requisitos
- Navegador moderno (Chrome 80+, Firefox 75+, Safari 13+)
- Servidor web local (Python, Node.js, PHP, etc.)

### Instalação

1. **Clone ou baixe o projeto**
   ```bash
   git clone https://github.com/seu-usuario/netbairro-manager.git
   cd netbairro-manager
   ```

2. **Inicie um servidor web local**

   **Python (recomendado):**
   ```bash
   python -m http.server 8000
   ```

   **Node.js:**
   ```bash
   npx serve -s . -l 8000
   ```

   **PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Acesse no navegador**
   ```
   http://localhost:8000
   ```

### 🔑 Credenciais de Teste

- **Email:** `admin@netbairro.com`
- **Senha:** `123456`

## 📖 Como Usar

### 1. **Página de Login**
- Interface moderna com validação em tempo real
- Suporte a login tradicional e integração com Manus
- Formulário responsivo com feedback visual

### 2. **Dashboard Principal**
- **KPIs em tempo real** - Clientes ativos, receita, uptime, chamados
- **Gráficos interativos** - Uso de banda e status da rede
- **Atividades recentes** - Log de eventos importantes
- **Navegação intuitiva** - Sidebar colapsável e responsiva

### 3. **Gestão de Clientes**
- Tabela com pesquisa e filtros avançados
- Status visual dos clientes (ativo, inativo, suspenso)
- Ações rápidas (editar, visualizar, suspender)

### 4. **Monitoramento de Rede**
- Status em tempo real dos equipamentos
- Análise de tráfego e performance
- Alertas automáticos para problemas

## 🎨 Design System

### Paleta de Cores
```css
/* Cores Principais */
--primary: #2563eb        /* Azul principal */
--primary-dark: #1e40af   /* Azul escuro */
--primary-light: #3b82f6  /* Azul claro */
--secondary: #8b5cf6      /* Roxo */
--accent: #06b6d4         /* Ciano */

/* Backgrounds */
--bg-primary: #0f172a     /* Fundo principal */
--bg-secondary: #1e293b   /* Fundo secundário */
--bg-card: #1e293b        /* Cards e modais */

/* Textos */
--text-primary: #f1f5f9   /* Texto principal */
--text-secondary: #cbd5e1 /* Texto secundário */
--text-muted: #94a3b8     /* Texto desfocado */
```

### Tipografia
- **Font Principal:** Inter (Google Fonts)
- **Font Mono:** JetBrains Mono (para código)
- **Escalas:** Sistema modular com proporções harmoniosas

### Espaçamentos
```css
--spacing-xs: 0.5rem   /* 8px */
--spacing-sm: 1rem     /* 16px */
--spacing-md: 1.5rem   /* 24px */
--spacing-lg: 2rem     /* 32px */
--spacing-xl: 3rem     /* 48px */
```

## 📱 Responsividade

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Adaptações
- **Mobile:** Sidebar colapsável, navegação otimizada
- **Tablet:** Layout híbrido com componentes adaptados
- **Desktop:** Experiência completa com todos os recursos

## 🔧 Personalização

### Temas
O sistema suporta personalização através de CSS Custom Properties:

```css
:root {
  --primary: #seu-azul;
  --bg-primary: #seu-fundo;
  /* ... outras variáveis */
}
```

### Componentes
Todos os componentes são modulares e podem ser facilmente personalizados:

```javascript
// Exemplo: Personalizar toast notifications
window.toastManager.show('Mensagem personalizada', 'success');
```

## 📊 Funcionalidades Implementadas

### ✅ Concluídas
- [x] Sistema de autenticação simulado
- [x] Dashboard com KPIs e gráficos
- [x] Interface de gestão de clientes
- [x] Design responsivo completo
- [x] Navegação dinâmica
- [x] Sistema de notificações
- [x] Documentação interativa
- [x] Animações e transições
- [x] Temas escuros profissionais

### 🚧 Em Desenvolvimento
- [ ] Integração com APIs reais
- [ ] Sistema de autenticação JWT
- [ ] Notificações push
- [ ] Exportação de relatórios
- [ ] Modo offline (PWA)

### 📋 Roadmap Futuro
- [ ] Testes automatizados (Jest/Cypress)
- [ ] Internacionalização (i18n)
- [ ] Tema claro alternativo
- [ ] Aplicativo mobile nativo
- [ ] Integração com ferramentas de monitoramento

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Siga estes passos:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### 📝 Padrões de Código
- **JavaScript:** ES6+, camelCase, comentários JSDoc
- **CSS:** BEM methodology, mobile-first
- **HTML:** Semântico e acessível
- **Commits:** Conventional Commits

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato e Suporte

- **Documentação:** [documentation.html](./documentation.html)
- **Issues:** [GitHub Issues](https://github.com/seu-usuario/netbairro-manager/issues)
- **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/netbairro-manager/discussions)

---

## 🎯 Demonstração Online

🌐 **[Ver Demonstração](https://netbairro-manager-demo.vercel.app)**

---

<div align="center">

**Desenvolvido com ❤️ para a comunidade ISP brasileira**

⭐ Se este projeto te ajudou, considere dar uma estrela!

</div>

---

### 📈 Status do Projeto

![Status](https://img.shields.io/badge/Status-Concluído-brightgreen?style=for-the-badge)
![Versão](https://img.shields.io/badge/Versão-1.0.0-blue?style=for-the-badge)
![Licença](https://img.shields.io/badge/Licença-MIT-yellow?style=for-the-badge)
![Responsivo](https://img.shields.io/badge/Mobile-Friendly-orange?style=for-the-badge)

### 🏆 Principais Conquistas

- ✨ **Interface Moderna** - Design profissional e atrativo
- 📱 **100% Responsivo** - Funciona em todos os dispositivos
- ⚡ **Performance Otimizada** - Carregamento rápido
- ♿ **Acessível** - Seguindo padrões WCAG
- 📚 **Documentação Completa** - Guias e exemplos detalhados
- 🎨 **Design System** - Componentes reutilizáveis e consistentes

---

*Este projeto representa uma implementação completa de um sistema de gestão ISP, demonstrando boas práticas de desenvolvimento frontend moderno.*