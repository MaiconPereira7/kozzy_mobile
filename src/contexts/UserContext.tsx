// src/contexts/UserContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { User } from '../types';

const USER_STORAGE_KEY = '@kozzy:user';
const TOKEN_STORAGE_KEY = '@kozzy:token';

interface UserContextType {
  user: User;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  updateUser: (newData: Partial<User>) => Promise<void>;
  login: (userData: User, authToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultUser: User = {
  name: '',
  email: '',
  avatar: null,
  role: 'user',
};

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega dados do usuário ao iniciar o app
  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * Carrega dados do AsyncStorage
   */
  const loadUserData = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(USER_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
      ]);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Faz login e salva dados
   */
  const login = async (userData: User, authToken?: string) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      if (authToken) {
        setToken(authToken);
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  /**
   * Atualiza dados do usuário
   */
  const updateUser = async (newData: Partial<User>) => {
    try {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  /**
   * Faz logout e limpa dados
   */
  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(USER_STORAGE_KEY),
        AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
      ]);

      setUser(defaultUser);
      setToken(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user.email;

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        updateUser,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook customizado para usar o contexto
 */
export const useUser = () => {
  const context = React.useContext(UserContext);

  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }

  return context;
};
