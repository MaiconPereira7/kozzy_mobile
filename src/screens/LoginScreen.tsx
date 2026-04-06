import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, Input } from '../components/common';
import { useUser } from '../contexts/UserContext';
import { RootStackParamList } from '../routes';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Aviso', 'Preencha os campos para testar.');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Delay visual

      await login({
        id: '1',
        name: 'Maicon',
        email: email.trim(),
        avatar: null,
        role: email.includes('admin') ? 'supervisor' : 'user',
      }, 'token-teste-123');

      navigation.replace('App');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível completar o login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.gradients.background} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logoText}>KOZZY</Text>
          <Text style={styles.logoSubtitle}>Distribuidora</Text>

          <Input icon="account-outline" placeholder="E-mail" value={email} onChangeText={setEmail} />
          <Input icon="lock-outline" placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

          <View style={{ marginTop: 20 }}>
            <Button title="ENTRAR" onPress={handleLogin} loading={loading} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  card: { width: '100%', maxWidth: 400, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.round, padding: SPACING.xl, elevation: 5 },
  logoText: { fontSize: TYPOGRAPHY.sizes.title, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.primary, textAlign: 'center' },
  logoSubtitle: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, textAlign: 'center', marginBottom: 30 },
});

export default LoginScreen;