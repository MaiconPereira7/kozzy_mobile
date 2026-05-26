// src/screens/ProfileScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../contexts/UserContext';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import { getInitials } from '../utils/formatters';

interface FieldRowProps {
  label: string; icon: string; value: string; editable: boolean;
  onChangeText?: (v: string) => void; keyboardType?: string; secureTextEntry?: boolean;
}

const FieldRow = ({ label, icon, value, editable, onChangeText, keyboardType, secureTextEntry }: FieldRowProps) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.fieldRow, !editable && styles.fieldDisabled]}>
      <Ionicons name={icon as any} size={16} color={editable ? COLORS.primary : COLORS.text.light} style={{ marginRight: SPACING.sm }} />
      <TextInput
        style={styles.fieldInput}
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

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser, logout } = useContext(UserContext);

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });

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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setTempUser(prev => ({ ...prev, avatar: result.assets[0].uri }));
  };

  const initials = getInitials(user?.name || 'U');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)} style={styles.editBtn}>
          <Text style={styles.editBtnText}>{isEditing ? 'Salvar' : 'Editar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {(isEditing ? tempUser.avatar : user?.avatar) ? (
              <Image source={{ uri: (isEditing ? tempUser.avatar : user?.avatar)! }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
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
          <FieldRow label="Nome completo" icon="person-outline" value={isEditing ? tempUser.name ?? '' : user?.name ?? ''} editable={isEditing} onChangeText={v => setTempUser(p => ({ ...p, name: v }))} />
          <FieldRow label="E-mail" icon="mail-outline" value={isEditing ? tempUser.email ?? '' : user?.email ?? ''} editable={isEditing} keyboardType="email-address" onChangeText={v => setTempUser(p => ({ ...p, email: v }))} />
          <FieldRow label="Senha" icon="lock-closed-outline" value="••••••••" editable={false} secureTextEntry />
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setTempUser({ ...user }); setIsEditing(false); }}>
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
          <Ionicons name="power-outline" size={18} color={COLORS.primary} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  header: { backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? (require('react-native').StatusBar.currentHeight ?? 0) + 12 : 56, paddingBottom: SPACING.base, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border.light },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  editBtn: { backgroundColor: COLORS.status.openBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  editBtnText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.sm },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.huge },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xxl },
  avatarWrap: { position: 'relative', marginBottom: SPACING.md },
  avatar: { width: 100, height: 100, borderRadius: BORDER_RADIUS.circle, borderWidth: 3, borderColor: COLORS.white },
  avatarFallback: { width: 100, height: 100, borderRadius: BORDER_RADIUS.circle, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  avatarInitials: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.xxxl, fontWeight: TYPOGRAPHY.weights.bold },
  cameraBtn: { position: 'absolute', bottom: 2, right: 2, backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: BORDER_RADIUS.circle, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  userName: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  roleBadge: { backgroundColor: COLORS.status.openBg, borderRadius: BORDER_RADIUS.circle, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, marginTop: SPACING.sm },
  roleText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  section: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.lg, marginBottom: SPACING.base, ...SHADOWS.sm },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.light, letterSpacing: 1, marginBottom: SPACING.base },
  fieldWrap: { marginBottom: SPACING.base },
  fieldLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.secondary, marginBottom: SPACING.sm },
  fieldRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundLight, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border.light, paddingHorizontal: SPACING.md, height: 48 },
  fieldDisabled: { backgroundColor: COLORS.input.backgroundDisabled },
  fieldInput: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.text.primary },
  cancelBtn: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  cancelText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.status.openBg, borderRadius: BORDER_RADIUS.xl, height: 48, gap: SPACING.sm },
  logoutText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
});