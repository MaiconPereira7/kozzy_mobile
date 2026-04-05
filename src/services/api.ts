// src/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.15.8:3000';
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

/**
 * Função principal de requisição à API com suporte a Token
 */
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
    // Tenta recuperar o token de autenticação salvo no login
    const token = await AsyncStorage.getItem('@kozzy:token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Resposta inválida do servidor' };
    }

    if (!response.ok) {
      throw {
        message: data.message || 'Erro na requisição',
        code: response.status,
        details: data,
      } as ApiError;
    }

    return data;
  } catch (error: any) {
    // Erro de rede (Servidor desligado ou sem internet)
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      throw {
        message: 'Sem conexão com o servidor. Verifique se o server.js está rodando no PC.',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }

    // Timeout
    if (error.name === 'AbortError') {
      throw {
        message: 'Tempo de resposta excedido. Tente novamente.',
        code: 'TIMEOUT',
      } as ApiError;
    }

    throw error;
  }
};

/**
 * Funções de conveniência
 */
export const apiGet = <T = any>(endpoint: string, headers?: Record<string, string>) =>
  api<T>(endpoint, 'GET', undefined, headers);

export const apiPost = <T = any>(endpoint: string, body: any, headers?: Record<string, string>) =>
  api<T>(endpoint, 'POST', body, headers);

export const apiPut = <T = any>(endpoint: string, body: any, headers?: Record<string, string>) =>
  api<T>(endpoint, 'PUT', body, headers);

export const apiDelete = <T = any>(endpoint: string, headers?: Record<string, string>) =>
  api<T>(endpoint, 'DELETE', undefined, headers);

/**
 * Interceptor para tratar erros e exibir mensagens amigáveis no App
 */
export const handleApiError = (error: ApiError): string => {
  if (error.code === 'NETWORK_ERROR') {
    return 'Sem conexão. Verifique o servidor Kozzy.';
  }

  if (error.code === 'TIMEOUT') {
    return 'Tempo esgotado. Tente novamente.';
  }

  switch (error.code) {
    case 400:
      return 'Dados inválidos. Verifique as informações.';
    case 401:
      return 'Acesso não autorizado. Faça login novamente.';
    case 404:
      return 'Serviço não encontrado no servidor.';
    case 500:
      return 'Erro interno do servidor. Tente mais tarde.';
    default:
      return error.message || 'Ocorreu um erro desconhecido.';
  }
};