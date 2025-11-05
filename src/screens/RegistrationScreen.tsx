// src/screens/RegistrationScreen.tsx

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
type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;


const RegistrationScreen = ({ navigation }: Props) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);


  const handleRegister = () => {
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não conferem!');
      return;
    }
    
    Alert.alert('Sucesso!', 'Conta criada. Você será levado ao Login.');
    
    // 3. Navega de VOLTA para o Login
    navigation.navigate('Login');
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
          
          <Text style={styles.logoText}>Criar Conta</Text>
          <Text style={styles.logoSubtitle}>É rápido e fácil</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="account-outline" 
              size={20} 
              color="#666" 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={20} 
              color="#666" 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color="#666" 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Crie uma senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <MaterialCommunityIcons 
                name={mostrarSenha ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
                style={styles.icon} 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar Senha</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons 
              name="lock-check-outline" 
              size={20} 
              color="#666" 
              style={styles.icon} 
            />
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarSenha}
            />
          </View>

          <TouchableOpacity style={styles.buttonContainer} onPress={handleRegister}>
            <LinearGradient
              colors={['#ef6e7c', '#d9534f']}
              style={styles.button}
            >
              <Text style={styles.buttonText}>CADASTRAR</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 4. Link para Voltar ao Login */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Entre aqui</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// 5. Estilos
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
    marginBottom: 15,
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
    marginTop: 10,
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
  footerText: {
    fontSize: 14,
    color: '#555',
  },
  footerLink: {
    fontSize: 14,
    color: '#d9534f',
    fontWeight: 'bold',
  },
});

export default RegistrationScreen;