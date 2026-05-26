// src/types/navigation.ts
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  App: undefined;
  Profile: undefined;
};

export type AppDrawerParamList = {
  Central: undefined;
  Notificacoes: undefined;
  MeusTickets: undefined;
  AbrirTicket: undefined;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AppDrawerNavigationProp = DrawerNavigationProp<AppDrawerParamList>;