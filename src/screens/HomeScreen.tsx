// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TextInput, // <--- Importante para edição
  Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons'; 
import { DrawerScreenProps } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../routes/AppDrawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '../contexts/UserContext'; // <--- Importar Contexto

// --- TIPO DE DADOS ---
type Priority = 'Alta' | 'Média' | 'Baixa';

type Ticket = {
  id: string;
  name: string;
  subject: string;
  type: 'ativo' | 'andamento' | 'fechado';
  protocol: string;
  clientType: string;
  category: string;
  priority: Priority; // <--- Novo Campo
  date: string;
  time: string;
  description: string;
};

// --- DADOS FICTÍCIOS ---
const DUMMY_TICKETS: Ticket[] = [
  {
    id: '1', name: 'Padaria do João', subject: 'Atraso na entrega de farinha', type: 'ativo',
    protocol: 'KZ-2024001', clientType: 'Varejo', category: 'Logística', priority: 'Alta',
    date: '25/10/2023', time: '14:30', description: 'O cliente relata que o pedido #12345 deveria ter chegado pela manhã e ainda não foi entregue.'
  },
  {
    id: '2', name: 'Mercado Silva', subject: 'Produto veio danificado', type: 'andamento',
    protocol: 'KZ-2024002', clientType: 'Atacado', category: 'Qualidade', priority: 'Média',
    date: '24/10/2023', time: '09:15', description: 'Caixas de leite chegaram amassadas. Solicitam troca imediata.'
  },
  {
    id: '3', name: 'Restaurante Sabor', subject: 'Dúvida sobre boleto', type: 'fechado',
    protocol: 'KZ-2024003', clientType: 'Food Service', category: 'Financeiro', priority: 'Baixa',
    date: '20/10/2023', time: '16:45', description: 'Cliente não recebeu o boleto por e-mail.'
  },
  {
    id: '4', name: 'Empório Gourmet', subject: 'Novo pedido urgente', type: 'ativo',
    protocol: 'KZ-2024004', clientType: 'Varejo', category: 'Vendas', priority: 'Alta',
    date: '26/10/2023', time: '08:00', description: 'Precisa de reposição de azeites importados para evento no fim de semana.'
  },
  // ... adicione mais itens se quiser
];

const COLORS = {
  primary: '#e60023', 
  background: '#f8f8f8',
  statusAtivo: '#e60023',   
  statusAndamento: '#f0ad4e', 
  statusFechado: '#5cb85c',   
};

