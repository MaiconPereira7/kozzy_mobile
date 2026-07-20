import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { STORAGE_KEYS } from '../constants/storage';
import { socketService } from '../services/socketService';
import { getBackendUrl } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'user' | 'supervisor' | 'admin';
  token?: string;
}

interface UserContextData {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const UserContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          const parsed: User = JSON.parse(storedUser);
          setUser(parsed);
          if (parsed.token) {
            socketService.connect(getBackendUrl(), parsed.token);
            if (parsed.id) socketService.joinUserRoom(parsed.id);
          }
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (userData: User) => {
    try {
      setUser(userData);
      const saves: [string, string][] = [[STORAGE_KEYS.USER, JSON.stringify(userData)]];
      if (userData.token) saves.push([STORAGE_KEYS.TOKEN, userData.token]);
      await AsyncStorage.multiSet(saves);

      if (userData.token) {
        socketService.connect(getBackendUrl(), userData.token);
        if (userData.id) socketService.joinUserRoom(userData.id);
      }
    } catch (error) {
      console.error('Erro ao salvar dados de login:', error);
    }
  };

  const logout = async () => {
    try {
      socketService.disconnect();
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.CHAT_HISTORY,
      ]);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...userData };
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#E01E26" />
      </View>
    );
  }

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser deve ser usado dentro de um UserProvider');
  return context;
};
