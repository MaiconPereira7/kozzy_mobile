// src/screens/HomeScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';

// Ícones
import Feather from 'react-native-vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons'; 

// Tipos
import { DrawerScreenProps } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../routes/AppDrawer';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- TIPAGEM ---
type Ticket = {
  id: string;
  name: string; // Nome do Mercado/Cliente
  subject: string; // Assunto Principal
  type: 'ativo' | 'andamento' | 'fechado';
  protocol: string;
  clientType: string; // Ex: Varejo, Atacado, Restaurante
  category: string; // Ex: Logística, Financeiro
  date: string;
  time: string;
  description: string;
};

// --- DADOS MOCK (AGORA: DISTRIBUIDORA DE ALIMENTOS) ---
const mockTickets: Ticket[] = [
  { 
    id: '1', 
    name: 'Mercado Preço Bom', 
    subject: 'Atraso na Entrega #4092', 
    type: 'ativo',
    protocol: '2025-8891', 
    clientType: 'Varejo (Supermercado)', 
    category: 'Logística',
    date: '19/11/2025', 
    time: '08:15', 
    description: 'Cliente relatou que o caminhão não chegou no horário agendado. Precisa da mercadoria antes do meio-dia para reposição.'
  },
  { 
    id: '2', 
    name: 'Padaria Doce Sabor', 
    subject: 'Avaria em Carga (Farinha)', 
    type: 'ativo',
    protocol: '2025-8895', 
    clientType: 'Padaria/Confeitaria', 
    category: 'Qualidade/Troca',
    date: '19/11/2025', 
    time: '09:30', 
    description: '3 Sacos de farinha chegaram rasgados no lote da manhã. Motorista já registrou no canhoto, cliente pede reposição urgente.'
  },
  { 
    id: '3', 
    name: 'Restaurante Sabor & Arte', 
    subject: '2ª Via de Boleto', 
    type: 'andamento',
    protocol: '2025-8700', 
    clientType: 'Food Service', 
    category: 'Financeiro',
    date: '19/11/2025', 
    time: '10:45', 
    description: 'Financeiro já está gerando o boleto atualizado com a nova data de vencimento.'
  },
  { 
    id: '4', 
    name: 'Empório Silva', 
    subject: 'Pedido Entregue', 
    type: 'fechado',
    protocol: '2025-8650', 
    clientType: 'Mercearia', 
    category: 'Comercial',
    date: '18/11/2025', 
    time: '16:20', 
    description: 'Pedido #4050 entregue e conferido. Nota fiscal assinada sem ressalvas.'
  }
];

// --- CORES DA KOZZY ---
const COLORS = {
  primary: '#e60023', // Vermelho Kozzy
  background: '#f8f8f8',
  cardBg: '#ffffff',
  textMain: '#333',
  textLight: '#777',
  // Cores de Status
  statusAtivo: '#e60023',   // Vermelho (Urgente/Aberto)
  statusAndamento: '#f0ad4e', // Laranja
  statusFechado: '#5cb85c',   // Verde
};

// --- COMPONENTES AUXILIARES ---

const StatusBadge = ({ type }: { type: string }) => {
  let color = COLORS.textLight;
  let text = 'Desconhecido';
  let bg = '#EEE';

  if (type === 'ativo') { 
    color = COLORS.statusAtivo; 
    text = 'Aberto'; 
    bg = '#ffebee'; 
  }
  if (type === 'andamento') { 
    color = COLORS.statusAndamento; 
    text = 'Em Análise'; 
    bg = '#fff3e0'; 
  }
  if (type === 'fechado') { 
    color = COLORS.statusFechado; 
    text = 'Concluído'; 
    bg = '#e8f5e9'; 
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color: color }]}>{text}</Text>
    </View>
  );
};

const SupportCard = ({ item, onPress }: { item: Ticket, onPress: (ticket: Ticket) => void }) => (
  <TouchableOpacity 
    style={styles.card} 
    onPress={() => onPress(item)}
    activeOpacity={0.9}
  >
    <View style={styles.cardHeaderRow}>
      <View style={styles.userInfo}>
        <View style={styles.avatarCircle}>
          {/* Inicial do Mercado/Empresa */}
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
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

// --- TELA PRINCIPAL ---
type Props = DrawerScreenProps<AppDrawerParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState('ativos');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filteredTickets = mockTickets.filter(ticket => {
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
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.openDrawer()}
        >
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum chamado nesta lista.</Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
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

                <DetailRow icon="calendar-outline" label="Data de Abertura" value={`${selectedTicket.date} às ${selectedTicket.time}`} />
                <DetailRow icon="business-outline" label="Segmento" value={selectedTicket.clientType} />
                <DetailRow icon="pricetag-outline" label="Departamento" value={selectedTicket.category} />
                <DetailRow icon="clipboard-outline" label="Descrição da Ocorrência" value={selectedTicket.description} isTextArea />

                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => setModalVisible(false)}
                >
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary, 
    letterSpacing: -0.5,
  },
  subLogoText: {
    fontSize: 12,
    color: '#777',
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary, 
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  tabTextActive: {
    color: '#FFF',
  },
  // Lista
  listContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  // CARD
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffebee', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary, 
  },
  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    width: 180, // Limita largura para não quebrar layout
  },
  cardSubject: {
    fontSize: 13,
    color: '#777',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Badge
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 13,
    color: '#777',
    marginRight: 2,
  },
  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIcon: {
    padding: 5,
  },
  modalHighlight: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  highlightName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  highlightProtocol: {
    fontSize: 14,
    color: COLORS.primary, 
    marginTop: 2,
    fontWeight: '600',
  },
  detailRowContainer: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  detailValueContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: {
    minHeight: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary, 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;