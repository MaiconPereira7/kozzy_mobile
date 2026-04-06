import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../contexts/UserContext';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      /** * CORREÇÃO: O seu Context exige um 'token'.
       * Criamos o objeto completo que o seu sistema espera.
       */
      const userData = {
        id: '1',
        name: 'Maicon Pereira',
        email: email,
        role: 'admin',
        token: 'token-fake-sessao-kozzy' // <--- O TOKEN QUE FALTAVA
      };

      // Passamos o objeto e forçamos o tipo para evitar erro de interface
      await login(userData as any);

      navigation.replace('App');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o login.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>KZ</Text>
          </View>
          <Text style={styles.title}>Kozzy Alimentos</Text>
          <Text style={styles.subtitle}>Painel de Controle</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>ENTRAR</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  inner: { flex: 1, padding: 30, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logoText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { height: 55, backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },
  loginBtn: { height: 55, backgroundColor: '#E01E26', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;