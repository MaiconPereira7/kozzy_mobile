// src/routes/AppDrawer.tsx
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { ChatScreen } from '../screens/ChatScreen';
import { NotificacoesScreen } from '../screens/NotificacoesScreen';

export type AppDrawerParamList = {
  HomeChat: undefined;
  Notificacoes: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export const AppDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true, // Habilitado para exibir o título no topo
        drawerPosition: "right",
      }}
      initialRouteName="HomeChat"
    >
      <Drawer.Screen
        name="HomeChat"
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