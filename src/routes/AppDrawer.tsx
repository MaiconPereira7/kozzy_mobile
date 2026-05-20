import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { AbrirTicketScreen } from '../screens/AbrirTicketScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { MeusTicketsScreen } from '../screens/MeusTicketsScreen';
import { NotificacoesScreen } from '../screens/NotificacoesScreen';

export type AppDrawerParamList = {
  Central: undefined;
  Notificacoes: undefined;
  MeusTickets: undefined;
  AbrirTicket: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export const AppDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.4)',
      }}
      initialRouteName="Central"
    >
      <Drawer.Screen name="Central" component={ChatScreen} options={{ title: 'Central Kozzy' }} />
      <Drawer.Screen name="Notificacoes" component={NotificacoesScreen} options={{ title: 'Notificações' }} />
      <Drawer.Screen name="MeusTickets" component={MeusTicketsScreen} options={{ title: 'Meus Tickets' }} />
      <Drawer.Screen name="AbrirTicket" component={AbrirTicketScreen} options={{ title: 'Abrir Ticket' }} />
    </Drawer.Navigator>
  );
};