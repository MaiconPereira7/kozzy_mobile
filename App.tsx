import React from 'react';
import { UserProvider } from './src/contexts/UserContext';
import AppRoutes from './src/routes';

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}