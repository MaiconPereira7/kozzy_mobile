// src/routes/index.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useUser } from '../contexts/UserContext';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type { RootStackParamList } from '../types/navigation';
import { AppDrawer } from './AppDrawer';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppRoutes = () => {
  const { user } = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator
        // Redireciona automaticamente baseado no estado de login
        initialRouteName={user ? 'App' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="App" component={AppDrawer} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRoutes;