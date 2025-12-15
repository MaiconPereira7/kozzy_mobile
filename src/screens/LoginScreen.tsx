// src/screens/LoginScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes'; 
import { UserContext } from '../contexts/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { updateUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Aviso", "Preencha email e senha.");
      return;
    }

    setLoading(true);

    // --- LÓGICA DE LOGIN COM SUPERVISOR ---
    setTimeout(() => {
      // Verifica se é supervisor (regra simples: se tiver 'admin' no email)
      const isSupervisor = email.toLowerCase().includes('admin');

      updateUser({
        name: isSupervisor ? "Supervisor" : "Usuário Teste",
        email: email,
        avatar: null,
        role: isSupervisor ? 'supervisor' : 'user' // <--- DEFINE O PAPEL AQUI
      });

      setLoading(false);

      if (isSupervisor) {
        Alert.alert("Acesso Administrativo", "Você entrou no modo Supervisor.");
      }

      navigation.replace('App'); 
    }, 1500);
  };

  return (
    <LinearGradient colors={['#f0f2f5', '#e6e9f0']} style={styles.backgroundGradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logoText}>KOZZY</Text>
          <Text style={styles.logoSubtitle}>Distribuidora</Text>

          <Text style={styles.label}>E-mail ou usuário</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: admin@kozzy.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <MaterialCommunityIcons 
                name={mostrarSenha ? "eye-off-outline" : "eye-outline"} 
                size={20} color="#666" style={styles.icon} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <View style={styles.checkboxContainer}>
              <Checkbox value={lembrar} onValueChange={setLembrar} color={lembrar ? '#d9534f' : undefined} />
              <Text style={styles.checkboxLabel}>Lembrar de mim</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.link}>Recuperar senha</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={['#ef6e7c', '#d9534f']} style={styles.button}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>LOGIN</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={{textAlign:'center', marginTop: 20, color: '#999', fontSize: 12}}>
            Dica: Use "admin@kozzy.com" para testar o Supervisor
          </Text>

        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundGradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#d9534f', textAlign: 'center' },
  logoSubtitle: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 14, color: '#333', fontWeight: 'bold', marginBottom: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginBottom: 15, paddingHorizontal: 10 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#333' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkboxLabel: { marginLeft: 8, fontSize: 14, color: '#555' },
  link: { fontSize: 14, color: '#d9534f', fontWeight: 'bold' },
  buttonContainer: { borderRadius: 10, overflow: 'hidden' },
  button: { paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});

export default LoginScreen;