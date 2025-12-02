// src/routes/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
// import RegistrationScreen from '../screens/RegistrationScreen'; // <--- REMOVIDO
import AppDrawer from './AppDrawer';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'; 
import ProfileScreen from '../screens/ProfileScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';

export type RootStackParamList = {
  Login: undefined;
  // Register: undefined; // <--- REMOVIDO
  ForgotPassword: undefined;
  App: undefined;
  Profile: undefined;
  Notifications: undefined;
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
        {/* <Stack.Screen name="Register" component={RegistrationScreen} /> */}
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="App" component={AppDrawer} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificacoesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRoutes;