import React from 'react';
import { UserProvider } from './src/contexts/UserContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppRoutes from './src/routes';

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </ThemeProvider>
  );
}
