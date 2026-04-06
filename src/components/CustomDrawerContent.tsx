import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import React from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user, logout } = useUser();

  // Helper para os itens do menu para manter o código limpo e alinhado
  const MenuItem = ({ title, icon, active = false, hasNotification = false }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, active && styles.activeMenuItem]}
      onPress={() => active ? props.navigation.closeDrawer() : null}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={active ? COLORS.primary : "#94A3B8"} />
      </View>
      <Text style={[styles.menuItemText, active && styles.activeItemText]}>{title}</Text>
      {hasNotification && <View style={styles.notificationDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER - ÁREA DO PERFIL */}
      <View style={styles.profileSection}>
        <SafeAreaView>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>MP</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Maicon Pereira'}</Text>
          <Text style={styles.userRole}>Cliente · Kozzy Alimentos</Text>
        </SafeAreaView>
      </View>

      {/* LINHA DIVISORA SUTIL */}
      <View style={styles.divider} />

      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>MENU PRINCIPAL</Text>

        <MenuItem title="Central Kozzy" icon="chatbubble-ellipses" active={true} />
        <MenuItem title="Meus Tickets" icon="ticket-outline" hasNotification={true} />
        <MenuItem title="Meus Pedidos" icon="cube-outline" />
        <MenuItem title="Falar com Consultor" icon="headset-outline" />
      </DrawerContentScrollView>

      {/* RODAPÉ COM ALINHAMENTO FIXO */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="power-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Azul profundo
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingBottom: 20,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userRole: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginHorizontal: 24,
  },
  sectionLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 24,
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(224, 30, 38, 0.08)',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  menuItemText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  activeItemText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginLeft: 'auto',
    marginRight: 4,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center'
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});