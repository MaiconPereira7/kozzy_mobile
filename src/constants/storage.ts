// src/constants/storage.ts
// Chave única para todo o app — evita inconsistências de maiúsculas/minúsculas
export const STORAGE_KEYS = {
  TOKEN:         '@Kozzy:token',
  USER:          '@Kozzy:user',
  THEME:         '@Kozzy:theme',
  CHAT_HISTORY:  '@Kozzy:chatHistory',
  SERVER_URL:    '@Kozzy:serverUrl',
  AI_SERVER_URL: '@Kozzy:aiServerUrl',
} as const;