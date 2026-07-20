import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { STORAGE_KEYS } from '../constants/storage';

interface BackendUser {
  _id?: string;
  id?: string;
  nomeCompleto: string;
  email: string;
  perfilAcesso: string;
  fotoPerfil?: string;
}

interface BackendLoginResponse {
  token: string;
  usuario: BackendUser;
}

export type AppRole = 'user' | 'supervisor' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar: string | null;
  token: string;
}

const mapRole = (perfil: string): AppRole => {
  if (perfil === 'supervisor' || perfil === 'gerente') return 'supervisor';
  if (perfil === 'atendente') return 'admin';
  return 'user';
};

const formatUser = (usuario: BackendUser, token: string): AppUser => ({
  id: usuario._id ?? usuario.id ?? '',
  name: usuario.nomeCompleto,
  email: usuario.email,
  role: mapRole(usuario.perfilAcesso),
  avatar: usuario.fotoPerfil ?? null,
  token,
});

export const authService = {
  login: async (email: string, senha: string): Promise<AppUser> => {
    const data = await api<BackendLoginResponse>('/usuarios/login', 'POST', { email, senha });
    const user = formatUser(data.usuario, data.token);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, data.token],
      [STORAGE_KEYS.USER, JSON.stringify(user)],
    ]);
    return user;
  },

  register: async (nomeCompleto: string, email: string, senha: string): Promise<AppUser> => {
    await api('/usuarios/register', 'POST', { nomeCompleto, email, senha, perfilAcesso: 'cliente' });
    return authService.login(email, senha);
  },
};
