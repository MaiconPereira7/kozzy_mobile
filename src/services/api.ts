// src/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

// Configure seu IP aqui — apenas em um lugar
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.15.7:3000';

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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  try {
    // Usa a chave correta centralizada em STORAGE_KEYS
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = { message: 'Resposta inválida do servidor' };
    }

    if (!response.ok) {
      throw {
        message: data.message || data.error || `Erro ${response.status}`,
        code: response.status,
        details: data,
      } as ApiError;
    }

    return data;
  } catch (error: any) {
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      throw {
        message: 'Sem conexão com o servidor. Verifique se o server.js está rodando no PC.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
    if (error.name === 'AbortError') {
      throw {
        message: 'Tempo de resposta excedido. Tente novamente.',
        code: 'TIMEOUT',
      } as ApiError;
    }
    throw error;
  }
};

export const apiGet    = <T = any>(e: string, h?: Record<string, string>) => api<T>(e, 'GET', undefined, h);
export const apiPost   = <T = any>(e: string, b: any, h?: Record<string, string>) => api<T>(e, 'POST', b, h);
export const apiPut    = <T = any>(e: string, b: any, h?: Record<string, string>) => api<T>(e, 'PUT', b, h);
export const apiDelete = <T = any>(e: string, h?: Record<string, string>) => api<T>(e, 'DELETE', undefined, h);

export const handleApiError = (error: ApiError): string => {
  const map: Record<string | number, string> = {
    NETWORK_ERROR: 'Sem conexão. Verifique o servidor Kozzy.',
    TIMEOUT:       'Tempo esgotado. Tente novamente.',
    400: 'Dados inválidos. Verifique as informações.',
    401: 'Acesso não autorizado. Faça login novamente.',
    404: 'Serviço não encontrado no servidor.',
    500: 'Erro interno do servidor. Tente mais tarde.',
  };
  return map[error.code ?? ''] ?? error.message ?? 'Ocorreu um erro desconhecido.';
};