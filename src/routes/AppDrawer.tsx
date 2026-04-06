import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';

// Importações dos seus componentes
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { ChatScreen } from '../screens/ChatScreen';
import { NotificacoesScreen } from '../screens/NotificacoesScreen';

// Definição dos tipos das rotas
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
        headerShown: false, // Mantemos falso para usar o seu topo vermelho
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