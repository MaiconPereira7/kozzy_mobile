// src/screens/LoginScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import type { RootNavigationProp } from '../types/navigation';
import { validators } from '../utils/validation';

const LoginScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { login } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    const emailResult = validators.email(email);
    const passwordResult = validators.password(password);

    if (!emailResult.valid) {
      Alert.alert('E-mail inválido', emailResult.message); return;
    }
    if (!passwordResult.valid) {
      Alert.alert('Senha inválida', passwordResult.message); return;
    }

    setLoading(true);
    try {
      // Quando o backend estiver pronto, troque o bloco abaixo por:
      // const response = await apiPost('/auth/login', { email, password });
      // await login(response.user);
      await login({ id: '1', name: 'Maicon Pereira', email, role: 'admin', token: 'token-kozzy' });
      navigation.replace('App');
    } catch (error: any) {
      Alert.alert('Erro no login', error.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetters}>KZ</Text>
          </View>
          <Text style={styles.brandName}>Kozzy Alimentos</Text>
          <Text style={styles.brandSub}>Sistema de Atendimento</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na conta</Text>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.text.light} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={COLORS.input.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.text.light} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.input.placeholder}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.text.light} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.loginBtnText}>ENTRAR</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Kozzy Alimentos © 2025</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xl },
  logoArea: { alignItems: 'center', marginBottom: SPACING.xxxl },
  logoCircle: { width: 88, height: 88, borderRadius: BORDER_RADIUS.circle, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  logoLetters: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.title, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  brandName: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  brandSub: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.light, marginTop: SPACING.xs },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xl, ...SHADOWS.lg },
  cardTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.xl },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.secondary, marginBottom: SPACING.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundLight, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.border.light, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg, height: 52 },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  eyeBtn: { padding: SPACING.xs },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.xl, marginTop: -SPACING.sm },
  forgotText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  loginBtn: { height: 52, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  footer: { textAlign: 'center', color: COLORS.border.dark, fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xxxl },
});

export default LoginScreen;