// src/screens/LoginScreen.tsx (REFATORADO)

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Input } from '../contexts/common';
import { useUser } from '../contexts/UserContext';
import { RootStackParamList } from '../routes';
import { ApiError, apiPost, handleApiError } from '../services/api';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { validators } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validações
    const emailValidation = validators.email(email);
    if (!emailValidation.valid) {
      Alert.alert('Erro', emailValidation.message);
      return;
    }

    const passwordValidation = validators.password(senha);
    if (!passwordValidation.valid) {
      Alert.alert('Erro', passwordValidation.message);
      return;
    }

    setLoading(true);

    try {
      const response = await apiPost('/login', {
        email: email.trim(),
        password: senha.trim(),
      });

      const userData = response.user;

      // Define role baseado no email (você pode mudar essa lógica)
      const isSupervisor = email.toLowerCase().includes('admin');

      await login(
        {
          ...userData,
          name: userData.name || 'Usuário',
          email: userData.email,
          avatar: userData.avatar || null,
          role: isSupervisor ? 'supervisor' : 'user',
        },
        response.token
      );

      // Sucesso! Navega para o app
      navigation.replace('App');
    } catch (error) {
      console.error('Erro Login:', error);
      const message = handleApiError(error as ApiError);
      Alert.alert('Erro de Acesso', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradients.background}
      style={styles.backgroundGradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          {/* Logo */}
          <Text style={styles.logoText}>KOZZY</Text>
          <Text style={styles.logoSubtitle}>Distribuidora</Text>

          {/* Email Input */}
          <Text style={styles.label}>E-mail ou usuário</Text>
          <Input
            icon="account-outline"
            placeholder="Ex: admin@kozzy.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <Text style={styles.label}>Senha</Text>
          <Input
            icon="lock-outline"
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            showPasswordToggle
          />

          {/* Opções */}
          <View style={styles.optionsRow}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={lembrar}
                onValueChange={setLembrar}
                color={lembrar ? COLORS.primary : undefined}
              />
              <Text style={styles.checkboxLabel}>Lembrar de mim</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.link}>Recuperar senha</Text>
            </TouchableOpacity>
          </View>

          {/* Botão Login */}
          <Button
            title="LOGIN"
            onPress={handleLogin}
            loading={loading}
            fullWidth
          />

          {/* Link Criar Conta */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as any)}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>Criar conta nova</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  logoText: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  logoSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },
  link: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  registerLink: {
    marginTop: SPACING.lg,
  },
  registerText: {
    textAlign: 'center',
    color: COLORS.text.light,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});

export default LoginScreen;
