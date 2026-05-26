import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { apiPost } from '../services/api';

type Message = {
    id: string;
    text: string;
    type: 'user' | 'bot';
    time: string;
};

type QuickAction = {
    label: string;
    icon: any;
    color: string;
    bg: string;
    action: 'navigate' | 'message';
    target?: string;
    message?: string;
};

const QUICK_ACTIONS: QuickAction[] = [
    {
        label: 'Abrir Ticket',
        icon: 'ticket-outline',
        color: '#E01E26',
        bg: '#FFF0F0',
        action: 'navigate',
        target: 'AbrirTicket',
    },
    {
        label: 'Meus Tickets',
        icon: 'list-outline',
        color: '#3B82F6',
        bg: '#EFF6FF',
        action: 'navigate',
        target: 'MeusTickets',
    },
    {
        label: 'Problema no Pedido',
        icon: 'cube-outline',
        color: '#F59E0B',
        bg: '#FFFBEB',
        action: 'navigate',
        target: 'AbrirTicket',
    },
    {
        label: 'Falar com Consultor',
        icon: 'headset-outline',
        color: '#10B981',
        bg: '#ECFDF5',
        action: 'message',
        message: 'Gostaria de falar com um consultor humano.',
    },
];

const getNow = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const ChatScreen = () => {
    const { user } = useUser();
    const navigation = useNavigation<any>();
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const firstName = user?.name?.split(' ')[0] || 'você';

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Olá, ${firstName}! 👋 Sou a Kozzy, assistente virtual da Kozzy Alimentos.\n\nComo posso te ajudar hoje?`,
            type: 'bot',
            time: getNow(),
        },
    ]);

    useEffect(() => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    const addMessage = (text: string, type: 'user' | 'bot') => {
        setMessages(prev => [...prev, { id: Math.random().toString(), text, type, time: getNow() }]);
    };

    const handleQuickAction = (action: QuickAction) => {
        if (action.action === 'navigate' && action.target) {
            navigation.navigate(action.target);
        } else if (action.action === 'message' && action.message) {
            handleSend(action.message);
        }
    };

    const handleSend = async (override?: string) => {
        const texto = (override || inputText).trim();
        if (!texto) return;

        addMessage(texto, 'user');
        setInputText('');
        setIsLoading(true);

        try {
            const response = await apiPost('/chat', {
                message: texto,
                userName: user?.name || 'Usuário',
            });

            if (response?.response) {
                addMessage(response.response, 'bot');
            } else {
                addMessage('Desculpe, não consegui processar sua mensagem. Tente novamente.', 'bot');
            }
        } catch (error: any) {
            let textoErro = 'Sem conexão com o servidor. Verifique se o servidor está rodando.';
            if (typeof error === 'string') textoErro = error;
            else if (error?.message && typeof error.message === 'string') textoErro = error.message;
            addMessage(`❌ ${textoErro}`, 'bot');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#E01E26" />

            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerInner}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerAvatar}>
                            <Text style={styles.headerAvatarText}>KZ</Text>
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Central Kozzy</Text>
                            <View style={styles.onlineRow}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.onlineText}>Assistente Online</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                        style={styles.menuBtn}
                    >
                        <Ionicons name="menu-outline" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* AÇÕES RÁPIDAS */}
                    <View style={styles.actionsSection}>
                        <Text style={styles.actionsLabel}>ACESSO RÁPIDO</Text>
                        <View style={styles.actionsGrid}>
                            {QUICK_ACTIONS.map((action) => (
                                <TouchableOpacity
                                    key={action.label}
                                    style={[styles.actionBtn, { backgroundColor: action.bg }]}
                                    onPress={() => handleQuickAction(action)}
                                    activeOpacity={0.75}
                                >
                                    <View style={[styles.actionIconWrap, { backgroundColor: action.color + '20' }]}>
                                        <Ionicons name={action.icon} size={22} color={action.color} />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                                    <Ionicons name="chevron-forward" size={14} color={action.color + '80'} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* DIVISOR */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>conversa</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* MENSAGENS */}
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={msg.type === 'bot' ? styles.botRow : styles.userRow}
                        >
                            {msg.type === 'bot' && (
                                <View style={styles.botAvatar}>
                                    <Text style={styles.botAvatarText}>KZ</Text>
                                </View>
                            )}
                            <View style={styles.msgColumn}>
                                <View style={msg.type === 'bot' ? styles.botBubble : styles.userBubble}>
                                    <Text style={msg.type === 'bot' ? styles.botText : styles.userText}>
                                        {msg.text}
                                    </Text>
                                </View>
                                <Text style={[styles.msgTime, msg.type === 'user' && { textAlign: 'right' }]}>
                                    {msg.time}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* LOADING */}
                    {isLoading && (
                        <View style={styles.botRow}>
                            <View style={styles.botAvatar}>
                                <Text style={styles.botAvatarText}>KZ</Text>
                            </View>
                            <View style={styles.typingBubble}>
                                <ActivityIndicator size="small" color="#E01E26" />
                                <Text style={styles.typingText}>Digitando...</Text>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 12 }} />
                </ScrollView>

                {/* INPUT */}
                <View style={styles.inputArea}>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite sua mensagem..."
                            placeholderTextColor="#BBB"
                            value={inputText}
                            onChangeText={setInputText}
                            editable={!isLoading}
                            multiline
                            maxLength={500}
                            onSubmitEditing={() => handleSend()}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <Ionicons name="send" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },

    // Header
    header: {
        backgroundColor: '#E01E26',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 54,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerAvatar: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    headerAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 5 },
    onlineText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
    menuBtn: { padding: 4 },

    scrollContent: { padding: 16 },

    // Ações rápidas
    actionsSection: { marginBottom: 8 },
    actionsLabel: {
        fontSize: 10, fontWeight: '800', color: '#CCC',
        letterSpacing: 1.5, marginBottom: 12, marginLeft: 2,
    },
    actionsGrid: { gap: 8 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    },
    actionIconWrap: {
        width: 38, height: 38, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    actionLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

    // Divisor
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E8E8' },
    dividerText: { fontSize: 11, color: '#CCC', fontWeight: '600' },

    // Mensagens
    botRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
    userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
    botAvatar: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
    },
    botAvatarText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    msgColumn: { flex: 1, maxWidth: '85%' },
    botBubble: {
        backgroundColor: '#FFF', padding: 14, borderRadius: 18,
        borderBottomLeftRadius: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    userBubble: {
        backgroundColor: '#E01E26', padding: 14, borderRadius: 18,
        borderBottomRightRadius: 4, alignSelf: 'flex-end',
    },
    botText: { color: '#333', fontSize: 14, lineHeight: 20 },
    userText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
    msgTime: { fontSize: 10, color: '#CCC', marginTop: 4, marginHorizontal: 4 },

    // Typing
    typingBubble: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 12,
        borderRadius: 18, borderBottomLeftRadius: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    typingText: { color: '#BBB', fontSize: 13 },

    // Input
    inputArea: {
        backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'flex-end',
        backgroundColor: '#F7F8FA', borderRadius: 24,
        borderWidth: 1, borderColor: '#EBEBEB',
        paddingLeft: 16, paddingRight: 6, paddingVertical: 6, gap: 8,
    },
    input: { flex: 1, fontSize: 15, color: '#222', maxHeight: 100, paddingTop: 6, paddingBottom: 6 },
    sendBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: '#F0B0B3' },
});

export default ChatScreen;