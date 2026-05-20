import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../contexts/UserContext';

type MenuItem = {
  title: string;
  icon: any;
  screen?: string;
  badge?: number;
};

const MENU_ITEMS: MenuItem[] = [
  { title: 'Central Kozzy', icon: 'chatbubble-ellipses-outline', screen: 'Central' },
  { title: 'Meus Tickets', icon: 'ticket-outline', screen: 'MeusTickets', badge: 2 },
  { title: 'Abrir Ticket', icon: 'add-circle-outline', screen: 'AbrirTicket' },
  { title: 'Notificações', icon: 'notifications-outline', screen: 'Notificacoes', badge: 1 },
];

const BOTTOM_ITEMS: MenuItem[] = [
  { title: 'Meu Perfil', icon: 'person-outline', screen: 'Profile' },
];

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user, logout } = useUser();
  const currentRoute = props.state.routes[props.state.index]?.name;

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const navigate = (screen?: string) => {
    if (!screen) return;
    props.navigation.closeDrawer();
    setTimeout(() => {
      // Drawer screens
      if (['Central', 'Notificacoes', 'MeusTickets'].includes(screen)) {
        props.navigation.navigate(screen);
      } else {
        // Stack screens
        props.navigation.getParent()?.navigate(screen);
      }
    }, 150);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.profileSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email || ''}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'admin' ? 'Admin' : 'Cliente'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Main Menu */}
      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.sectionLabel}>MENU</Text>
        {MENU_ITEMS.map(item => {
          const isActive = currentRoute === item.screen;
          return (
            <TouchableOpacity
              key={item.title}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                <Ionicons name={item.icon} size={20} color={isActive ? '#E01E26' : '#94A3B8'} />
              </View>
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.title}</Text>
              {item.badge ? (
                <View style={styles.badgeWrap}><Text style={styles.badgeText}>{item.badge}</Text></View>
              ) : isActive ? (
                <View style={styles.activeDot} />
              ) : null}
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider2} />
        <Text style={styles.sectionLabel}>CONTA</Text>
        {BOTTOM_ITEMS.map(item => (
          <TouchableOpacity key={item.title} style={styles.menuItem} onPress={() => navigate(item.screen)} activeOpacity={0.7}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={20} color="#94A3B8" />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="power-outline" size={18} color="#E01E26" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 56,
    paddingBottom: 20,
    flexDirection: 'row', alignItems: 'center',
  },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center', marginRight: 12,
    shadowColor: '#E01E26', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  avatarText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: '#222' },
  userEmail: { fontSize: 12, color: '#999', marginTop: 2 },
  roleBadge: { backgroundColor: '#FFF0F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  roleText: { color: '#E01E26', fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 20 },
  divider2: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 0, marginVertical: 12 },
  scroll: { flex: 1 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#CCC', letterSpacing: 1.5, marginLeft: 20, marginTop: 16, marginBottom: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    marginHorizontal: 8, borderRadius: 12, marginBottom: 2,
  },
  menuItemActive: { backgroundColor: '#FFF0F0' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA', marginRight: 12 },
  iconBoxActive: { backgroundColor: '#FFE5E5' },
  menuText: { flex: 1, fontSize: 14, color: '#777', fontWeight: '500' },
  menuTextActive: { color: '#E01E26', fontWeight: '700' },
  badgeWrap: { backgroundColor: '#E01E26', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E01E26' },
  footer: {
    padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF0F0', borderRadius: 12, paddingVertical: 14, gap: 8,
  },
  logoutText: { color: '#E01E26', fontWeight: '700', fontSize: 14 },
});