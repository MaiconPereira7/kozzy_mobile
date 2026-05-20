import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useState } from 'react';
import {
  Alert, Image, Platform, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { UserContext } from '../contexts/UserContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser, logout } = useContext(UserContext);

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });

  const handleSave = () => {
    if (!tempUser.name || !tempUser.email) {
      Alert.alert('Atenção', 'Nome e e-mail são obrigatórios.');
      return;
    }
    updateUser(tempUser);
    setIsEditing(false);
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    setTempUser({ ...user });
    setIsEditing(false);
  };

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setTempUser(prev => ({ ...prev, avatar: result.assets[0].uri }));
  };

  const initials = (user?.name || 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#222" />
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
              <Image source={{ uri: isEditing ? tempUser.avatar! : user!.avatar! }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                <Ionicons name="camera" size={16} color="#FFF" />
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
          <Text style={styles.sectionTitle}>Informações pessoais</Text>

          <FieldRow
            label="Nome completo"
            icon="person-outline"
            value={isEditing ? tempUser.name ?? '' : user?.name ?? ''}
            editable={isEditing}
            onChangeText={(v: string) => setTempUser((p: any) => ({ ...p, name: v }))}
          />
          <FieldRow
            label="E-mail"
            icon="mail-outline"
            value={isEditing ? tempUser.email ?? '' : user?.email ?? ''}
            editable={isEditing}
            keyboardType="email-address"
            onChangeText={(v: string) => setTempUser((p: any) => ({ ...p, email: v }))}
          />
          <FieldRow
            label="Senha"
            icon="lock-closed-outline"
            value="••••••••"
            editable={false}
            secureTextEntry
          />
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
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
          <Ionicons name="power-outline" size={18} color="#E01E26" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

interface FieldRowProps {
  label: string;
  icon: string;
  value: string;
  editable: boolean;
  onChangeText?: (v: string) => void;
  keyboardType?: string;
  secureTextEntry?: boolean;
}

const FieldRow = ({ label, icon, value, editable, onChangeText, keyboardType, secureTextEntry }: FieldRowProps) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.fieldRow, !editable && styles.fieldDisabled]}>
      <Ionicons name={icon as any} size={16} color={editable ? '#E01E26' : '#BBB'} style={{ marginRight: 10 }} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56,
    paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  editBtn: { backgroundColor: '#FFF0F0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { color: '#E01E26', fontWeight: '700', fontSize: 13 },
  scroll: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFF' },
  avatarFallback: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#E01E26', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  avatarInitials: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  cameraBtn: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#E01E26', width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  userName: { fontSize: 20, fontWeight: '700', color: '#222' },
  roleBadge: { backgroundColor: '#FFF0F0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  roleText: { color: '#E01E26', fontSize: 12, fontWeight: '600' },
  section: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#999', letterSpacing: 0.8, marginBottom: 16, textTransform: 'uppercase' },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F8FA', borderRadius: 10,
    borderWidth: 1, borderColor: '#EBEBEB', paddingHorizontal: 14, height: 48,
  },
  fieldDisabled: { backgroundColor: '#F2F2F2' },
  fieldInput: { flex: 1, fontSize: 14, color: '#333' },
  cancelBtn: {
    backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E01E26',
    borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  cancelText: { color: '#E01E26', fontWeight: '700', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF0F0', borderRadius: 12, height: 48,
  },
  logoutText: { color: '#E01E26', fontWeight: '700', fontSize: 14, marginLeft: 8 },
});