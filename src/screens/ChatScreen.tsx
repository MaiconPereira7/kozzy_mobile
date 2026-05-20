import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView, Platform, SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { apiPost } from '../services/api';

export const ChatScreen = () => {
    const { user } = useUser();
    const navigation = useNavigation();
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // MENSAGENS INICIAIS
    const [messages, setMessages] = useState([
        { id: '1', text: `Olá, ${user?.name || 'Maicon'}! 👋\nSou a Kozzy. Como posso ajudar a Kozzy Alimentos hoje?`, type: 'bot' }
    ]);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const addMessage = (text: string, type: 'user' | 'bot') => {
        setMessages(prev => [...prev, { id: Math.random().toString(), text, type }]);
    };

    // LÓGICA DE ATENDIMENTO COM IA (GEMINI)
    const handleSend = async (override?: string) => {
        const texto = override || inputText;
        if (!texto.trim()) return;

        // Se o utilizador clicou no botão "Ver meus tickets", navega para o ecrã em vez de falar com a IA
        if (texto === 'Ver meus tickets') {
            navigation.navigate('MeusTickets' as never);
            return;
        }

        // 1. Adiciona a mensagem do utilizador ao ecrã
        addMessage(texto, 'user');
        setInputText('');
        setIsLoading(true);

        try {
            // 2. Faz o pedido ao nosso servidor Node.js
            const response = await apiPost('/chat', {
                message: texto,
                userName: user?.name || 'Maicon'
            });

            // 3. Adiciona a resposta da IA ao ecrã
            if (response && response.response) {
                addMessage(response.response, 'bot');
            } else {
                addMessage("Desculpe, não consegui compreender a resposta do servidor.", 'bot');
            }

        } catch (error: any) {
            console.error("Erro no Chat:", error);

            // Lógica para extrair a mensagem de erro real e evitar o [object Object]
            let textoErro = 'Falha na comunicação com o servidor. Verifique se o seu PC e o telemóvel estão na mesma rede Wi-Fi e se o IP está correto no ficheiro api.ts.';

            if (typeof error === 'string') {
                textoErro = error;
            } else if (error && error.message) {
                textoErro = typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
            } else if (error && error.code === 'NETWORK_ERROR') {
                textoErro = 'Sem conexão ao servidor local. Verifique o seu IP.';
            }

            addMessage(`❌ Erro: ${textoErro}`, 'bot');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>KZ</Text></View>
                        <View>
                            <Text style={styles.headerTitle}>Central Kozzy</Text>
                            <View style={styles.statusRow}><View style={styles.dot} /><Text style={styles.statusText}>Online</Text></View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
                        <Ionicons name="menu-outline" size={36} color="#FFF" />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.welcomeCard}>
                        <Text style={styles.welcomeTitle}>Olá, {user?.name || 'Maicon'}! 👋</Text>
                        <Text style={styles.welcomeBody}>Como posso ajudar a Kozzy Alimentos hoje?</Text>
                    </View>

                    <Text style={styles.sectionLabel}>OPÇÕES RÁPIDAS</Text>

                    <View style={styles.grid}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#1E1E1E' }]} onPress={() => handleSend('Gostaria de abrir um ticket para suporte.')}>
                            <Ionicons name="ticket-outline" size={24} color="#FFF" />
                            <Text style={styles.btnText}>Abrir ticket</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#334155' }]} onPress={() => handleSend('Ver meus tickets')}>
                            <Ionicons name="list-outline" size={24} color="#FFF" />
                            <Text style={styles.btnText}>Ver meus tickets</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#7E3AF2' }]} onPress={() => handleSend('Tenho um problema no meu pedido.')}>
                            <Ionicons name="cube-outline" size={24} color="#FFF" />
                            <Text style={styles.btnText}>Problema no pedido</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#057A55' }]} onPress={() => handleSend('Gostaria de falar com um consultor.')}>
                            <Ionicons name="person-outline" size={24} color="#FFF" />
                            <Text style={styles.btnText}>Falar com consultor</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.dateDivider}>hoje</Text>

                    {messages.map((msg) => (
                        <View key={msg.id} style={msg.type === 'bot' ? styles.botMsgWrapper : styles.userMsgWrapper}>
                            <View style={msg.type === 'bot' ? styles.botMsg : styles.userMsg}>
                                <Text style={msg.type === 'bot' ? styles.botMsgText : styles.userMsgText}>{msg.text}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Indicador de carregamento enquanto a IA pensa */}
                    {isLoading && (
                        <View style={styles.botMsgWrapper}>
                            <View style={[styles.botMsg, { padding: 10 }]}>
                                <ActivityIndicator size="small" color="#E01E26" />
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputArea}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Digite aqui..."
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            editable={!isLoading}
                        />
                        <TouchableOpacity onPress={() => handleSend()} disabled={isLoading}>
                            <Ionicons name="send" size={24} color={isLoading ? "#CCC" : "#E01E26"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: '#E01E26', paddingBottom: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 40 : 0, paddingHorizontal: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#FFF', fontWeight: 'bold' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 6 },
    statusText: { color: '#EEE', fontSize: 12 },
    scrollContent: { padding: 15 },
    welcomeCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
    welcomeTitle: { fontSize: 18, fontWeight: 'bold', color: '#E01E26' },
    welcomeBody: { color: '#666', marginTop: 5 },
    sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#AAA', textAlign: 'center', marginBottom: 15 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    btn: { width: '48%', height: 90, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 3 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginTop: 5 },
    dateDivider: { textAlign: 'center', color: '#CCC', marginVertical: 20, fontSize: 12 },
    botMsgWrapper: { alignSelf: 'flex-start', marginBottom: 15, maxWidth: '85%' },
    botMsg: { backgroundColor: '#FFF', padding: 15, borderRadius: 18, borderTopLeftRadius: 2, elevation: 1 },
    botMsgText: { color: '#333', fontSize: 15 },
    userMsgWrapper: { alignSelf: 'flex-end', marginBottom: 15, maxWidth: '85%' },
    userMsg: { backgroundColor: '#E01E26', padding: 15, borderRadius: 18, borderTopRightRadius: 2 },
    userMsgText: { color: '#FFF', fontSize: 15 },
    inputArea: { backgroundColor: '#FFF', padding: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: 30, paddingHorizontal: 15, height: 50 },
    input: { flex: 1, fontSize: 16 }
});

export default ChatScreen;