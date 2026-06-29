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
import type { Ticket } from '../types';
import { useServerStatus } from '../hooks/useServerStatus';

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
    { label: 'Status do Pedido', icon: 'cube-outline', color: '#F59E0B', bg: '#FFFBEB', action: 'message', message: 'Quero saber o status do meu pedido.' },
    { label: 'Falar com Consultor', icon: 'headset-outline', color: '#10B981', bg: '#ECFDF5', action: 'message', message: 'Gostaria de falar com um consultor humano.' },
];

const getNow = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// ─── Painel do Supervisor ────────────────────────────────────────────────────
const SupervisorPanel = () => {
    const { user } = useUser();
    const { colors } = useTheme();
    const panelStyles = useMemo(() => makePanelStyles(colors), [colors]);
    const navigation = useNavigation<AppDrawerNavigationProp>();

    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        ticketService.getAllTickets().then(setTickets);
    }, []);

    const open       = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'inProgress').length;
    const closed     = tickets.filter(t => t.status === 'closed').length;
    const highPriority = tickets.filter(t => t.priority === 'high' && t.status !== 'closed').length;
    const recent     = tickets.slice(0, 4);

    return (
        <View style={panelStyles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#E01E26" />
            <View style={panelStyles.header}>
                <View style={panelStyles.headerLeft}>
                    <View style={panelStyles.headerAvatar}>
                        <Text style={panelStyles.headerAvatarText}>KZ</Text>
                    </View>
                    <View>
                        <Text style={panelStyles.headerTitle}>Painel Kozzy</Text>
                        <Text style={panelStyles.headerSub}>Olá, {user?.name?.split(' ')[0]}!</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="menu-outline" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={panelStyles.scroll} showsVerticalScrollIndicator={false}>
                {/* Stats */}
                <View style={panelStyles.statsRow}>
                    {[
                        { label: 'Abertos', value: open, color: colors.status.open, bg: colors.status.openBg },
                        { label: 'Andamento', value: inProgress, color: colors.status.inProgress, bg: colors.status.inProgressBg },
                        { label: 'Encerrados', value: closed, color: colors.status.closed, bg: colors.status.closedBg },
                    ].map(s => (
                        <View key={s.label} style={[panelStyles.statCard, { backgroundColor: s.bg }]}>
                            <Text style={[panelStyles.statValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={[panelStyles.statLabel, { color: s.color }]}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {highPriority > 0 && (
                    <View style={panelStyles.alertBanner}>
                        <Ionicons name="alert-circle" size={18} color="#FFF" />
                        <Text style={panelStyles.alertText}>{highPriority} chamado{highPriority > 1 ? 's' : ''} com alta prioridade pendente{highPriority > 1 ? 's' : ''}!</Text>
                    </View>
                )}

                {/* Ações rápidas */}
                <Text style={panelStyles.sectionLabel}>ACESSO RÁPIDO</Text>
                <View style={panelStyles.actionsRow}>
                    <TouchableOpacity style={[panelStyles.actionBtn, { backgroundColor: colors.status.openBg }]} onPress={() => navigation.navigate('MeusTickets')}>
                        <Ionicons name="list-outline" size={22} color={colors.primary} />
                        <Text style={[panelStyles.actionLabel, { color: colors.primary }]}>Todos os Chamados</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[panelStyles.actionBtn, { backgroundColor: colors.status.inProgressBg }]} onPress={() => navigation.navigate('Notificacoes')}>
                        <Ionicons name="notifications-outline" size={22} color={colors.status.inProgress} />
                        <Text style={[panelStyles.actionLabel, { color: colors.status.inProgress }]}>Notificações</Text>
                    </TouchableOpacity>
                </View>

                {/* Últimos chamados */}
                <Text style={panelStyles.sectionLabel}>ÚLTIMOS CHAMADOS</Text>
                {recent.length === 0 ? (
                    <View style={panelStyles.emptyBox}>
                        <Text style={panelStyles.emptyText}>Nenhum chamado registrado ainda.</Text>
                    </View>
                ) : recent.map(t => {
                    const statusColors: Record<string, string> = {
                        open: colors.status.open,
                        inProgress: colors.status.inProgress,
                        closed: colors.status.closed,
                    };
                    const statusLabels: Record<string, string> = { open: 'Aberto', inProgress: 'Andamento', closed: 'Encerrado' };
                    const sc = statusColors[t.status];
                    return (
                        <View key={t.id} style={panelStyles.ticketCard}>
                            <View style={panelStyles.ticketTop}>
                                <Text style={panelStyles.ticketSubject} numberOfLines={1}>{t.subject}</Text>
                                <View style={[panelStyles.statusDot, { backgroundColor: sc + '22' }]}>
                                    <Text style={[panelStyles.statusDotText, { color: sc }]}>{statusLabels[t.status]}</Text>
                                </View>
                            </View>
                            <Text style={panelStyles.ticketMeta}>{t.name} · {t.category} · #{t.protocol}</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

// ─── Wrapper thin — decide qual tela renderizar sem violar Rules of Hooks ────
export const ChatScreen = () => {
    const { user } = useUser();
    const isSupervisor = user?.role === 'supervisor' || user?.role === 'admin';
    return isSupervisor ? <SupervisorPanel /> : <ClientChat />;
};

// ─── Chat do cliente ─────────────────────────────────────────────────────────
const ClientChat = () => {
    const { user } = useUser();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    const navigation = useNavigation<AppDrawerNavigationProp>();
    const { status: serverStatus } = useServerStatus(30_000);

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorToast, setErrorToast] = useState('');
    const [rateLimitMsg, setRateLimitMsg] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const msgTimestamps = useRef<number[]>([]);
    const RATE_LIMIT = 5;
    const RATE_WINDOW = 60_000;

    const checkRateLimit = (): boolean => {
        const now = Date.now();
        msgTimestamps.current = msgTimestamps.current.filter(t => now - t < RATE_WINDOW);
        if (msgTimestamps.current.length >= RATE_LIMIT) {
            const oldest = msgTimestamps.current[0];
            const wait = Math.ceil((RATE_WINDOW - (now - oldest)) / 1000);
            setRateLimitMsg(`Muitas mensagens. Aguarde ${wait}s.`);
            setTimeout(() => setRateLimitMsg(''), wait * 1000);
            return false;
        }
        msgTimestamps.current.push(now);
        return true;
    };
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
        if (!retryId && !checkRateLimit()) return;

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
            // Envia histórico (últimas 10 trocas) para a IA ter contexto
            const history = messages
                .filter(m => !m.failed && m.id !== 'welcome')
                .slice(-10)
                .map(m => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.text,
                }));

            const response = await apiPost('/chat', {
                message: texto,
                userName: user?.name || 'Usuário',
                history,
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

    const getSuggestions = (): string[] => {
        const lastBot = [...messages].reverse().find(m => m.type === 'bot' && !m.failed);
        if (!lastBot || isLoading) return [];
        const t = lastBot.text.toLowerCase();
        if (['categoria', 'tipo de chamado', 'qual categoria', 'se encaixa', 'assunto se'].some(k => t.includes(k)))
            return ['Entrega', 'Faturamento', 'Produto', 'Comercial', 'Suporte TI', 'Outro'];
        // chips yes/no removidos — disparavam em contextos errados
        return [];
    };
    const suggestions = getSuggestions();

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
                            <Ionicons name="trash-outline" size={15} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.clearBtnText}>Limpar</Text>
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

                {suggestions.length > 0 && (
                    <View style={styles.suggestionsRow}>
                        {suggestions.map(s => (
                            <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSend(s)} activeOpacity={0.7}>
                                <Text style={styles.suggestionText}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {serverStatus === 'offline' && (
                    <View style={[styles.errorToast, { backgroundColor: '#374151' }]}>
                        <Ionicons name="cloud-offline-outline" size={15} color="#FFF" />
                        <Text style={styles.errorToastText}>Servidor offline — verifique a conexão</Text>
                    </View>
                )}
                {!!rateLimitMsg && (
                    <View style={[styles.errorToast, { backgroundColor: '#F59E0B' }]}>
                        <Ionicons name="time-outline" size={15} color="#FFF" />
                        <Text style={styles.errorToastText}>{rateLimitMsg}</Text>
                    </View>
                )}
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
    menuBtn: { padding: 4 },

    scrollContent: { padding: 16, paddingTop: 24 },
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

    clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
    clearBtnText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },

    suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.border.light },
    suggestionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: c.backgroundLight, borderWidth: 1, borderColor: c.border.medium },
    suggestionText: { fontSize: 13, color: c.text.primary, fontWeight: '500' },
});

const makePanelStyles = (c: Colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.backgroundLight },
    header: { backgroundColor: '#E01E26', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 54, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
    headerAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
    scroll: { padding: 16, paddingBottom: 40 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E01E26', borderRadius: 12, padding: 12, marginBottom: 16 },
    alertText: { color: '#FFF', fontSize: 13, fontWeight: '600', flex: 1 },
    sectionLabel: { fontSize: 10, fontWeight: '800', color: c.text.light, letterSpacing: 1.5, marginBottom: 10, marginLeft: 2, marginTop: 4 },
    actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14 },
    actionLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
    ticketCard: { backgroundColor: c.white, borderRadius: 14, padding: 14, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: c.primary },
    ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    ticketSubject: { fontSize: 14, fontWeight: '700', color: c.text.primary, flex: 1, marginRight: 8 },
    statusDot: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
    statusDotText: { fontSize: 10, fontWeight: '700' },
    ticketMeta: { fontSize: 12, color: c.text.light },
    emptyBox: { backgroundColor: c.white, borderRadius: 14, padding: 24, alignItems: 'center' },
    emptyText: { color: c.text.light, fontSize: 14 },
});

export default ChatScreen;
