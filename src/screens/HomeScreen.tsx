// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons'; 
import { DrawerScreenProps } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../routes/AppDrawer';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- TIPO DE DADOS ---
type Ticket = {
  id: string;
  name: string;
  subject: string;
  type: 'ativo' | 'andamento' | 'fechado';
  protocol: string;
  clientType: string;
  category: string;
  date: string;
  time: string;
  description: string;
};

// --- DADOS FICTÍCIOS (MOCK) ---
const DUMMY_TICKETS: Ticket[] = [
  {
    id: '1',
    name: 'Padaria do João',
    subject: 'Atraso na entrega de farinha',
    type: 'ativo',
    protocol: 'KZ-2024001',
    clientType: 'Varejo',
    category: 'Logística',
    date: '25/10/2023',
    time: '14:30',
    description: 'O cliente relata que o pedido #12345 deveria ter chegado pela manhã e ainda não foi entregue. Caminhão está parado no centro.'
  },
  {
    id: '2',
    name: 'Mercado Silva',
    subject: 'Produto veio danificado',
    type: 'andamento',
    protocol: 'KZ-2024002',
    clientType: 'Atacado',
    category: 'Qualidade',
    date: '24/10/2023',
    time: '09:15',
    description: 'Caixas de leite chegaram amassadas. Solicitam troca imediata ou crédito na próxima compra.'
  },
  {
    id: '3',
    name: 'Restaurante Sabor',
    subject: 'Dúvida sobre boleto',
    type: 'fechado',
    protocol: 'KZ-2024003',
    clientType: 'Food Service',
    category: 'Financeiro',
    date: '20/10/2023',
    time: '16:45',
    description: 'Cliente não recebeu o boleto por e-mail. Segunda via enviada e confirmada pelo cliente.'
  },
  {
    id: '4',
    name: 'Empório Gourmet',
    subject: 'Novo pedido urgente',
    type: 'ativo',
    protocol: 'KZ-2024004',
    clientType: 'Varejo',
    category: 'Vendas',
    date: '26/10/2023',
    time: '08:00',
    description: 'Precisa de reposição de azeites importados para evento no fim de semana. Cliente VIP.'
  },
  {
    id: '5',
    name: 'Hotel Central',
    subject: 'Pedido Incompleto',
    type: 'andamento',
    protocol: 'KZ-2024005',
    clientType: 'Hotelaria',
    category: 'Logística',
    date: '23/10/2023',
    time: '11:20',
    description: 'Faltaram 5 caixas de suco de laranja no pedido entregue hoje. Motorista confirmou a falta no canhoto.'
  },
  {
    id: '6',
    name: 'Lanchonete da Esquina',
    subject: 'Troca de produto',
    type: 'ativo',
    protocol: 'KZ-2024006',
    clientType: 'Food Service',
    category: 'Vendas',
    date: '26/10/2023',
    time: '10:10',
    description: 'Pediu maionese sachê mas recebeu pote de 3kg. Quer realizar a troca antes do almoço.'
  },
  {
    id: '7',
    name: 'Supermercado Preço Baixo',
    subject: 'Alteração de endereço',
    type: 'fechado',
    protocol: 'KZ-2024007',
    clientType: 'Atacado',
    category: 'Cadastro',
    date: '19/10/2023',
    time: '15:00',
    description: 'Solicitação de mudança de endereço de entrega para a nova filial. Atualizado no sistema.'
  },
  {
    id: '8',
    name: 'Escola Municipal',
    subject: 'Agendamento de entrega',
    type: 'ativo',
    protocol: 'KZ-2024008',
    clientType: 'Institucional',
    category: 'Logística',
    date: '27/10/2023',
    time: '07:30',
    description: 'Solicitam que a entrega da merenda seja feita estritamente entre 08:00 e 10:00 devido ao horário do recreio.'
  },
  {
    id: '9',
    name: 'Buffet Festas & Cia',
    subject: 'Nota Fiscal com erro',
    type: 'andamento',
    protocol: 'KZ-2024009',
    clientType: 'Eventos',
    category: 'Financeiro',
    date: '24/10/2023',
    time: '13:45',
    description: 'CNPJ na nota fiscal saiu incorreto. O financeiro já está emitindo a carta de correção.'
  },
  {
    id: '10',
    name: 'Quiosque da Praia',
    subject: 'Cancelamento de pedido',
    type: 'fechado',
    protocol: 'KZ-2024010',
    clientType: 'Varejo',
    category: 'Vendas',
    date: '18/10/2023',
    time: '09:00',
    description: 'Cliente cancelou o pedido de sorvetes devido à previsão de chuva forte no fim de semana.'
  }
];

