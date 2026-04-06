import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import { NotificacoesScreen } from '../screens/NotificacoesScreen'; // <--- CORRIGIDO: Adicionadas as chavetas aqui!
import ProfileScreen from '../screens/ProfileScreen';
import { AppDrawer } from './AppDrawer';

export type RootStackParamList = {
  Login: undefined;
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
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="App" component={AppDrawer} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificacoesScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRoutes;