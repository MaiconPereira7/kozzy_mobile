import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Alert, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { UserContext } from '../contexts/UserContext';
import type { ThemeMode } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import type { Colors } from '../theme/colors';
import { getInitials } from '../utils/formatters';
import { getServerUrl, setServerUrl } from '../services/api';

interface FieldRowProps {
  label: string; icon: string; value: string; editable: boolean;
  onChangeText?: (v: string) => void; keyboardType?: string; secureTextEntry?: boolean;
  colors: Colors;
}

const FieldRow = ({ label, icon, value, editable, onChangeText, keyboardType, secureTextEntry, colors }: FieldRowProps) => {
  const fieldStyles = useMemo(() => StyleSheet.create({
    wrap: { marginBottom: SPACING.base },
    labelText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, color: colors.text.secondary, marginBottom: SPACING.sm },
    row: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: colors.backgroundLight, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: colors.border.light, paddingHorizontal: SPACING.md, height: 48 },
    rowDisabled: { backgroundColor: colors.input.backgroundDisabled },
    input: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, color: colors.text.primary },
  }), [colors]);

  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.labelText}>{label}</Text>
      <View style={[fieldStyles.row, !editable && fieldStyles.rowDisabled]}>
        <Ionicons name={icon as any} size={16} color={editable ? colors.primary : colors.text.light} style={{ marginRight: SPACING.sm }} />
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType as any}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
};

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
  { mode: 'light', label: 'Claro', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Escuro', icon: 'moon-outline' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { user, updateUser, logout } = useContext(UserContext);
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...(user ?? {}) });
  const [serverUrl, setServerUrlState] = useState('');

  useEffect(() => { setServerUrlState(getServerUrl()); }, []);

  const handleSave = () => {
    if (!tempUser.name || !tempUser.email) {
      Alert.alert('Atenção', 'Nome e e-mail são obrigatórios.'); return;
    }
    updateUser(tempUser);
    setIsEditing(false);
    Alert.alert('Sucesso', 'Perfil atualizado!');
  };

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setTempUser(prev => ({ ...prev, avatar: result.assets[0].uri }));
  };

  const initials = getInitials(user?.name || 'U');
  const avatarUri = isEditing ? tempUser.avatar : user?.avatar;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)} style={styles.editBtn}>
          <Text style={styles.editBtnText}>{isEditing ? 'Salvar' : 'Editar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                <Ionicons name="camera" size={16} color={colors.text.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'admin' ? 'Administrador' : user?.role === 'supervisor' ? 'Supervisor' : 'Cliente'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
          <FieldRow label="Nome completo" icon="person-outline" value={isEditing ? tempUser.name ?? '' : user?.name ?? ''} editable={isEditing} onChangeText={v => setTempUser(p => ({ ...p, name: v }))} colors={colors} />
          <FieldRow label="E-mail" icon="mail-outline" value={isEditing ? tempUser.email ?? '' : user?.email ?? ''} editable={isEditing} keyboardType="email-address" onChangeText={v => setTempUser(p => ({ ...p, email: v }))} colors={colors} />
          <TouchableOpacity
            style={styles.changePassBtn}
            onPress={() => Alert.alert('Em breve', 'A alteração de senha estará disponível em breve.')}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed-outline" size={16} color={colors.text.light} />
            <Text style={styles.changePassText}>Alterar senha</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.light} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APARÊNCIA</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.mode}
                style={[styles.themeBtn, themeMode === opt.mode && styles.themeBtnActive]}
                onPress={() => setThemeMode(opt.mode)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={18}
                  color={themeMode === opt.mode ? colors.primary : colors.text.light}
                />
                <Text style={[styles.themeBtnText, themeMode === opt.mode && styles.themeBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVIDOR</Text>
          <Text style={styles.serverLabel}>URL do servidor (IP:porta)</Text>
          <View style={styles.serverRow}>
            <TextInput
              style={styles.serverInput}
              value={serverUrl}
              onChangeText={setServerUrlState}
              placeholder="http://192.168.x.x:3000"
              placeholderTextColor={colors.input.placeholder}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity
              style={styles.serverSaveBtn}
              onPress={async () => {
                await setServerUrl(serverUrl.trim());
                Alert.alert('Salvo', 'URL do servidor atualizada. Reinicie o app se necessário.');
              }}
            >
              <Text style={styles.serverSaveBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setTempUser({ ...(user ?? {}) }); setIsEditing(false); }}>
            <Text style={styles.cancelText}>Cancelar edição</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Sair', 'Deseja sair da conta?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: logout },
          ])}
        >
          <Ionicons name="power-outline" size={18} color={colors.primary} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.backgroundLight },
  header: { backgroundColor: c.white, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56, paddingBottom: SPACING.base, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.border.light },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
  editBtn: { backgroundColor: c.status.openBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  editBtnText: { color: c.primary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.sm },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.huge },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xxl },
  avatarWrap: { position: 'relative', marginBottom: SPACING.md },
  avatar: { width: 100, height: 100, borderRadius: BORDER_RADIUS.circle, borderWidth: 3, borderColor: c.white },
  avatarFallback: { width: 100, height: 100, borderRadius: BORDER_RADIUS.circle, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center', shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  avatarInitials: { color: c.text.white, fontSize: TYPOGRAPHY.sizes.xxxl, fontWeight: TYPOGRAPHY.weights.bold },
  cameraBtn: { position: 'absolute', bottom: 2, right: 2, backgroundColor: c.primary, width: 30, height: 30, borderRadius: BORDER_RADIUS.circle, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: c.white },
  userName: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
  roleBadge: { backgroundColor: c.status.openBg, borderRadius: BORDER_RADIUS.circle, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, marginTop: SPACING.sm },
  roleText: { color: c.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  section: { backgroundColor: c.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.lg, marginBottom: SPACING.base, ...SHADOWS.sm },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.light, letterSpacing: 1, marginBottom: SPACING.base },
  themeRow: { flexDirection: 'row', gap: SPACING.sm },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, borderColor: c.border.light, backgroundColor: c.backgroundLight },
  themeBtnActive: { borderColor: c.primary, backgroundColor: c.status.openBg },
  themeBtnText: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.light, fontWeight: TYPOGRAPHY.weights.medium },
  themeBtnTextActive: { color: c.primary, fontWeight: TYPOGRAPHY.weights.bold },
  changePassBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: c.border.light, paddingHorizontal: SPACING.md, height: 48, marginBottom: SPACING.base },
  changePassText: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, color: c.text.secondary },
  cancelBtn: { backgroundColor: c.white, borderWidth: 1.5, borderColor: c.primary, borderRadius: BORDER_RADIUS.xl, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  cancelText: { color: c.primary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
  serverLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: c.text.secondary, marginBottom: SPACING.sm },
  serverRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  serverInput: { flex: 1, backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: c.border.light, paddingHorizontal: SPACING.md, height: 44, fontSize: TYPOGRAPHY.sizes.sm, color: c.text.primary },
  serverSaveBtn: { backgroundColor: c.primary, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, height: 44, justifyContent: 'center', alignItems: 'center' },
  serverSaveBtnText: { color: c.text.white, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.sm },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.status.openBg, borderRadius: BORDER_RADIUS.xl, height: 48, gap: SPACING.sm },
  logoutText: { color: c.primary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
});
