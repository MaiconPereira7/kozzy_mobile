import React, { createContext, useState, ReactNode } from 'react';

interface UserData {
  name: string;
  email: string;
  avatar: string | null;
}

interface UserContextType {
  user: UserData;
  updateUser: (newData: UserData) => void;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData>({
    name: 'Kozzy Admin',
    email: 'admin@kozzy.com.br',
    avatar: null,
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