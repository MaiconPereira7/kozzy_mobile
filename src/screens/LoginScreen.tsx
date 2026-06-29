import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import type { Colors } from '../theme/colors';
import type { RootNavigationProp } from '../types/navigation';
import { validators } from '../utils/validation';

const LoginScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { login } = useUser();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    const emailResult = validators.email(email);
    const passwordResult = validators.password(password);

    if (!emailResult.valid) { Alert.alert('E-mail inválido', emailResult.message); return; }
    if (!passwordResult.valid) { Alert.alert('Senha inválida', passwordResult.message); return; }

    setLoading(true);
    try {
      const lower = email.toLowerCase();
      const isSupervisor = lower === 'supervisor@kozzy.com' || lower.startsWith('supervisor@');
      await login({
        id: isSupervisor ? 'sup1' : '1',
        name: isSupervisor ? 'Ana Supervisora' : 'João Cliente',
        email,
        role: isSupervisor ? 'supervisor' : 'user',
        token: 'token-kozzy',
      });
      navigation.replace('App');
    } catch (error: any) {
      Alert.alert('Erro no login', error.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundLight} />
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
            <Ionicons name="mail-outline" size={18} color={colors.text.light} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={colors.input.placeholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.text.light} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.input.placeholder}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.text.light} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.text.white} />
              : <Text style={styles.loginBtnText}>ENTRAR</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Kozzy Alimentos © 2025</Text>
        <Text style={styles.hint}>
          Supervisor: supervisor@kozzy.com{'\n'}Cliente: qualquer outro e-mail
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.backgroundLight },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xl },
  logoArea: { alignItems: 'center', marginBottom: SPACING.xxxl },
  logoCircle: { width: 88, height: 88, borderRadius: BORDER_RADIUS.circle, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, shadowColor: c.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  logoLetters: { color: c.text.white, fontSize: TYPOGRAPHY.sizes.title, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  brandName: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
  brandSub: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.light, marginTop: SPACING.xs },
  card: { backgroundColor: c.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xl, ...SHADOWS.lg },
  cardTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary, marginBottom: SPACING.xl },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, color: c.text.secondary, marginBottom: SPACING.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: c.border.light, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg, height: 52 },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, color: c.text.primary },
  eyeBtn: { padding: SPACING.xs },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.xl, marginTop: -SPACING.sm },
  forgotText: { color: c.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  loginBtn: { height: 52, backgroundColor: c.primary, borderRadius: BORDER_RADIUS.xl, justifyContent: 'center', alignItems: 'center', shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: c.text.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  footer: { textAlign: 'center', color: c.border.dark, fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xxxl },
  hint: { textAlign: 'center', color: c.text.light, fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.sm, lineHeight: 18 },
});

export default LoginScreen;
