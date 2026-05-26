// src/components/CustomDrawerContent.tsx
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { getInitials } from '../utils/formatters';

type MenuItem = { title: string; icon: any; screen: string; badge?: number };

const MAIN_MENU: MenuItem[] = [
  { title: 'Central Kozzy', icon: 'chatbubble-ellipses-outline', screen: 'Central' },
  { title: 'Meus Tickets', icon: 'ticket-outline', screen: 'MeusTickets', badge: 2 },
  { title: 'Abrir Ticket', icon: 'add-circle-outline', screen: 'AbrirTicket' },
  { title: 'Notificações', icon: 'notifications-outline', screen: 'Notificacoes', badge: 1 },
];

const ACCOUNT_MENU: MenuItem[] = [
  { title: 'Meu Perfil', icon: 'person-outline', screen: 'Profile' },
];

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user, logout } = useUser();
  const currentRoute = props.state.routes[props.state.index]?.name;
  const initials = getInitials(user?.name || 'U');

  const navigate = (screen: string) => {
    props.navigation.closeDrawer();
    setTimeout(() => {
      if (['Central', 'Notificacoes', 'MeusTickets', 'AbrirTicket'].includes(screen)) {
        props.navigation.navigate(screen);
      } else {
        props.navigation.getParent()?.navigate(screen);
      }
    }, 150);
  };

  const renderItem = (item: MenuItem) => {
    const isActive = currentRoute === item.screen;
    return (
      <TouchableOpacity
        key={item.title}
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        onPress={() => navigate(item.screen)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
          <Ionicons name={item.icon} size={20} color={isActive ? COLORS.primary : COLORS.text.light} />
        </View>
        <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.title}</Text>
        {item.badge ? (
          <View style={styles.badgeWrap}><Text style={styles.badgeText}>{item.badge}</Text></View>
        ) : isActive ? (
          <View style={styles.activeDot} />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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

      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.sectionLabel}>MENU</Text>
        {MAIN_MENU.map(renderItem)}
        <View style={styles.divider2} />
        <Text style={styles.sectionLabel}>CONTA</Text>
        {ACCOUNT_MENU.map(renderItem)}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="power-outline" size={18} color={COLORS.primary} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  profileSection: { paddingHorizontal: SPACING.lg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + SPACING.base : 56, paddingBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 48, height: 48, borderRadius: BORDER_RADIUS.circle, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  avatarText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  profileInfo: { flex: 1 },
  userName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  userEmail: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.light, marginTop: 2 },
  roleBadge: { backgroundColor: COLORS.status.openBg, borderRadius: BORDER_RADIUS.circle, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  roleText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  divider: { height: 1, backgroundColor: COLORS.border.light, marginHorizontal: SPACING.lg },
  divider2: { height: 1, backgroundColor: COLORS.border.light, marginVertical: SPACING.md },
  scroll: { flex: 1 },
  sectionLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, color: COLORS.border.dark, letterSpacing: 1.5, marginLeft: SPACING.lg, marginTop: SPACING.base, marginBottom: SPACING.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.base, marginHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.xl, marginBottom: 2 },
  menuItemActive: { backgroundColor: COLORS.status.openBg },
  iconBox: { width: 36, height: 36, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundLight, marginRight: SPACING.md },
  iconBoxActive: { backgroundColor: COLORS.priority.highBg },
  menuText: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.medium },
  menuTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
  badgeWrap: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.circle, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xs },
  badgeText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  footer: { padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border.light, paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.status.openBg, borderRadius: BORDER_RADIUS.xl, paddingVertical: SPACING.md, gap: SPACING.sm },
  logoutText: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
});