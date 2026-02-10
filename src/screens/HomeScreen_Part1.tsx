// src/screens/HomeScreen.tsx (REFATORADO - Parte 1/2)

import { DrawerScreenProps } from '@react-navigation/drawer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useUser } from '../contexts/UserContext';
import { PriorityBadge, StatusBadge } from '../contexts/common';
import { AppDrawerParamList } from '../routes/AppDrawer';
import { COLORS } from '../theme';
import { Ticket, TicketPriority, TicketStatus } from '../types';

// DADOS FICTÍCIOS (mover para service depois)
const DUMMY_TICKETS: Ticket[] = [
  {
    id: '1',
    name: 'Padaria do João',
    subject: 'Atraso na entrega de farinha',
    status: 'open',
    protocol: 'KZ-2024001',
    clientType: 'retail',
    category: 'Logística',
    priority: 'high',
    date: '25/10/2023',
    time: '14:30',
    description: 'O cliente relata que o pedido #12345 deveria ter chegado pela manhã e ainda não foi entregue.',
  },
  {
    id: '2',
    name: 'Mercado Silva',
    subject: 'Produto veio danificado',
    status: 'inProgress',
    protocol: 'KZ-2024002',
    clientType: 'wholesale',
    category: 'Qualidade',
    priority: 'medium',
    date: '24/10/2023',
    time: '09:15',
    description: 'Caixas de leite chegaram amassadas. Solicitam troca imediata.',
  },
  {
    id: '3',
    name: 'Restaurante Sabor',
    subject: 'Dúvida sobre boleto',
    status: 'closed',
    protocol: 'KZ-2024003',
    clientType: 'foodService',
    category: 'Financeiro',
    priority: 'low',
    date: '20/10/2023',
    time: '16:45',
    description: 'Cliente não recebeu o boleto por e-mail.',
  },
  {
    id: '4',
    name: 'Empório Gourmet',
    subject: 'Novo pedido urgente',
    status: 'open',
    protocol: 'KZ-2024004',
    clientType: 'retail',
    category: 'Vendas',
    priority: 'high',
    date: '26/10/2023',
    time: '08:00',
    description: 'Precisa de reposição de azeites importados para evento no fim de semana.',
  },
];

type Props = DrawerScreenProps<AppDrawerParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TicketStatus>('open');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Estados para edição (Supervisor)
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<TicketPriority>('medium');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carrega dados
  const loadTickets = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setTickets(DUMMY_TICKETS);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTickets();
  }, [loadTickets]);

  // Filtra tickets por status usando useMemo
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => ticket.status === activeTab);
  }, [tickets, activeTab]);

  // Abre modal
  const handleCardPress = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditCategory(ticket.category);
    setEditPriority(ticket.priority);
    setModalVisible(true);
  }, []);

  // Salva alterações (apenas supervisor)
  const handleSaveSupervisor = useCallback(() => {
    if (!selectedTicket) return;

    const newTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? { ...t, category: editCategory, priority: editPriority }
        : t
    );

    setTickets(newTickets);
    setModalVisible(false);
    Alert.alert('Sucesso', 'Chamado atualizado!');
  }, [selectedTicket, tickets, editCategory, editPriority]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.logoText}>KOZZY</Text>
          <Text style={styles.subLogoText}>
            {user.role === 'supervisor' ? 'Painel do Supervisor' : 'Distribuição & Logística'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Feather name="menu" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['open', 'inProgress', 'closed'] as TicketStatus[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab === 'open' ? 'Abertos' : tab === 'inProgress' ? 'Análise' : 'Concluídos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de Tickets */}
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SupportCard item={item} onPress={handleCardPress} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <Text style={styles.emptyText}>Nenhum chamado nesta lista.</Text>
            )}
          </View>
        }
      />

      {/* Modal de Detalhes */}
      <TicketModal
        visible={modalVisible}
        ticket={selectedTicket}
        userRole={user.role}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        editPriority={editPriority}
        setEditPriority={setEditPriority}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveSupervisor}
      />
    </SafeAreaView>
  );
};

// === COMPONENTES AUXILIARES ===

const SupportCard = React.memo(
  ({ item, onPress }: { item: Ticket; onPress: (ticket: Ticket) => void }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {item.name ? item.name.charAt(0) : '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardSubject} numberOfLines={1}>
              {item.subject}
            </Text>
            <PriorityBadge type={item.priority} />
          </View>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooterRow}>
        <StatusBadge type={item.status} />
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onPress(item)}
        >
          <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
          <Feather name="chevron-right" size={16} color={COLORS.text.light} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
);

// Continua no próximo arquivo...
