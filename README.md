# 🍔 Kozzy Mobile

> Sistema de atendimento inteligente para a Kozzy Alimentos

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)

## Sobre

App React Native para atendimento ao cliente da Kozzy Alimentos. Os clientes interagem com um **chatbot IA** que guia a abertura de chamados de suporte de forma conversacional, sem precisar preencher formulários manualmente. Supervisores têm acesso a um painel dedicado com dashboard operacional.

## Features

- 🤖 **Chatbot IA** — multi-modelo com fallback automático (Gemini primário + OpenRouter)
- 🎫 **Tickets com protocolo** — criados automaticamente pela IA após coleta de informações
- 📊 **Painel Supervisor** — dashboard com métricas, prioridades e últimos chamados
- 🔐 **Autenticação JWT** — login/cadastro com bcrypt, token persistido
- 🌙 **Dark/Light mode** — sistema ou manual, persistido por usuário
- 🔔 **Notificações** — tickets novos e respostas do suporte
- 🏎️ **Rate limiting** — 5 mensagens/minuto no chat
- 📱 **Offline banner** — detecta servidor offline automaticamente

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| App | React Native 0.81 + Expo SDK 54 |
| Linguagem | TypeScript (strict) |
| Navegação | React Navigation v7 (Stack + Drawer) |
| Estado | Context API (UserContext, ThemeContext) |
| Backend | Express.js 5 |
| IA | OpenRouter API + Gemini API |
| Auth | JWT + bcrypt |
| Persistência | AsyncStorage (app) · In-memory (server) |

## Estrutura do Projeto

```
kozzy_mobile/
├── src/
│   ├── components/
│   │   ├── chat/           # MessageBubble, ChatInput, ChatHeader, QuickActions, SuggestionChips
│   │   └── common/         # Button, Input, Badge
│   ├── contexts/           # UserContext, ThemeContext
│   ├── hooks/              # useServerStatus
│   ├── routes/             # AppDrawer, index (Stack Navigator)
│   ├── screens/            # Login, Register, Chat, MeusTickets, AbrirTicket, Profile, ...
│   ├── services/           # api.ts, ticketService.ts, notificationService.ts
│   ├── theme/              # colors, spacing, typography
│   └── types/              # Ticket, ChatMessage, navigation, ...
├── server/
│   ├── middleware/
│   │   └── auth.js         # requireAuth, optionalAuth, generateToken
│   ├── routes/
│   │   └── auth.js         # POST /auth/login, POST /auth/register, GET /auth/me
│   ├── index.js            # Express app: /chat, /tickets, /health + auth
│   ├── package.json
│   └── .env.example
├── .env                    # EXPO_PUBLIC_API_URL
└── .env.example
```

## Como Rodar

### Pré-requisitos

- Node.js 18+
- Expo Go no celular (ou emulador)
- Chave da API [OpenRouter](https://openrouter.ai) (gratuita) e/ou [Google AI Studio](https://aistudio.google.com)

### 1. Clone o repositório

```bash
git clone https://github.com/MaiconPereira7/kozzy_mobile.git
cd kozzy_mobile
```

### 2. Instale as dependências do app

```bash
npm install
```

### 3. Instale as dependências do servidor

```bash
cd server && npm install && cd ..
```

### 4. Configure o servidor

```bash
cp server/.env.example server/.env
# Edite server/.env e adicione suas chaves de API
```

### 5. Configure o app

```bash
cp .env.example .env
# Edite .env e coloque o IP do seu computador na rede local
# Exemplo: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

> **Dica:** Para descobrir o IP do seu PC, rode `ipconfig` (Windows) ou `ifconfig` (Mac/Linux).

### 6. Inicie o servidor

```bash
cd server && npm start
```

### 7. Inicie o app

```bash
npx expo start
```

Escaneie o QR code com o Expo Go (Android) ou a câmera (iOS).

## Contas de Teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Supervisor | supervisor@kozzy.com | 123456 |
| Cliente | cliente@kozzy.com | 123456 |

## Arquitetura

```
[Expo App]
    │
    ├── src/services/api.ts  ←── AbortController 45s timeout
    │
    ▼
[Express Server :3000]
    │
    ├── POST /auth/login|register  ←── bcrypt + JWT
    ├── POST /chat  ←── recebe histórico das últimas 10 mensagens
    │       │
    │       ├── Gemini 2.0 Flash (primário)
    │       └── OpenRouter free models (fallback com blacklist 10min)
    │
    └── GET|POST|PATCH /tickets  ←── MongoDB Atlas (opcional)
```

O chatbot segue um fluxo de 4 passos para coletar assunto, categoria e descrição antes de emitir o marcador `KOZZY_TICKET:{}`, que o servidor valida e o app transforma em ticket com protocolo.

## Autor

**Maicon Pereira** — [github.com/MaiconPereira7](https://github.com/MaiconPereira7)
