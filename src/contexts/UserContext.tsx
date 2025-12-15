// src/contexts/UserContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

interface UserData {
  name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'supervisor'; // <--- ADICIONADO: Nível de acesso
}

interface UserContextType {
  user: UserData;
  updateUser: (newData: UserData) => void;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData>({
    name: '',
    email: '',
    avatar: null,
    role: 'user', // Padrão é usuário comum
  });

  const updateUser = (newData: UserData) => {
    setUser(newData);
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};