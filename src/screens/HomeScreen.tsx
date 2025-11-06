import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';

// Ícones que vamos usar
import Feather from 'react-native-vector-icons/Feather';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

// Define o "formato" (shape) de um ticket para o TypeScript
type Ticket = {
  id: string;
  name: string;
  subject: string;
  type: 'ativo' | 'andamento' | 'fechado';
};

// --- Dados Mock (agora "tipado") ---
const mockTickets: Ticket[] = [
  { id: '1', name: 'Dareine Roberston', subject: 'Assurto. Pedido #4567 não foi entregue', type: 'ativo' },
  { id: '2', name: 'Ronald Richards', subject: 'Assurto. Pedido #4567 não foi entregue', type: 'ativo' },
  { id: '3', name: 'Robert Fox', subject: 'Protocolo: #2778', type: 'ativo' },
  { id: '4', name: 'Cliente em Atendimento', subject: 'Protocolo: #1001', type: 'andamento' },
  { id: '5', name: 'Antigo Cliente', subject: 'Problema resolvido', type: 'fechado' },
];

// --- Componente do Card (agora "tipado") ---
const SupportCard = ({ item }: { item: Ticket }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle}>{item.subject}</Text>
    </View>
    <SimpleLineIcons name="arrow-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

// --- Componente Principal da Tela ---
const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('ativos');

  // <<< MUDANÇA: Objeto de configuração para o status dinâmico >>>
  // Mapeia o estado 'activeTab' para as cores e textos corretos
  const statusConfig = {
    ativos: { text: 'Ativo', color: '#e60023' }, // Vermelho
    andamento: { text: 'Andamento', color: '#f0ad4e' }, // Amarelo/Laranja
    fechados: { text: 'Fechados', color: '#5cb85c' }, // Verde
  };
  
  // Pega a configuração atual baseada na aba ativa
const currentStatus = statusConfig[activeTab as keyof typeof statusConfig];
  const filteredTickets = mockTickets.filter(ticket => {
    switch (activeTab) {
      case 'ativos': return ticket.type === 'ativo';
      case 'andamento': return ticket.type === 'andamento';
      case 'fechados': return ticket.type === 'fechado';
      default: return false;
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Cabeçalho (Com logo de TEXTO) */}
      <View style={styles.header}>
        <Text style={styles.logoText}>KOZZY</Text>
        <TouchableOpacity>
          <Feather name="menu" style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      {/* 2. Título da Página e Tabs (Fundidos) */}
      <View style={styles.controlsContainer}> 
        <Text style={styles.pageTitle}>Central de Atendimento</Text>

        <View style={styles.segmentedControl}>
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

      {/* <<< MUDANÇA: Status agora é dinâmico e condicional >>> */}
      {/* 3. Status (Dinâmico) */}
      {/* Só mostramos o status se houver tickets para exibir */}
      {filteredTickets.length > 0 && (
        <View style={styles.activeStatus}>
          {/* A cor da bolinha vem do 'currentStatus.color' */}
          <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
          {/* O texto vem do 'currentStatus.text' */}
          <Text style={styles.statusText}>{currentStatus.text}</Text>
        </View>
      )}
      
      {/* 3.1. Placeholder para listas vazias */}
      {filteredTickets.length === 0 && (
         <View style={styles.emptyListContainer}>
           <Text style={styles.emptyListText}>Nenhum chamado nesta categoria.</Text>
         </View>
      )}

      {/* 4. Lista de Cards */}
      {filteredTickets.length > 0 && (
        <FlatList
          data={filteredTickets}
          renderItem={SupportCard}
          keyExtractor={item => item.id}
          style={styles.cardList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

// --- Folha de Estilos (StyleSheet) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  // 1. Header
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
  
  // 2. Container de Controles (Título + Tabs)
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

  // 3. Controle Segmentado
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

  // 4. Status
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
    // <<< MUDANÇA: O 'backgroundColor' estático foi removido daqui >>>
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  // 4.1. Lista Vazia
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyListText: {
    fontSize: 14,
    color: '#777',
  },
  // 5. Lista de Cards
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
});

export default HomeScreen;