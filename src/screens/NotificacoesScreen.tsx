// src/screens/NotificacoesScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Vibration, // <--- Importamos a Vibração Nativa do celular
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons'; 

// Configuração Inicial do Handler
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
  
  const [somAtivo, setSomAtivo] = useState(true);
  const [bannerAtivo, setBannerAtivo] = useState(true);
  const [vibracaoAtiva, setVibracaoAtiva] = useState(true);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      // 1. Pedir Permissão
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert("Erro", "Permissão de notificação negada!");
      }

      // 2. Configurar Canal (CRUCIAL PARA ANDROID TOCAR SOM)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('kozzy-alertas', {
          name: 'Kozzy Alertas',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default', // Garante som padrão
          enableVibrate: true,
        });
      }

      // 3. Carregar Configurações Salvas
      await loadSettings();

    } catch (error) {
      console.log("Erro no setup:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const som = await AsyncStorage.getItem('@notif_som');
      const banner = await AsyncStorage.getItem('@notif_banner');
      const vibracao = await AsyncStorage.getItem('@notif_vibracao');

      const isSom = som !== null ? JSON.parse(som) : true;
      const isBanner = banner !== null ? JSON.parse(banner) : true;
      const isVibra = vibracao !== null ? JSON.parse(vibracao) : true;

      setSomAtivo(isSom);
      setBannerAtivo(isBanner);
      setVibracaoAtiva(isVibra);
      
      atualizarHandler(isSom, isBanner);
    } catch (e) { 
      setLoading(false); 
    } finally {
      setLoading(false);
    }
  };

  const atualizarHandler = (som: boolean, banner: boolean) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: banner, 
        shouldShowList: true,     
        shouldPlaySound: som,     
        shouldSetBadge: false,
      }),
    });
  };

  // --- SWITCHES ---
  const toggleSom = async () => {
    const novoValor = !somAtivo;
    if (novoValor === true && bannerAtivo === false) {
      Alert.alert("Aviso", "Ative o Banner Visual primeiro.");
      return;
    }
    setSomAtivo(novoValor);
    await AsyncStorage.setItem('@notif_som', JSON.stringify(novoValor));
    atualizarHandler(novoValor, bannerAtivo);
  };

  const toggleBanner = async () => {
    const novoValorBanner = !bannerAtivo;
    setBannerAtivo(novoValorBanner);
    
    let novoValorSom = somAtivo;
    if (novoValorBanner === false) {
      novoValorSom = false;
      setSomAtivo(false);
      await AsyncStorage.setItem('@notif_som', JSON.stringify(false));
    }
    await AsyncStorage.setItem('@notif_banner', JSON.stringify(novoValorBanner));
    atualizarHandler(novoValorSom, novoValorBanner);
  };

  const toggleVibracao = async () => {
    const novoValor = !vibracaoAtiva;
    setVibracaoAtiva(novoValor);
    await AsyncStorage.setItem('@notif_vibracao', JSON.stringify(novoValor));
  };

  // --- FUNÇÃO DE TESTE BLINDADA ---
  const handleTestar = async () => {
    // TRUQUE 1: Vibração Física Imediata (Ignora configurações de notificação)
    // Se o celular não tremer aqui, é problema de hardware ou modo silencioso total.
    if (vibracaoAtiva) {
      Vibration.vibrate(400); 
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Kozzy Alerta 🔔",
          body: `Som: ${somAtivo ? 'ON' : 'OFF'} | Banner: ${bannerAtivo ? 'ON' : 'OFF'}`,
          sound: somAtivo, // Reforça pedido de som
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Preferências</Text>
        <Text style={styles.subHeader}>Gerencie como a Kozzy fala com você.</Text>
      </View>

      <View style={styles.sectionCard}>
        
        {/* SOM */}
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="volume-high" size={22} color="#2196F3" />
            </View>
            <View>
              <Text style={styles.label}>Sons</Text>
              <Text style={styles.subLabel}>Tocar som ao receber avisos</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
            thumbColor={"#FFF"}
            onValueChange={toggleSom}
            value={somAtivo}
            disabled={!bannerAtivo} 
          />
        </View>

        <View style={styles.divider} />

        {/* BANNER */}
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="notifications" size={22} color="#FF9800" />
            </View>
            <View>
              <Text style={styles.label}>Banners</Text>
              <Text style={styles.subLabel}>Mostrar no topo da tela</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
            thumbColor={"#FFF"}
            onValueChange={toggleBanner}
            value={bannerAtivo}
          />
        </View>

        <View style={styles.divider} />

        {/* VIBRAÇÃO */}
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="phone-portrait" size={22} color="#9C27B0" />
            </View>
            <View>
              <Text style={styles.label}>Vibração</Text>
              <Text style={styles.subLabel}>Vibrar o dispositivo</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
            thumbColor={"#FFF"}
            onValueChange={toggleVibracao}
            value={vibracaoAtiva}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleTestar}
        activeOpacity={0.8}
      >
        <Ionicons name="paper-plane-outline" size={20} color="#FFF" style={{ marginRight: 10 }} />
        <Text style={styles.buttonText}>Enviar Notificação de Teste</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        * Verifique se a chave lateral do iPhone não está laranja (silencioso).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', 
    paddingHorizontal: 20, 
    paddingTop: 70,       
  },
  center: {
    justifyContent: 'center', 
    alignItems: 'center'
  },
  headerContainer: {
    marginTop: 10,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subHeader: {
    fontSize: 15,
    color: '#757575',
    marginTop: 5,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 70, 
  },
  button: {
    backgroundColor: '#1A1A1A', 
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  footerNote: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 40,
    color: '#CCC',
    fontSize: 12,
  }
});