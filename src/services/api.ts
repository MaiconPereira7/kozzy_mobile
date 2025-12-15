// src/services/api.ts
const SEU_IP = '192.168.15.8'; 
const BASE_URL = `http://${SEU_IP}:3000`; // Porta do servidor (server.js)

export const api = async (endpoint: string, method: string = 'GET', body?: any) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
  } catch (error: any) {
    console.error(`Erro conexão [${BASE_URL}]:`, error);
    throw error;
  }
};