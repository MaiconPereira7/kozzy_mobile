// src/services/api.ts
const BASE_URL = 'http://192.168.15.4:3000'; // <--- CONFIRMA SE O IP CONTINUA ESSE

export const api = async (endpoint: string, method: string = 'GET', body?: any) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  } catch (error: any) {
    console.error(`Erro API [${endpoint}]:`, error);
    throw error;
  }
};