const StatusBadge = ({ type }: { type: string }) => {
  let color = '#777';
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

// Componente visual de Prioridade para o Card
const PriorityBadge = ({ priority }: { priority?: Priority }) => {
  const p = priority || 'Média';
  let color = '#777';
  let bg = '#eee';
  if(p === 'Alta') { color = '#d9534f'; bg = '#fde8e8'; }
  if(p === 'Média') { color = '#f0ad4e'; bg = '#fff7e6'; }
  if(p === 'Baixa') { color = '#5cb85c'; bg = '#e8f5e9'; }

  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' }}>
      <Text style={{ color: color, fontSize: 10, fontWeight: 'bold' }}>{p.toUpperCase()}</Text>
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
          {/* Exibe a prioridade no card */}
          <PriorityBadge priority={item.priority} />
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

type Props = DrawerScreenProps<AppDrawerParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { user } = useContext(UserContext); // Pegamos o user para verificar o papel
  const [activeTab, setActiveTab] = useState('ativos');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Estados para edição (Só o Supervisor usa)
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('Média');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDummyData = () => {
    setLoading(true);
    setTimeout(() => {
      // Garante que os dados tenham prioridade
      const data = DUMMY_TICKETS.map(t => ({...t, priority: t.priority || 'Média'}));
      setTickets(data as Ticket[]);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => { loadDummyData(); }, []);
  const onRefresh = () => { setRefreshing(true); loadDummyData(); };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'ativos') return ticket.type === 'ativo';
    if (activeTab === 'andamento') return ticket.type === 'andamento';
    if (activeTab === 'fechados') return ticket.type === 'fechado';
    return false;
  });

  const handleCardPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    // Preenche os campos de edição
    setEditCategory(ticket.category);
    setEditPriority(ticket.priority);
    setModalVisible(true);
  };

  const handleSaveSupervisor = () => {
    if (!selectedTicket) return;

    // Atualiza localmente
    const newTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, category: editCategory, priority: editPriority };
      }
      return t;
    });

    setTickets(newTickets);
    setModalVisible(false);
    Alert.alert("Sucesso", "Chamado atualizado pelo Supervisor!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.logoText}>KOZZY</Text>
          <Text style={styles.subLogoText}>
            {user.role === 'supervisor' ? 'Painel do Supervisor' : 'Distribuição & Logística'}
          </Text>
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
              <Text style={styles.emptyText}>Nenhum chamado nesta lista.</Text>
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

                {/* VISUALIZAÇÃO DATA */}
                <View style={styles.detailRowContainer}>
                   <View style={styles.labelRow}><Ionicons name="calendar-outline" size={18} color={COLORS.primary} /><Text style={styles.detailLabel}> Data</Text></View>
                   <View style={styles.detailValueContainer}><Text style={styles.detailValue}>{selectedTicket.date} às {selectedTicket.time}</Text></View>
                </View>

                {/* PRIORIDADE - EDITÁVEL PARA SUPERVISOR */}
                <View style={styles.detailRowContainer}>
                   <View style={styles.labelRow}><Ionicons name="alert-circle-outline" size={18} color={COLORS.primary} /><Text style={styles.detailLabel}> Prioridade</Text></View>
                   
                   {user.role === 'supervisor' ? (
                     <View style={styles.prioritySelector}>
                       {['Alta', 'Média', 'Baixa'].map((p) => (
                         <TouchableOpacity 
                           key={p} 
                           onPress={() => setEditPriority(p as Priority)}
                           style={[
                             styles.priorityOption, 
                             editPriority === p && { backgroundColor: p === 'Alta' ? '#ffebee' : p === 'Média' ? '#fff3e0' : '#e8f5e9', borderWidth: 1, borderColor: p === 'Alta' ? '#d9534f' : p === 'Média' ? '#f0ad4e' : '#5cb85c' }
                           ]}
                         >
                           <Text style={[styles.priorityText, editPriority === p && { fontWeight: 'bold', color: '#333' }]}>{p}</Text>
                         </TouchableOpacity>
                       ))}
                     </View>
                   ) : (
                     <View style={styles.detailValueContainer}><Text style={styles.detailValue}>{selectedTicket.priority}</Text></View>
                   )}
                </View>

                {/* DEPARTAMENTO - EDITÁVEL PARA SUPERVISOR */}
                <View style={styles.detailRowContainer}>
                   <View style={styles.labelRow}><Ionicons name="pricetag-outline" size={18} color={COLORS.primary} /><Text style={styles.detailLabel}> Departamento</Text></View>
                   {user.role === 'supervisor' ? (
                     <TextInput 
                       style={styles.inputEdit} 
                       value={editCategory} 
                       onChangeText={setEditCategory}
                       placeholder="Editar departamento"
                     />
                   ) : (
                     <View style={styles.detailValueContainer}><Text style={styles.detailValue}>{selectedTicket.category}</Text></View>
                   )}
                </View>

                {/* DESCRIÇÃO - APENAS LEITURA */}
                <View style={styles.detailRowContainer}>
                   <View style={styles.labelRow}><Ionicons name="clipboard-outline" size={18} color={COLORS.primary} /><Text style={styles.detailLabel}> Descrição</Text></View>
                   <View style={[styles.detailValueContainer, styles.textArea]}><Text style={styles.detailValue}>{selectedTicket.description}</Text></View>
                </View>

                {user.role === 'supervisor' && (
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#005bea' }]} onPress={handleSaveSupervisor}>
                    <Text style={styles.actionButtonText}>Salvar Alterações</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.actionButton, user.role === 'supervisor' && { backgroundColor: '#ccc', marginTop: 10 }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.actionButtonText}>{user.role === 'supervisor' ? 'Cancelar' : 'Fechar'}</Text>
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
  
  // ESTILOS NOVOS PARA O SUPERVISOR
  inputEdit: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 14, color: '#333' },
  prioritySelector: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  priorityOption: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#f0f0f0' },
  priorityText: { color: '#666' }
});

export default HomeScreen;