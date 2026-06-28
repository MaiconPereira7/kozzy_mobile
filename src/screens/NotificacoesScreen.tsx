import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notificationService';
import { BORDER_RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import type { Colors } from '../theme/colors';
import type { Notification } from '../types';
import type { AppDrawerNavigationProp } from '../types/navigation';

export const NotificacoesScreen = () => {
  const navigation = useNavigation<AppDrawerNavigationProp>();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifs = async () => {
    const data = await notificationService.getAll();
    setNotifs(data);
  };

  useEffect(() => { loadNotifs(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifs();
    setRefreshing(false);
  };

  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.white} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notificações</Text>
          {unreadCount > 0 && <Text style={styles.headerSub}>{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</Text>}
        </View>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markBtn} onPress={markAllRead}>
              <Text style={styles.markBtnText}>Marcar todas</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.menuBtn}>
            <Ionicons name="menu-outline" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifs}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read && styles.cardUnread]}
            onPress={() => markRead(item.id)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={[styles.cardTitle, !item.read && styles.cardTitleBold]} numberOfLines={1}>{item.title}</Text>
                {!item.read && <View style={styles.dot} />}
              </View>
              <Text style={styles.cardText} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={52} color={colors.border.medium} />
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
          </View>
        }
      />
    </View>
  );
};

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.backgroundLight },
  header: { backgroundColor: c.white, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56, paddingBottom: SPACING.base, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: c.border.light },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
  headerSub: { fontSize: TYPOGRAPHY.sizes.sm, color: c.primary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  markBtn: { backgroundColor: c.status.openBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  markBtnText: { color: c.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  menuBtn: { padding: SPACING.xs },
  list: { padding: SPACING.base },
  card: { backgroundColor: c.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.base, flexDirection: 'row', alignItems: 'flex-start', ...SHADOWS.sm },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: c.primary },
  iconWrap: { width: 44, height: 44, borderRadius: BORDER_RADIUS.xl, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xs },
  cardTitle: { fontSize: TYPOGRAPHY.sizes.md, color: c.text.secondary, flex: 1, marginRight: SPACING.sm },
  cardTitleBold: { fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary },
  cardText: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.light, lineHeight: 18 },
  cardTime: { fontSize: TYPOGRAPHY.sizes.xs, color: c.border.dark, marginTop: SPACING.sm },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: c.border.dark, fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.md },
});

export default NotificacoesScreen;
