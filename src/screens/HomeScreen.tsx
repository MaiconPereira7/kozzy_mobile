// src/screens/HomeScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal, // 1. <<< MUDANÇA: Importar Modal
  Pressable, // 2. <<< MUDANÇA: Importar Pressable (para o botão 'X')
  ScrollView, // 3. <<< MUDANÇA: Importar ScrollView (para os detalhes)
} from 'react-native';

// Ícones que vamos usar
import Feather from 'react-native-vector-icons/Feather';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

// 4. <<< MUDANÇA >>> Importar os tipos do Drawer
import { DrawerScreenProps } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../routes/AppDrawer'; // O tipo que criamos
import { SafeAreaView as InsetSafeAreaView } from 'react-native-safe-area-context';

// Define o "formato" (shape) de um ticket para o TypeScript
type Ticket = {
  id: string;
  name: string;
  subject: string;
  type: 'ativo' | 'andamento' | 'fechado';
  // Adicionando campos extras para o modal (podemos usar mock data)
  protocol: string;
  clientType: string;
  category: string;
  date: string;
  time: string;
  description: string;
};

// --- Dados Mock (agora com mais detalhes) ---
const mockTickets: Ticket[] = [
  { 
    id: '1', name: 'Dareine Roberston', subject: 'Pedido #4567 não foi entregue', type: 'ativo',
    protocol: '10234', clientType: 'Pessoa Física', category: 'Entrega',
    date: '15/01/2024', time: '14:30', description: 'Problema de conexão com a internet, cliente relatando lentidão. Já foi tentado reiniciar o modem.'
  },
  { 
    id: '2', name: 'Ronald Richards', subject: 'Pedido #4567 não foi entregue', type: 'ativo',
    protocol: '10235', clientType: 'Pessoa Jurídica', category: 'Suporte Técnico',
    date: '16/01/2024', time: '09:15', description: 'Cliente informa que o sistema de pedidos está offline.'
  },
  { 
    id: '3', name: 'Robert Fox', subject: 'Protocolo: #2778', type: 'ativo',
    protocol: '2778', clientType: 'Revendedor', category: 'Financeiro',
    date: '17/01/2024', time: '11:00', description: 'Dúvida sobre a fatura de Janeiro.'
  },
  // ... (outros tickets) ...
];

// --- Componente do Card ---
// 5. <<< MUDANÇA: Adicionamos a prop 'onPress' >>>
const SupportCard = ({ item, onPress }: { item: Ticket, onPress: (ticket: Ticket) => void }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle}>{item.subject}</Text>
    </View>
    <SimpleLineIcons name="arrow-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

