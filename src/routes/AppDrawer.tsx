// src/routes/AppDrawer.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen'; 
import CustomDrawerContent from '../components/CustomDrawerContent';

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