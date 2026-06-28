import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView, StatusBar, StyleSheet, Text, TextInput,
    TouchableOpacity, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiPost } from '../services/api';
import { ticketService } from '../services/ticketService';
import { BORDER_RADIUS } from '../theme';
import type { Colors } from '../theme/colors';
import { STORAGE_KEYS } from '../constants/storage';
import type { AppDrawerNavigationProp, AppDrawerParamList } from '../types/navigation';

type Message = {
    id: string;
    text: string;
    type: 'user' | 'bot';
    time: string;
    failed?: boolean;
};

type QuickAction = {
    label: string;
    icon: any;
    color: string;
    bg: string;
    action: 'navigate' | 'message';
    target?: keyof AppDrawerParamList;
    message?: string;
};

const QUICK_ACTIONS: QuickAction[] = [
    { label: 'Abrir Ticket', icon: 'ticket-outline', color: '#E01E26', bg: '#FFF0F0', action: 'navigate', target: 'AbrirTicket' },
    { label: 'Meus Tickets', icon: 'list-outline', color: '#3B82F6', bg: '#EFF6FF', action: 'navigate', target: 'MeusTickets' },
    { label: 'Problema no Pedido', icon: 'cube-outline', color: '#F59E0B', bg: '#FFFBEB', action: 'navigate', target: 'AbrirTicket' },
    { label: 'Falar com Consultor', icon: 'headset-outline', color: '#10B981', bg: '#ECFDF5', action: 'message', message: 'Gostaria de falar com um consultor humano.' },
];

