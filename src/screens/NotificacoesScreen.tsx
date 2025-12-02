// src/screens/NotificacoesScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Vibration, 
  Platform,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons'; 

// --- DADOS FICTÍCIOS DE HISTÓRICO (SOMENTE STATUS DE PEDIDOS) ---
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Pedido #KZ-1001 Recebido', body: 'Seu novo pedido foi criado e está com status "Em Aberto".', time: 'Há 5 min', icon: 'clipboard-outline', color: '#2196F3', read: false },
  { id: '2', title: 'Pedido #KZ-0998 Em Análise', body: 'Estamos verificando a disponibilidade dos itens solicitados.', time: 'Há 30 min', icon: 'search-outline', color: '#FF9800', read: false },
  { id: '3', title: 'Pedido #KZ-0995 Concluído', body: 'O processo deste pedido foi finalizado com sucesso.', time: 'Há 2 horas', icon: 'checkmark-done-outline', color: '#4CAF50', read: true },
  { id: '4', title: 'Pedido #KZ-1002 Recebido', body: 'Novo pedido registrado no sistema.', time: 'Há 3 horas', icon: 'clipboard-outline', color: '#2196F3', read: true },
  { id: '5', title: 'Manutenção Programada', body: 'O sistema ficará instável domingo às 03:00 para melhorias.', time: 'Ontem', icon: 'settings-outline', color: '#607D8B', read: true },
  { id: '6', title: 'Pedido #KZ-0990 Em Análise', body: 'Pedido sob revisão da equipe comercial.', time: 'Ontem', icon: 'search-outline', color: '#FF9800', read: true },
  { id: '7', title: 'Pedido #KZ-0988 Concluído', body: 'Histórico de pedido atualizado para fechado.', time: '25/10', icon: 'checkmark-done-outline', color: '#4CAF50', read: true },
  { id: '8', title: 'Bem-vindo ao App!', body: 'Sua conta foi configurada. Comece a gerenciar seus pedidos.', time: '20/10', icon: 'person-outline', color: '#e60023', read: true },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificacoesScreen() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'settings'>('inbox');
  
  // Configurações Globais
  const [somAtivo, setSomAtivo] = useState(true);
  const [bannerAtivo, setBannerAtivo] = useState(true);
  const [vibracaoAtiva, setVibracaoAtiva] = useState(true);

  // Categorias
  const [catPedidos, setCatPedidos] = useState(true);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('kozzy-alertas', {
          name: 'Kozzy Alertas',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      await loadSettings();
    } catch (error) {
      console.log("Erro no setup:", error);
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const som = await AsyncStorage.getItem('@notif_som');
      const banner = await AsyncStorage.getItem('@notif_banner');
      const vibracao = await AsyncStorage.getItem('@notif_vibracao');
      
      if (som !== null) setSomAtivo(JSON.parse(som));
      if (banner !== null) setBannerAtivo(JSON.parse(banner));
      if (vibracao !== null) setVibracaoAtiva(JSON.parse(vibracao));
      
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async (key: string, val: boolean, setter: any) => {
    setter(val);
    await AsyncStorage.setItem(key, JSON.stringify(val));
  };

  const handleTestar = async () => {
    if (vibracaoAtiva) Vibration.vibrate(400); 
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Teste Kozzy 🔔",
        body: `Status do Pedido atualizado para: Em Análise`,
      },
      trigger: null,
    });
  };

  const renderInbox = () => (
    <FlatList
      data={MOCK_NOTIFICATIONS}
      keyExtractor={item => item.id}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma notificação recente.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.notifCard, !item.read && styles.unreadCard]}>
          <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon as any} size={22} color={item.color} />
          </View>
          <View style={styles.notifContent}>
            <View style={styles.notifHeader}>
              <Text style={[styles.notifTitle, !item.read && styles.unreadText]}>{item.title}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      )}
    />
  );

  const renderSettings = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Geral</Text>
      <View style={styles.sectionCard}>
        <SettingRow 
          icon="volume-high" color="#2196F3" label="Sons" 
          val={somAtivo} 
          onToggle={(v: boolean) => toggleSwitch('@notif_som', v, setSomAtivo)} 
        />
        <Divider />
        <SettingRow 
          icon="notifications" color="#FF9800" label="Banners" 
          val={bannerAtivo} 
          onToggle={(v: boolean) => toggleSwitch('@notif_banner', v, setBannerAtivo)} 
        />
        <Divider />
        <SettingRow 
          icon="phone-portrait" color="#9C27B0" label="Vibração" 
          val={vibracaoAtiva} 
          onToggle={(v: boolean) => toggleSwitch('@notif_vibracao', v, setVibracaoAtiva)} 
        />
      </View>

      <Text style={styles.sectionTitle}>Categorias</Text>
      <View style={styles.sectionCard}>
        <SettingRow 
          icon="cube" color="#4CAF50" label="Status dos Pedidos" sub="Aberto, Análise e Concluído"
          val={catPedidos} onToggle={setCatPedidos} 
        />
      </View>

      <TouchableOpacity style={styles.testButton} onPress={handleTestar}>
        <Text style={styles.testButtonText}>Simular Notificação</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator color="#e60023"/></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Central de Avisos</Text>
      </View>

      {/* ABAS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'inbox' && styles.activeTab]} 
          onPress={() => setActiveTab('inbox')}
        >
          <Text style={[styles.tabText, activeTab === 'inbox' && styles.activeTabText]}>Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'settings' && styles.activeTab]} 
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Configurar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'inbox' ? renderInbox() : renderSettings()}
      </View>
    </View>
  );
}

// Subcomponentes
const SettingRow = ({ icon, color, label, sub, val, onToggle }: any) => (
  <View style={styles.row}>
    <View style={styles.labelContainer}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={styles.label}>{label}</Text>
        {sub && <Text style={styles.subLabel}>{sub}</Text>}
      </View>
    </View>
    <Switch trackColor={{ false: "#E0E0E0", true: "#4CAF50" }} thumbColor={"#FFF"} onValueChange={onToggle} value={val} />
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { paddingHorizontal: 20, marginBottom: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  
  // Abas
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: '#E0E0E0', borderRadius: 10, padding: 3 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#FFF', elevation: 2 },
  tabText: { fontWeight: '600', color: '#757575' },
  activeTabText: { color: '#e60023' },

  contentContainer: { flex: 1, paddingHorizontal: 20 },

  // Inbox Styles
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },
  notifCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: '#e60023' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { fontWeight: '600', color: '#333', fontSize: 15, flex: 1, marginRight: 8 },
  unreadText: { fontWeight: 'bold', color: '#000' },
  notifTime: { fontSize: 11, color: '#999', marginTop: 2 },
  notifBody: { color: '#666', fontSize: 13, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e60023', marginTop: 6, marginLeft: 6 },

  // Settings Styles
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#999', marginBottom: 10, marginTop: 10, textTransform: 'uppercase' },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 5, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  label: { fontSize: 16, fontWeight: '500', color: '#333' },
  subLabel: { fontSize: 12, color: '#999' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 64 },
  
  testButton: { marginTop: 20, backgroundColor: '#e60023', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 40 },
  testButtonText: { color: '#FFF', fontWeight: 'bold' }
});