import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList, Platform, StatusBar, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

type NotifType = 'ticket' | 'system' | 'alert';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK: Notif[] = [
  { id: '1', type: 'ticket', title: 'Ticket #1042 atualizado', body: 'Seu chamado sobre entrega foi respondido pela equipe.', time: '10 min atrás', read: false },
  { id: '2', type: 'alert', title: 'Prazo de entrega próximo', body: 'O pedido #882 vence amanhã. Confirme o recebimento.', time: '1h atrás', read: false },
  { id: '3', type: 'system', title: 'Bem-vindo ao Kozzy!', body: 'Seu acesso ao sistema de atendimento foi ativado.', time: '2h atrás', read: true },
  { id: '4', type: 'ticket', title: 'Ticket #1039 encerrado', body: 'O chamado foi marcado como resolvido.', time: 'Ontem', read: true },
  { id: '5', type: 'system', title: 'Atualização do sistema', body: 'Nova versão do app disponível com melhorias.', time: '2 dias atrás', read: true },
];

const iconMap: Record<NotifType, { name: any; color: string; bg: string }> = {
  ticket: { name: 'ticket-outline', color: '#E01E26', bg: '#FFF0F0' },
  alert: { name: 'warning-outline', color: '#F59E0B', bg: '#FFFBEB' },
  system: { name: 'information-circle-outline', color: '#3B82F6', bg: '#EFF6FF' },
};

export const NotificacoesScreen = () => {
  const navigation = useNavigation();
  const [notifs, setNotifs] = useState(MOCK);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const renderItem = ({ item }: { item: Notif }) => {
    const ic = iconMap[item.type];
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.75}
      >
        <View style={[styles.iconWrap, { backgroundColor: ic.bg }]}>
          <Ionicons name={ic.name} size={22} color={ic.color} />
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
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
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
            <Ionicons name="menu-outline" size={28} color="#222" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifs}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={52} color="#DDD" />
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56,
    paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#222' },
  headerSub: { fontSize: 13, color: '#E01E26', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markBtn: { backgroundColor: '#FFF0F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  markBtnText: { color: '#E01E26', fontSize: 13, fontWeight: '600' },
  menuBtn: { padding: 4 },
  list: { padding: 16 },
  sep: { height: 10 },
  card: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#E01E26' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 14, color: '#555', flex: 1, marginRight: 6 },
  cardTitleBold: { fontWeight: '700', color: '#222' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E01E26' },
  cardText: { fontSize: 13, color: '#888', lineHeight: 18 },
  cardTime: { fontSize: 11, color: '#BBB', marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#CCC', fontSize: 15, marginTop: 12 },
});

export default NotificacoesScreen;