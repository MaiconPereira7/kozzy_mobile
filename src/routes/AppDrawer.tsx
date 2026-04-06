import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { ChatScreen } from '../screens/ChatScreen';
import { NotificacoesScreen } from '../screens/NotificacoesScreen';

export type AppDrawerParamList = {
  Central: undefined;
  Notificacoes: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export const AppDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // <--- DESLIGAMOS O TOPO PADRÃO AQUI
        drawerPosition: "right",
      }}
      initialRouteName="Central"
    >
      <Drawer.Screen name="Central" component={ChatScreen} />
      <Drawer.Screen name="Notificacoes" component={NotificacoesScreen} />
    </Drawer.Navigator>
  );
};