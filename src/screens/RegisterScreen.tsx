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
import { apiRegister } from '../services/api';
import { BORDER_RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import type { Colors } from '../theme/colors';
import type { RootNavigationProp } from '../types/navigation';
import { validators } from '../utils/validation';

const RegisterScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { login } = useUser();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) { Alert.alert('Nome obrigatório', 'Informe seu nome completo.'); return; }
    const emailResult    = validators.email(email);
    const passwordResult = validators.password(password);
    if (!emailResult.valid)    { Alert.alert('E-mail inválido', emailResult.message); return; }
    if (!passwordResult.valid) { Alert.alert('Senha inválida', passwordResult.message); return; }
    if (password !== confirm)  { Alert.alert('Senhas diferentes', 'A confirmação de senha não coincide.'); return; }

    setLoading(true);
    try {
      const { user: apiUser, token } = await apiRegister(name.trim(), email.trim(), password);
      await login({ ...apiUser, token });
      navigation.replace('App');
    } catch (error: any) {
      const msg = error?.code === 409
        ? 'E-mail já cadastrado. Tente fazer login.'
        : error.message || 'Erro ao criar conta. Verifique a conexão.';
      Alert.alert('Erro', msg);
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
          <Text style={styles.brandSub}>Criar nova conta</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cadastro</Text>

          <Text style={styles.label}>Nome completo</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={colors.text.light} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={colors.input.placeholder}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.input.placeholder}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.text.light} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar senha</Text>
          <View style={[styles.inputRow, confirm && confirm !== password && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.text.light} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Repita a senha"
              placeholderTextColor={colors.input.placeholder}
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(p => !p)} style={styles.eyeBtn}>
              <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.text.light} />
            </TouchableOpacity>
          </View>
          {!!confirm && confirm !== password && (
            <Text style={styles.errorHint}>As senhas não coincidem</Text>
          )}

          <TouchableOpacity style={[styles.registerBtn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color={colors.text.white} />
              : <Text style={styles.registerBtnText}>CRIAR CONTA</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.loginText}>Já tem conta? <Text style={styles.loginLink}>Fazer login</Text></Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Kozzy Alimentos © 2025</Text>
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
  inputError: { borderColor: c.error ?? '#E01E26' },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, color: c.text.primary },
  eyeBtn: { padding: SPACING.xs },
  errorHint: { fontSize: TYPOGRAPHY.sizes.xs, color: c.error ?? '#E01E26', marginTop: -SPACING.md, marginBottom: SPACING.md, marginLeft: SPACING.xs },
  registerBtn: { height: 52, backgroundColor: c.primary, borderRadius: BORDER_RADIUS.xl, justifyContent: 'center', alignItems: 'center', shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  btnDisabled: { opacity: 0.6 },
  registerBtnText: { color: c.text.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  loginBtn: { marginTop: SPACING.lg, alignItems: 'center' },
  loginText: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.secondary },
  loginLink: { color: c.primary, fontWeight: TYPOGRAPHY.weights.bold },
  footer: { textAlign: 'center', color: c.border.dark, fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xxxl },
});

export default RegisterScreen;
