// src/services/api.ts

const BASE_URL = 'http://SEU_IP_AQUI:3000'; // Troque pelo IP do seu servidor

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
 * Função principal de requisição à API
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

  // Recupera token se existir (adicione AsyncStorage se necessário)
  // const token = await AsyncStorage.getItem('@kozzy:token');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      // Resposta não é JSON
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
    // Erro de rede
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      throw {
        message:
          'Sem conexão com o servidor. Verifique sua internet e se o servidor está rodando.',
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

    // Re-throw se já for ApiError
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
 * Interceptor para tratar erros comuns
 */
export const handleApiError = (error: ApiError): string => {
  // Erros de rede
  if (error.code === 'NETWORK_ERROR') {
    return 'Sem conexão. Verifique sua internet.';
  }

  if (error.code === 'TIMEOUT') {
    return 'Tempo esgotado. Tente novamente.';
  }

  // Erros HTTP
  switch (error.code) {
    case 400:
      return 'Dados inválidos. Verifique as informações.';
    case 401:
      return 'Não autorizado. Faça login novamente.';
    case 403:
      return 'Acesso negado.';
    case 404:
      return 'Recurso não encontrado.';
    case 500:
      return 'Erro no servidor. Tente mais tarde.';
    default:
      return error.message || 'Erro desconhecido';
  }
};

/**
 * Exemplo de uso com tratamento de erro:
 * 
 * try {
 *   const response = await apiPost('/login', { email, password });
 *   console.log(response);
 * } catch (error) {
 *   const message = handleApiError(error as ApiError);
 *   Alert.alert('Erro', message);
 * }
 */