// --- Componente de Linha de Detalhe (para o Modal) ---
const DetailRow = ({ label, value, isTextArea = false }: { label: string, value: string, isTextArea?: boolean }) => (
  <View style={styles.detailRowContainer}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={[styles.detailValueContainer, isTextArea && styles.detailValueTextArea]}>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

// --- Props da Tela ---
type Props = DrawerScreenProps<AppDrawerParamList, 'Home'>;

// --- Componente Principal da Tela ---
const HomeScreen = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState('ativos');
  
  // 6. <<< MUDANÇA: Estados para controlar o Modal >>>
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // ... (lógica de filtragem continua igual) ...
  const statusConfig = {
    ativos: { text: 'Ativo', color: '#e60023' }, 
    andamento: { text: 'Andamento', color: '#f0ad4e' },
    fechados: { text: 'Fechados', color: '#5cb85c' },
  };
  const currentStatus = statusConfig[activeTab as keyof typeof statusConfig];
  const filteredTickets = mockTickets.filter(ticket => {
    switch (activeTab) {
      case 'ativos': return ticket.type === 'ativo';
      case 'andamento': return ticket.type === 'andamento';
      case 'fechados': return ticket.type === 'fechado';
      default: return false;
    }
  });

  // 7. <<< MUDANÇA: Função para abrir o modal >>>
  const handleCardPress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  return (
    <InsetSafeAreaView style={styles.safeArea}>
      {/* ... (Seu Header continua igual) ... */}
      <View style={styles.header}>
        <Text style={styles.logoText}>KOZZY</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Feather name="menu" style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      {/* ... (Seus Controles e Tabs continuam iguais) ... */}
      <View style={styles.controlsContainer}>
        <Text style={styles.pageTitle}>Central de Atendimento</Text>
        <View style={styles.segmentedControl}>
          {/* ... (Botões de Tab) ... */}
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'ativos' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('ativos')}
          >
            <Text style={[styles.segmentButtonText, activeTab === 'ativos' && styles.segmentButtonTextActive]}>
              Ativos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'andamento' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('andamento')}
          >
            <Text style={[styles.segmentButtonText, activeTab === 'andamento' && styles.segmentButtonTextActive]}>
              Andamento
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'fechados' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('fechados')}
          >
            <Text style={[styles.segmentButtonText, activeTab === 'fechados' && styles.segmentButtonTextActive]}>
              Fechados
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ... (Seu Status e Lista Vazia continuam iguais) ... */}
      {filteredTickets.length > 0 && (
        <View style={styles.activeStatus}>
          <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
          <Text style={styles.statusText}>{currentStatus.text}</Text>
        </View>
      )}
      {filteredTickets.length === 0 && (
         <View style={styles.emptyListContainer}>
           <Text style={styles.emptyListText}>Nenhum chamado nesta categoria.</Text>
         </View>
      )}

      {/* 8. <<< MUDANÇA: A FlatList agora usa a nova 'onPress' >>> */}
      {filteredTickets.length > 0 && (
        <FlatList
          data={filteredTickets}
          renderItem={({ item }) => (
            <SupportCard item={item} onPress={handleCardPress} />
          )}
          keyExtractor={item => item.id}
          style={styles.cardList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* 9. <<< MUDANÇA: O MODAL DE DETALHES FOI ADICIONADO AQUI >>> */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Cabeçalho do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Chamado</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#ffffff" />
              </Pressable>
            </View>

            {/* Corpo do Modal */}
            {selectedTicket && (
              <ScrollView style={styles.modalBody}>
                <DetailRow label="Nº do Protocolo *" value={selectedTicket.protocol} />
                <DetailRow label="Tipo de Cliente *" value={selectedTicket.clientType} />
                <DetailRow label="Categoria do Assunto *" value={selectedTicket.category} />
                <DetailRow label="Data do Atendimento *" value={selectedTicket.date} />
                <DetailRow label="Horário *" value={selectedTicket.time} />
                <DetailRow 
                  label="Descrição Detalhada" 
                  value={selectedTicket.description} 
                  isTextArea={true} 
                />
              </ScrollView>
            )}
            
            {/* Rodapé do Modal (apenas para fechar) */}
            <View style={styles.modalFooter}>
               <TouchableOpacity 
                 style={[styles.modalButton, styles.closeButton]} 
                 onPress={() => setModalVisible(false)}
               >
                 <Text style={styles.modalButtonText}>Fechar</Text>
               </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </InsetSafeAreaView>
  );
};

// --- Folha de Estilos (com os novos estilos do Modal) ---
const styles = StyleSheet.create({
  // ... (Estilos antigos da HomeScreen continuam aqui) ...
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoText: { 
    fontSize: 22,
    fontWeight: '700',
    color: '#e60023', 
    letterSpacing: -0.5,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 15, 
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#ebebeb',
    borderRadius: 10,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#e60023',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
  },
  segmentButtonTextActive: {
    color: '#ffffff',
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    backgroundColor: '#f8f8f8',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyListText: {
    fontSize: 14,
    color: '#777',
  },
  cardList: {
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#777',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#ccc',
    marginLeft: 10,
  },

  // 10. <<< MUDANÇA: NOVOS ESTILOS PARA O MODAL >>>
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escurecido
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden', // Para forçar o borderRadius no header
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e60023', // Vermelho do header
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalBody: {
    padding: 20,
  },
  detailRowContainer: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailValueContainer: {
    backgroundColor: '#f0f0f0', // Fundo cinza claro
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailValueTextArea: {
    minHeight: 100, // Para a descrição
  },
  detailValue: {
    fontSize: 15,
    color: '#555',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;