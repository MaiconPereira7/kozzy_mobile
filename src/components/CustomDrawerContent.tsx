import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Central Kozzy"
        onPress={() => props.navigation.navigate('Central')}
      />
      <DrawerItem
        label="Notificações"
        onPress={() => props.navigation.navigate('Notificacoes')}
      />
    </DrawerContentScrollView>
  );
};