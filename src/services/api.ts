// src/services/api.ts

// ⚠️ Use o IP que aparece no QR Code do seu Expo (ex: 192.168.15.4)
const BASE_URL = 'http://192.168.15.4:3000'; 

export const api = async (endpoint: string, method: string = 'GET', body?: any) => {
  try { // <--- A LINHA QUE FALTOU NO SEU CÓDIGO
    const headers = {
      'Content-Type': 'application/json',
    };

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
  } catch (error: any) { // Agora este catch vai funcionar
    console.error(`Erro API [${endpoint}]:`, error);
    throw error;
  }
};