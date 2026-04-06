import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { BORDER_RADIUS, COLORS, SPACING } from '../theme';

interface Message {
    id: string;
    text: string;
    type: 'bot' | 'user';
    time: string;
}

export const ChatScreen = () => {
    const { user } = useUser();
    const navigation = useNavigation();
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Olá, ${user?.name || 'Maicon'}! Como posso ajudar a Kozzy hoje?`,
            type: 'bot',
            time: '13:53'
        }
    ]);

    const handleSend = () => {
        if (inputText.trim() === '') return;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            type: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([...messages, newMessage]);
        setInputText('');
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: "Entendi! Estou processando sua solicitação...",
                type: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        }, 1000);
    };

    // Componente interno para os botões do grid
    const QuickButton = ({ title, icon, color }: { title: string, icon: any, color: string }) => (
        <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: color }]}
            onPress={() => setInputText(title)}
        >
            <Ionicons name={icon} size={24} color={COLORS.white} />
            <Text style={styles.quickBtnText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* TOPO VERMELHO UNIFICADO */}
            <View style={styles.customHeader}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>KZ</Text>
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Central Kozzy</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Online</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        style={styles.menuBtn}
                    >
                        <Ionicons name="menu-outline" size={32} color={COLORS.white} />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.welcomeCard}>
                        <Text style={styles.welcomeTitle}>Olá, {user?.name || 'Maicon'}! 👋</Text>
                        <Text style={styles.welcomeBody}>
                            Sou a Kozzy, sua assistente virtual. Escolha uma das opções abaixo:
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>O QUE VOCÊ PRECISA?</Text>

                    {/* AS 4 OPÇÕES VOLTARAM AQUI (GRID 2x2) */}
                    <View style={styles.grid}>
                        <QuickButton title="Abrir ticket" icon="ticket-outline" color="#222" />
                        <QuickButton title="Ver tickets" icon="list-outline" color="#2C3E50" />
                        <QuickButton title="Problema pedido" icon="cube-outline" color="#C0392B" />
                        <QuickButton title="Consultor" icon="person-outline" color="#16A085" />
                    </View>

                    <View style={styles.divider}><Text style={styles.dividerText}>hoje</Text></View>

                    {messages.map((msg) => (
                        <View key={msg.id} style={msg.type === 'bot' ? styles.botMsgWrapper : styles.userMsgWrapper}>
                            <View style={msg.type === 'bot' ? styles.botMsg : styles.userMsg}>
                                <Text style={msg.type === 'bot' ? styles.botMsgText : styles.userMsgText}>{msg.text}</Text>
                            </View>
                            <Text style={styles.timeText}>{msg.time}</Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputArea}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Digite sua mensagem..."
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                            <Ionicons name="send" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    customHeader: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? 40 : 0
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    avatarPlaceholder: { width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 5 },
    statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    menuBtn: { padding: 5 },

    scrollContent: { padding: SPACING.md, paddingTop: 20 },
    welcomeCard: { backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: BORDER_RADIUS.md, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: COLORS.primary, elevation: 2 },
    welcomeTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    welcomeBody: { color: '#666', marginTop: 5 },

    sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#BBB', marginBottom: 15, textAlign: 'center', letterSpacing: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
    quickBtn: { width: '48%', height: 85, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 3 },
    quickBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13, marginTop: 6 },

    divider: { alignItems: 'center', marginVertical: 20 },
    dividerText: { color: '#CCC', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },

    botMsgWrapper: { alignSelf: 'flex-start', marginBottom: 15, maxWidth: '85%' },
    botMsg: { backgroundColor: COLORS.white, padding: 15, borderRadius: 20, borderTopLeftRadius: 2, elevation: 1 },
    botMsgText: { color: '#333' },

    userMsgWrapper: { alignSelf: 'flex-end', marginBottom: 15, maxWidth: '85%' },
    userMsg: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 20, borderTopRightRadius: 2 },
    userMsgText: { color: COLORS.white },
    timeText: { fontSize: 10, color: '#AAA', marginTop: 5, textAlign: 'right' },

    inputArea: { backgroundColor: COLORS.white, padding: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F1F1', borderRadius: 30, paddingHorizontal: 15, height: 50 },
    input: { flex: 1, color: '#333' },
    sendBtn: { marginLeft: 10 }
});

export default ChatScreen;