import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { ChatScreen } from '../screens/ChatScreen'; // Importe a nova tela
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
        headerShown: true, // Agora mostramos o cabeçalho
        drawerPosition: "right",
      }}
      initialRouteName="HomeChat" // Chat como tela inicial
    >
      <Drawer.Screen
        name="HomeChat"
        component={ChatScreen}
        options={{ title: 'Central Kozzy' }}
      />
      <Drawer.Screen name="Notificacoes" component={NotificacoesScreen} />
    </Drawer.Navigator>
  );
};