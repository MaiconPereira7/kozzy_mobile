import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';

// Ajustado: agora busca direto na pasta components (fora da common)
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { HomeScreen_Part1 } from '../screens/HomeScreen_Part1';
import { NotificacoesScreen } from '../screens/NotificacoesScreen';

export type AppDrawerParamList = {
  Home: undefined;
  Notificacoes: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export const AppDrawer = () => {
  return (
    <Drawer.Navigator
      // Renderiza o menu lateral customizado que você criou
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "right", // Mantendo sua preferência de abrir pela direita
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen_Part1}
        options={{ title: 'Central de Atendimento' }}
      />
      <Drawer.Screen
        name="Notificacoes"
        component={NotificacoesScreen}
      />
    </Drawer.Navigator>
  );
};