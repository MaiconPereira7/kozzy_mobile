// src/screens/HomeScreen.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView
} from 'react-native';

// 1. Importa os tipos de navegação
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes'; // Importa nosso "Mapa"

// 2. Define as props desta tela
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {

  const handleLogout = () => {
    // 3. O "replace" impede o usuário de "voltar" para a Home
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KOZZY</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.welcomeTitle}>Seja Bem-Vindo!</Text>
        <Text style={styles.welcomeMessage}>
          Você está na área principal do aplicativo.
        </Text>
      </View>
    
    </SafeAreaView>
  );
};

// 4. Estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d9534f',
  },
  logoutButton: {
    fontSize: 16,
    color: '#007bff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;