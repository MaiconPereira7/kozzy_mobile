import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';

import { CustomDrawerContent } from '../components/CustomDrawerContent';
// ADICIONE AS CHAVES AQUI:
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
        headerShown: true,
        drawerPosition: "right",
      }}
      initialRouteName="Central"
    >
      <Drawer.Screen
        name="Central"
        component={ChatScreen}
        options={{ title: 'Central Kozzy' }}
      />
      <Drawer.Screen
        name="Notificacoes"
        component={NotificacoesScreen}
        options={{ title: 'Notificações' }}
      />
    </Drawer.Navigator>
  );
};