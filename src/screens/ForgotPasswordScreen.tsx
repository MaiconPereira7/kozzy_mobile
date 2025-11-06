// src/screens/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 1. Importa os tipos de navegação
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes'; // Importa nosso "Mapa"

// 2. Define as props desta tela
type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');

  const handleRecover = () => {
    // Apenas um alerta de simulação por enquanto
    Alert.alert(
      'Instruções Enviadas',
      `Se uma conta com o email ${email} existir, um link de recuperação foi enviado.`,
      [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#f0f2f5', '#e6e9f0']}
      style={styles.backgroundGradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          
          <Text style={styles.logoText}>KOZZY</Text>
          <Text style={styles.logoSubtitle}>Distribuidora</Text>

          <Text style={styles.label}>E-mail ou usuário</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="account-outline" 
              size={20} 
              color="#666" 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail ou usuário"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.buttonContainer} onPress={handleRecover}>
            <LinearGradient
              // O gradiente do botão de "Recuperar"
              colors={['#ef6e7c', '#d9534f']}
              style={styles.button}
            >
              <Text style={styles.buttonText}>RECUPERAR SENHA</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Link para Voltar ao Login */}
          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Voltar para o Login</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Reutilizamos os mesmos estilos do Login/Registro para consistência
const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
  },
  logoSubtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 25, // Mais espaço embaixo do input
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerLink: {
    fontSize: 14,
    color: '#d9534f',
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;