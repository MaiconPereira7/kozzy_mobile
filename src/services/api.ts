import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

const DEFAULT_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.15.5:3000';
const TIMEOUT_MS = 45_000;

let _baseUrl = DEFAULT_URL;

/** Lê a URL salva pelo usuário e usa como base. Chamar no App.tsx. */
export const initServerUrl = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL);
  if (stored) _baseUrl = stored;
};

/** Salva nova URL e passa a usá-la imediatamente. */
export const setServerUrl = async (url: string) => {
  _baseUrl = url.replace(/\/+$/, ''); // remove trailing slash
  await AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, _baseUrl);
};

export const getServerUrl = () => _baseUrl;

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

export const api = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): Promise<T> => {
  const url = `${_baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

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
      throw {
        message: data.message || data.error || `Erro ${response.status}`,
        code: response.status,
        details: data,
      } as ApiError;
    }
    return data;
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw { message: 'Tempo de resposta excedido (45s). Verifique a conexão.', code: 'TIMEOUT' } as ApiError;
    }
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      throw { message: 'Sem conexão com o servidor. Verifique se o server.js está rodando.', code: 'NETWORK_ERROR' } as ApiError;
    }
    throw error;
  }
};

export const apiGet    = <T = any>(e: string, h?: Record<string, string>) => api<T>(e, 'GET', undefined, h);
export const apiPost   = <T = any>(e: string, b: any, h?: Record<string, string>) => api<T>(e, 'POST', b, h);
export const apiPut    = <T = any>(e: string, b: any, h?: Record<string, string>) => api<T>(e, 'PUT', b, h);
export const apiPatch  = <T = any>(e: string, b: any, h?: Record<string, string>) => api<T>(e, 'PATCH', b, h);
export const apiDelete = <T = any>(e: string, h?: Record<string, string>) => api<T>(e, 'DELETE', undefined, h);

interface AuthResponse {
  success: boolean;
  user: { id: string; name: string; email: string; role: 'user' | 'supervisor' | 'admin' };
  token: string;
}

export const apiLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const data = await apiPost<AuthResponse>('/auth/login', { email, password });
  if (data.token) await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
  return data;
};

export const apiRegister = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const data = await apiPost<AuthResponse>('/auth/register', { name, email, password });
  if (data.token) await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
  return data;
};

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
