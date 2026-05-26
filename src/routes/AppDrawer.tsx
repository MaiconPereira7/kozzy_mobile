// src/routes/AppDrawer.tsx
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { AbrirTicketScreen } from '../screens/AbrirTicketScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { MeusTicketsScreen } from '../screens/MeusTicketsScreen';
import { NotificacoesScreen } from '../screens/NotificacoesScreen';
import type { AppDrawerParamList } from '../types/navigation';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export const AppDrawer = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerPosition: 'right',
      drawerType: 'front',
      overlayColor: 'rgba(0,0,0,0.4)',
    }}
    initialRouteName="Central"
  >
    <Drawer.Screen name="Central" component={ChatScreen} />
    <Drawer.Screen name="Notificacoes" component={NotificacoesScreen} />
    <Drawer.Screen name="MeusTickets" component={MeusTicketsScreen} />
    <Drawer.Screen name="AbrirTicket" component={AbrirTicketScreen} />
  </Drawer.Navigator>
);