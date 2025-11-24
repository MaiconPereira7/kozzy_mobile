// src/components/CustomDrawerContent.tsx
import React, { useContext } from 'react'; // <--- ADICIONADO: { useContext }
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
// Importação correta para evitar o aviso amarelo:
import { SafeAreaView } from 'react-native-safe-area-context'; 

import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Feather from 'react-native-vector-icons/Feather';
import { UserContext } from '../contexts/UserContext'; 

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  
  // Agora o useContext vai funcionar porque foi importado lá em cima
  const { user } = useContext(UserContext);

  const handleLogout = () => {
    navigation.closeDrawer();
    navigation.navigate('Login'); 
  };

  const handleProfilePress = () => {
    navigation.closeDrawer();
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Cabeçalho do Menu */}
      <TouchableOpacity 
        style={styles.profileContainer} 
        onPress={handleProfilePress} 
      >
        <View style={styles.avatarIconContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <Feather name="user" size={40} color="#555" />
          )}
        </View>
        
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </TouchableOpacity>

      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.logoutSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={22} color="#333" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatarIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileContainer: {
    padding: 20,
    paddingTop: 20, // Ajustei levemente pois SafeAreaView já dá um espaço
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  logoutSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default CustomDrawerContent;