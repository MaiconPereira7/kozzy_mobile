# Kozzy Mobile

> Sistema de atendimento inteligente para a Kozzy Alimentos

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)

## Sobre

App React Native para atendimento ao cliente da Kozzy Alimentos. Clientes interagem com um **chatbot IA** que guia a abertura de chamados de forma conversacional. Quando necessário, o cliente pode ser transferido para um **atendente humano via chat ao vivo** em tempo real (Socket.io). Supervisores têm acesso a um painel dedicado com dashboard operacional atualizado em tempo real.

## Features

- Chatbot IA — multi-modelo com fallback automático (Gemini primário + OpenRouter)
- Tickets com protocolo — criados automaticamente pela IA após coleta de informações
- Chat ao Vivo — handoff bot→humano via Socket.io com polling de fallback a cada 10s
- Painel Supervisor — dashboard com métricas e lista em tempo real via Socket.io
- Autenticação real — login/cadastro com contas do backend MongoDB
- Dark/Light mode — sistema ou manual, persistido por usuário
- Notificações — tickets novos e respostas do suporte
- Rate limiting — 5 mensagens/minuto no chat
- Offline gracioso — app funciona em modo bot se o backend real estiver fora

## Arquitetura

```
┌──────────────────────────┐
│   App Mobile (Expo)      │
│   React Native + TS      │
└──────────┬───────────────┘
           │
     ┌─────┴──────────────────────────┐
     │                                │
     ▼                                ▼
┌─────────────────────┐    ┌──────────────────────┐
│  kozzy-backend      │    │  server/ (IA local)  │
│  (Render/produção)  │    │  Express :3001       │
│                     │    │                      │
│  POST /usuarios/    │    │  POST /chat          │
│    login|register   │    │  GET  /health        │
│  GET/POST/PUT       │    │                      │
│    /atendimentos    │    │  Gemini 2.0 Flash    │
│  Socket.io          │    │  OpenRouter (fallback│
│  MongoDB Atlas      │    └──────────────────────┘
└─────────────────────┘
           │
     ┌─────┴────────────────┐
     │  kozzy-frontend      │
     │  (painel web)        │
     └──────────────────────┘
```

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| App | React Native 0.81 + Expo SDK 54 |
| Linguagem | TypeScript (strict) |
| Navegação | React Navigation v7 (Stack + Drawer) |
| Estado | Context API (UserContext, ThemeContext) |
| Tempo real | socket.io-client |
| Backend | kozzy-backend (Render) |
| IA | Gemini API + OpenRouter (servidor local) |
| Persistência | AsyncStorage (app) · MongoDB Atlas (backend) |

## Estrutura do Projeto

```
kozzy_mobile/
├── src/
│   ├── components/
│   │   ├── chat/           # MessageBubble, ChatInput, ChatHeader, QuickActions, SuggestionChips
│   │   └── common/
│   ├── contexts/           # UserContext (+ socket), ThemeContext
│   ├── hooks/              # useServerStatus
│   ├── routes/             # AppDrawer, index (Stack Navigator)
│   ├── screens/            # Login, Register, Chat (bot+live), MeusTickets, AbrirTicket, Profile, ...
│   ├── services/
│   │   ├── api.ts          # fetch wrapper — _baseUrl (backend) + _aiUrl (IA)
│   │   ├── authService.ts  # login/register com kozzy-backend
│   │   ├── socketService.ts# singleton Socket.io
│   │   └── ticketService.ts# CRUD /atendimentos com field mapping
│   ├── theme/
│   └── types/
├── server/                 # Servidor de IA local (porta 3001)
│   ├── index.js            # POST /chat, GET /health
│   ├── package.json
│   ├── .env                # chaves de API (não commitado)
│   └── .env.example
├── .env                    # EXPO_PUBLIC_* (não commitado)
└── .env.example
```

## Como Rodar

### Pré-requisitos

- Node.js 18+
- Expo Go no celular (ou emulador)
- Chaves de [Google AI Studio](https://aistudio.google.com) e/ou [OpenRouter](https://openrouter.ai)

### 1. Clone e instale

```bash
git clone https://github.com/MaiconPereira7/kozzy_mobile.git
cd kozzy_mobile
npm install
cd server && npm install && cd ..
```

### 2. Configure as variáveis de ambiente

**Root `.env`** (app mobile):
```
EXPO_PUBLIC_API_URL=https://kozzy-backend.onrender.com/api
EXPO_PUBLIC_AI_SERVER_URL=http://SEU_IP_LOCAL:3001
```

**`server/.env`** (servidor de IA):
```
GEMINI_API_KEY=sua_chave_aqui
OPENROUTER_API_KEY=sua_chave_aqui
PORT=3001
```

> Para descobrir seu IP local: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)

### 3. Inicie o servidor de IA

```bash
npm run server
# ou: cd server && npm start
```

### 4. Inicie o app

```bash
npx expo start
```

Escaneie o QR code com o Expo Go.

### 5. Configure o IP no app (se necessário)

Em **Perfil → Servidor de IA**, coloque `http://SEU_IP:3001` e salve.

## Fluxo do Chat ao Vivo

1. Cliente toca em **"Falar com Consultor"**
2. App cria um atendimento no backend (`POST /api/atendimentos`)
3. Header muda para verde com indicador pulsante
4. Supervisor recebe notificação via Socket.io no painel web
5. Mensagens trafegam via `POST /api/atendimentos/:id/comentarios`
6. Respostas chegam por Socket.io (`chamado:atualizado`) + polling a cada 10s como fallback
7. Ao encerrar: `avanco → 'encerrado'`, app volta para o bot

## Autor

**Maicon Pereira** — [github.com/MaiconPereira7](https://github.com/MaiconPereira7)