const getNow = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const ChatScreen = () => {
    const { user } = useUser();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    const navigation = useNavigation<AppDrawerNavigationProp>();

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorToast, setErrorToast] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const firstName = user?.name?.split(' ')[0] || 'você';

    const welcomeMsg: Message = useMemo(() => ({
        id: 'welcome',
        text: `Olá, ${firstName}! 👋 Sou a Kozzy, assistente virtual da Kozzy Alimentos.\n\nComo posso te ajudar hoje?`,
        type: 'bot',
        time: getNow(),
    }), [firstName]);

    const [messages, setMessages] = useState<Message[]>([welcomeMsg]);

    // Carrega histórico do chat
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY).then(saved => {
            if (saved) {
                const parsed: Message[] = JSON.parse(saved);
                if (parsed.length > 1) setMessages(parsed);
            }
        });
    }, []);

    // Salva histórico quando muda
    useEffect(() => {
        if (messages.length > 1) {
            AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const showError = (msg: string) => {
        setErrorToast(msg);
        setTimeout(() => setErrorToast(''), 4000);
    };

    const clearChat = () => {
        setMessages([welcomeMsg]);
        AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    };

    const addMessage = useCallback((text: string, type: 'user' | 'bot', id?: string): string => {
        const msgId = id ?? Math.random().toString();
        setMessages(prev => [...prev, { id: msgId, text, type, time: getNow() }]);
        return msgId;
    }, []);

    const handleSend = async (override?: string, retryId?: string) => {
        const texto = (override || inputText).trim();
        if (!texto || isLoading) return;

        let userMsgId: string;

        if (retryId) {
            userMsgId = retryId;
            setMessages(prev => prev.map(m => m.id === retryId ? { ...m, failed: false } : m));
        } else {
            userMsgId = addMessage(texto, 'user');
            setInputText('');
        }

        setIsLoading(true);

        try {
            const response = await apiPost('/chat', {
                message: texto,
                userName: user?.name || 'Usuário',
            });

            if (response?.createTicket) {
                // IA coletou todas as infos — cria o ticket automaticamente
                try {
                    const ticket = await ticketService.createTicket({
                        name: user?.name ?? 'Usuário',
                        clientType: 'retail',
                        priority: 'medium',
                        ...response.createTicket,
                    });
                    const confirmText = response.response
                        ? `${response.response}\n\n🎫 Protocolo: *#${ticket.protocol}*`
                        : `✅ Ticket aberto com sucesso!\n\n🎫 Protocolo: *#${ticket.protocol}*\nNossa equipe entrará em contato em breve.`;
                    addMessage(confirmText, 'bot');
                } catch {
                    addMessage(response.response ?? 'Ticket registrado! Nossa equipe entrará em contato.', 'bot');
                }
            } else if (response?.response) {
                addMessage(response.response, 'bot');
            } else {
                addMessage('Desculpe, não consegui processar sua mensagem. Tente novamente.', 'bot');
            }
        } catch (err: any) {
            console.warn('[Kozzy] Falha ao enviar:', err?.message ?? err);
            setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, failed: true } : m));
            showError('Sem conexão com o servidor. Toque em Reenviar para tentar novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: QuickAction) => {
        if (action.action === 'navigate' && action.target) {
            navigation.navigate(action.target);
        } else if (action.action === 'message' && action.message) {
            handleSend(action.message);
        }
    };

    const retryMessage = (msg: Message) => handleSend(msg.text, msg.id);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#E01E26" />

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
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={clearChat} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                            style={styles.menuBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="menu-outline" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.actionsSection}>
                        <Text style={styles.actionsLabel}>ACESSO RÁPIDO</Text>
                        <View style={styles.actionsGrid}>
                            {QUICK_ACTIONS.map(action => (
                                <TouchableOpacity
                                    key={action.label}
                                    style={[styles.actionBtn, { backgroundColor: isDark ? colors.white : action.bg }]}
                                    onPress={() => handleQuickAction(action)}
                                    activeOpacity={0.75}
                                >
                                    <View style={[styles.actionIconWrap, { backgroundColor: action.color + '22' }]}>
                                        <Ionicons name={action.icon} size={22} color={action.color} />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                                    <Ionicons name="chevron-forward" size={14} color={action.color + '80'} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>conversa</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {messages.map(msg => (
                        <View key={msg.id} style={msg.type === 'bot' ? styles.botRow : styles.userRow}>
                            {msg.type === 'bot' && (
                                <View style={styles.botAvatar}>
                                    <Text style={styles.botAvatarText}>KZ</Text>
                                </View>
                            )}
                            <View style={styles.msgColumn}>
                                <View style={[
                                    msg.type === 'bot' ? styles.botBubble : styles.userBubble,
                                    msg.failed && styles.failedBubble,
                                ]}>
                                    <Text style={msg.type === 'bot' ? styles.botText : styles.userText}>
                                        {msg.text}
                                    </Text>
                                </View>
                                <View style={[styles.msgMeta, msg.type === 'user' && { alignSelf: 'flex-end' }]}>
                                    <Text style={styles.msgTime}>{msg.time}</Text>
                                    {msg.failed && (
                                        <TouchableOpacity
                                            onPress={() => retryMessage(msg)}
                                            style={styles.retryBtn}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            activeOpacity={0.6}
                                        >
                                            <Ionicons name="refresh-outline" size={13} color="#E01E26" />
                                            <Text style={styles.retryText}>Reenviar</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}

                    {isLoading && (
                        <View style={styles.botRow}>
                            <View style={styles.botAvatar}>
                                <Text style={styles.botAvatarText}>KZ</Text>
                            </View>
                            <View style={styles.typingBubble}>
                                <View style={styles.typingDots}>
                                    <View style={[styles.dot, styles.dot1]} />
                                    <View style={[styles.dot, styles.dot2]} />
                                    <View style={[styles.dot, styles.dot3]} />
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 12 }} />
                </ScrollView>

                {!!errorToast && (
                    <View style={styles.errorToast}>
                        <Ionicons name="wifi-outline" size={15} color="#FFF" />
                        <Text style={styles.errorToastText}>{errorToast}</Text>
                    </View>
                )}

                <View style={styles.inputArea}>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite sua mensagem..."
                            placeholderTextColor={colors.input.placeholder}
                            value={inputText}
                            onChangeText={setInputText}
                            editable={!isLoading}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || isLoading}
                        >
                            {isLoading
                                ? <ActivityIndicator size="small" color="#FFF" />
                                : <Ionicons name="send" size={18} color="#FFF" />
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const makeStyles = (c: Colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.backgroundLight },
    header: {
        backgroundColor: '#E01E26',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 54,
        paddingBottom: 16, paddingHorizontal: 20,
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    },
    headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    headerAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 5 },
    onlineText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    clearBtn: { padding: 4 },
    menuBtn: { padding: 4 },

    scrollContent: { padding: 16 },
    actionsSection: { marginBottom: 8 },
    actionsLabel: { fontSize: 10, fontWeight: '800', color: c.text.light, letterSpacing: 1.5, marginBottom: 12, marginLeft: 2 },
    actionsGrid: { gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.xl, paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderWidth: 1, borderColor: c.border.light },
    actionIconWrap: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    actionLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.border.light },
    dividerText: { fontSize: 11, color: c.text.light, fontWeight: '600' },

    botRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
    userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
    botAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    botAvatarText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    msgColumn: { flex: 1, maxWidth: '85%' },
    botBubble: { backgroundColor: c.white, padding: 14, borderRadius: 18, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
    userBubble: { backgroundColor: '#E01E26', padding: 14, borderRadius: 18, borderBottomRightRadius: 4, alignSelf: 'flex-end' },
    failedBubble: { opacity: 0.6 },
    botText: { color: c.text.primary, fontSize: 14, lineHeight: 20 },
    userText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
    msgMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginHorizontal: 4 },
    msgTime: { fontSize: 10, color: c.text.light },
    retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 2, paddingHorizontal: 4 },
    retryText: { fontSize: 11, color: '#E01E26', fontWeight: '600' },

    typingBubble: { backgroundColor: c.white, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
    typingDots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border.medium },
    dot1: {},
    dot2: { marginTop: -4 },
    dot3: {},

    errorToast: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#333', marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    errorToastText: { color: '#FFF', fontSize: 12, flex: 1 },

    inputArea: { backgroundColor: c.white, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.border.light, paddingBottom: Platform.OS === 'ios' ? 28 : 12 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: c.backgroundLight, borderRadius: 24, borderWidth: 1, borderColor: c.border.light, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, gap: 8 },
    input: { flex: 1, fontSize: 15, color: c.text.primary, maxHeight: 100, paddingTop: 6, paddingBottom: 6 },
    sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center' },
    sendBtnDisabled: { backgroundColor: '#F0B0B3' },
});

export default ChatScreen;
