import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

const DEFAULT_BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://kozzy-backend.onrender.com/api';
const DEFAULT_AI_URL      = process.env.EXPO_PUBLIC_AI_SERVER_URL ?? 'http://192.168.15.5:3001';
const TIMEOUT_MS = 45_000;

let _baseUrl = DEFAULT_BACKEND_URL;
let _aiUrl   = DEFAULT_AI_URL;

/** Carrega URL do servidor de IA salva pelo usuário. Chamar no App.tsx. */
export const initServerUrl = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.AI_SERVER_URL);
  if (stored) _aiUrl = stored;
};

/** Salva nova URL do servidor de IA e passa a usá-la imediatamente. */
export const setServerUrl = async (url: string) => {
  _aiUrl = url.replace(/\/+$/, '');
  await AsyncStorage.setItem(STORAGE_KEYS.AI_SERVER_URL, _aiUrl);
};

export const getServerUrl    = () => _aiUrl;
export const getAIServerUrl  = () => _aiUrl;
export const getBackendUrl   = () => _baseUrl;

export interface ApiError {
  message: string;
  code?: number | string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

const buildRequest = async (
  baseUrl: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
) => {
  const url = `${baseUrl}${endpoint}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...customHeaders };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    let data: any;
    try { data = await response.json(); }
    catch { data = { message: 'Resposta inválida do servidor' }; }

    if (!response.ok) {
      throw { message: data.message || data.error || `Erro ${response.status}`, code: response.status, details: data } as ApiError;
    }
    return data;
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw { message: 'Tempo de resposta excedido (45s). Verifique a conexão.', code: 'TIMEOUT' } as ApiError;
    }
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      throw { message: 'Sem conexão com o servidor.', code: 'NETWORK_ERROR' } as ApiError;
    }
    throw error;
  }
};

/** Chamadas ao backend real (kozzy-backend.onrender.com) */
export const api = <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): Promise<T> => buildRequest(_baseUrl, endpoint, method, body, customHeaders);

/** Chamadas ao servidor de IA local (port 3001) */
export const aiApi = <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): Promise<T> => buildRequest(_aiUrl, endpoint, method, body, customHeaders);

export const apiGet    = <T = any>(e: string, h?: Record<string, string>) => api<T>(e, 'GET', undefined, h);
export const apiPost   = <T = any>(e: string, b: any, h?: Record<string, string>) => api<T>(e, 'POST', b, h);
export const apiPut    = <T = any>(e: string, b: any, h?: Record<string, string>) => api<T>(e, 'PUT', b, h);
export const apiPatch  = <T = any>(e: string, b: any, h?: Record<string, string>) => api<T>(e, 'PATCH', b, h);
export const apiDelete = <T = any>(e: string, h?: Record<string, string>) => api<T>(e, 'DELETE', undefined, h);

export const aiApiGet  = <T = any>(e: string, h?: Record<string, string>) => aiApi<T>(e, 'GET', undefined, h);
export const aiApiPost = <T = any>(e: string, b: any, h?: Record<string, string>) => aiApi<T>(e, 'POST', b, h);

export const handleApiError = (error: ApiError): string => {
  const map: Record<string | number, string> = {
    NETWORK_ERROR: 'Sem conexão. Verifique o servidor Kozzy.',
    TIMEOUT:       'Tempo esgotado. Tente novamente.',
    400: 'Dados inválidos.',
    401: 'Faça login novamente.',
    404: 'Serviço não encontrado.',
    500: 'Erro interno do servidor.',
  };
  return map[error.code ?? ''] ?? error.message ?? 'Erro desconhecido.';
};
