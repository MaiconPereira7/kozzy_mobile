// src/routes/AppDrawer.tsx
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import CustomDrawerContent from '../components/CustomDrawerContent';
import HomeScreen_Part1 from '../screens/HomeScreen_Part1';
import NotificacoesScreen from '../screens/NotificacoesScreen';

export type AppDrawerParamList = {
  Home: undefined;
  Notificacoes: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

const AppDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Central de Atendimento' }}
      />
      <Drawer.Screen
        name="Notificacoes"
        component={NotificacoesScreen}
        options={{ title: 'Notificações' }}
      />
    </Drawer.Navigator>
  );
};

export default AppDrawer;