const COLORS = {
  primary: '#e60023', 
  background: '#f8f8f8',
  cardBg: '#ffffff',
  textMain: '#333',
  textLight: '#777',
  statusAtivo: '#e60023',   
  statusAndamento: '#f0ad4e', 
  statusFechado: '#5cb85c',   
};

const StatusBadge = ({ type }: { type: string }) => {
  let color = COLORS.textLight;
  let text = 'Desconhecido';
  let bg = '#EEE';
  if (type === 'ativo') { color = COLORS.statusAtivo; text = 'Aberto'; bg = '#ffebee'; }
  if (type === 'andamento') { color = COLORS.statusAndamento; text = 'Em Análise'; bg = '#fff3e0'; }
  if (type === 'fechado') { color = COLORS.statusFechado; text = 'Concluído'; bg = '#e8f5e9'; }
  return (
    <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color: color }]}>{text}</Text>
    </View>
  );
};

const SupportCard = ({ item, onPress }: { item: Ticket, onPress: (ticket: Ticket) => void }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.9}>
    <View style={styles.cardHeaderRow}>
      <View style={styles.userInfo}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.name ? item.name.charAt(0) : '?'}</Text>
        </View>
        <View>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardSubject}>{item.subject}</Text>
        </View>
      </View>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
    <View style={styles.cardDivider} />
    <View style={styles.cardFooterRow}>
      <StatusBadge type={item.type} />
      <TouchableOpacity style={styles.detailsButton} onPress={() => onPress(item)}>
        <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
        <Feather name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const DetailRow = ({ label, value, icon, isTextArea }: any) => (
  <View style={styles.detailRowContainer}>
    <View style={styles.labelRow}>
      <Ionicons name={icon} size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <View style={[styles.detailValueContainer, isTextArea && styles.textArea]}>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

type Props = DrawerScreenProps<AppDrawerParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState('ativos');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- CARREGAMENTO SIMULADO ---
  const loadDummyData = () => {
    setLoading(true);
    // Simula um delay de rede de 1 segundo para dar uma sensação realista
    setTimeout(() => {
      setTickets(DUMMY_TICKETS);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    loadDummyData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDummyData();
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'ativos') return ticket.type === 'ativo';
    if (activeTab === 'andamento') return ticket.type === 'andamento';
    if (activeTab === 'fechados') return ticket.type === 'fechado';
    return false;
  });

  const handleCardPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.logoText}>KOZZY</Text>
          <Text style={styles.subLogoText}>Distribuição & Logística</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Feather name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {['ativos', 'andamento', 'fechados'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'ativos' ? 'Abertos' : tab === 'andamento' ? 'Análise' : 'Concluídos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTickets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <SupportCard item={item} onPress={handleCardPress} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
              <>
                <Ionicons name="cube-outline" size={60} color="#CCC" />
                <Text style={styles.emptyText}>Nenhum chamado nesta lista.</Text>
              </>
            )}
          </View>
        }
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Chamado</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedTicket && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHighlight}>
                   <Text style={styles.highlightName}>{selectedTicket.name}</Text>
                   <Text style={styles.highlightProtocol}>Protocolo: #{selectedTicket.protocol}</Text>
                </View>
                <DetailRow icon="calendar-outline" label="Data" value={`${selectedTicket.date} às ${selectedTicket.time}`} />
                <DetailRow icon="business-outline" label="Segmento" value={selectedTicket.clientType} />
                <DetailRow icon="pricetag-outline" label="Departamento" value={selectedTicket.category} />
                <DetailRow icon="clipboard-outline" label="Descrição" value={selectedTicket.description} isTextArea />
                <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.actionButtonText}>Fechar</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  logoText: { fontSize: 22, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.5 },
  subLogoText: { fontSize: 12, color: '#777', fontWeight: '500' },
  menuButton: { padding: 8 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#e0e0e0', marginRight: 8, alignItems: 'center' },
  tabButtonActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: '#555' },
  tabTextActive: { color: '#FFF' },
  listContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffebee', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#333', width: 180 },
  cardSubject: { fontSize: 13, color: '#777' },
  timeText: { fontSize: 13, fontWeight: '600', color: '#555' },
  cardDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  detailsButton: { flexDirection: 'row', alignItems: 'center' },
  detailsButtonText: { fontSize: 13, color: '#777', marginRight: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '80%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  closeIcon: { padding: 5 },
  modalHighlight: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  highlightName: { fontSize: 22, fontWeight: '800', color: '#333' },
  highlightProtocol: { fontSize: 14, color: COLORS.primary, marginTop: 2, fontWeight: '600' },
  detailRowContainer: { marginBottom: 15 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  detailValueContainer: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#eee' },
  textArea: { minHeight: 80 },
  detailValue: { fontSize: 14, color: '#333', lineHeight: 20 },
  actionButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default HomeScreen;