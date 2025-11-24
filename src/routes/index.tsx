import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen'; 
import AppDrawer from './AppDrawer';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'; 
import ProfileScreen from '../screens/ProfileScreen';
// 1. IMPORTAR A NOVA TELA
import NotificacoesScreen from '../screens/NotificacoesScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  App: undefined;
  Profile: undefined;
  Notifications: undefined; // 2. ADICIONAR NA TIPAGEM
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppRoutes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="App" component={AppDrawer} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        
        {/* 3. REGISTRAR A ROTA AQUI */}
        <Stack.Screen name="Notifications" component={NotificacoesScreen} />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRoutes;