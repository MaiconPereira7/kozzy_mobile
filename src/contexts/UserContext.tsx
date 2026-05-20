import AsyncStorage from '@react-native-async-storage/async-storage';
// CORREÇÃO AQUI: Adicionado o "React" na importação
import { createContext, ReactNode, useContext, useState } from 'react';

// Define a estrutura do usuário
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'supervisor';
}

// Define o que o contexto vai oferecer para as telas
interface UserContextData {
  user: User | null;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Função de Login (Simulada para aceitar o Mock)
  const login = async (userData: User, token: string) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('@Kozzy:token', token);
      await AsyncStorage.setItem('@Kozzy:user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar dados de login:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      // Removido o .clear() perigoso e alterado para remover apenas os dados do usuário
      await AsyncStorage.removeItem('@Kozzy:token');
      await AsyncStorage.removeItem('@Kozzy:user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar o contexto facilmente
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};