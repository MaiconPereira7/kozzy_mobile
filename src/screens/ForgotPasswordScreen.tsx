import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import type { Colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';
import { validators } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRecover = () => {
    const result = validators.email(email);
    if (!result.valid) { Alert.alert('E-mail inválido', result.message); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.backgroundLight} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recuperar Senha</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.body}>
        <View style={styles.card}>
          {sent ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={52} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>E-mail enviado!</Text>
              <Text style={styles.successText}>Verifique sua caixa de entrada em <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>{email}</Text> e siga as instruções.</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginBtnText}>Voltar ao Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.iconArea}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-open-outline" size={32} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.title}>Esqueceu a senha?</Text>
              <Text style={styles.subtitle}>Digite seu e-mail e enviaremos um link de recuperação.</Text>

              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={colors.text.light} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.input.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={[styles.recoverBtn, loading && { opacity: 0.7 }]} onPress={handleRecover} disabled={loading}>
                <Text style={styles.recoverBtnText}>{loading ? 'Enviando...' : 'ENVIAR LINK'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
                <Ionicons name="arrow-back" size={14} color={colors.primary} />
                <Text style={styles.backLinkText}>Voltar ao login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.backgroundLight },
  header: { backgroundColor: c.white, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56, paddingBottom: SPACING.base, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.border.light },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
  body: { flex: 1, justifyContent: 'center', padding: SPACING.xl },
  card: { backgroundColor: c.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xl, ...SHADOWS.lg },
  iconArea: { alignItems: 'center', marginBottom: SPACING.lg },
  iconCircle: { width: 80, height: 80, borderRadius: BORDER_RADIUS.circle, backgroundColor: c.status.openBg, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, color: c.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, color: c.text.secondary, marginBottom: SPACING.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: c.border.light, paddingHorizontal: SPACING.md, marginBottom: SPACING.xl, height: 52 },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, color: c.text.primary },
  recoverBtn: { height: 52, backgroundColor: c.primary, borderRadius: BORDER_RADIUS.xl, justifyContent: 'center', alignItems: 'center', shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6, marginBottom: SPACING.base },
  recoverBtnText: { color: c.text.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 1 },
  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm },
  backLinkText: { color: c.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  successContainer: { alignItems: 'center' },
  successIcon: { marginBottom: SPACING.base },
  successTitle: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary, marginBottom: SPACING.sm },
  successText: { fontSize: TYPOGRAPHY.sizes.md, color: c.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  loginBtn: { height: 52, backgroundColor: c.primary, borderRadius: BORDER_RADIUS.xl, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xxxl, shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  loginBtnText: { color: c.text.white, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold },
});

export default ForgotPasswordScreen;
