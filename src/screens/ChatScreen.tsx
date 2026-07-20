import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { aiApiPost, apiGet, apiPut } from '../services/api';
import { socketService } from '../services/socketService';
import { ticketService } from '../services/ticketService';
import { STORAGE_KEYS } from '../constants/storage';
import type { ChatMessage, Ticket } from '../types';
import type { AppDrawerNavigationProp } from '../types/navigation';
import { useServerStatus } from '../hooks/useServerStatus';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatInput } from '../components/chat/ChatInput';
import { MessageBubble } from '../components/chat/MessageBubble';
import { QuickActions } from '../components/chat/QuickActions';
import type { QuickAction } from '../components/chat/QuickActions';
import { SuggestionChips } from '../components/chat/SuggestionChips';
import type { Colors } from '../theme/colors';

const getNow = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// ─── Live Chat Header ─────────────────────────────────────────────────────────
const LiveChatHeader = ({ onEnd }: { onEnd: () => void }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [pulseAnim]);

    return (
        <View style={liveHeaderStyles.container}>
            <View style={liveHeaderStyles.left}>
                <View style={liveHeaderStyles.avatar}><Text style={liveHeaderStyles.avatarText}>KZ</Text></View>
                <View>
                    <Text style={liveHeaderStyles.title}>Chat ao Vivo</Text>
                    <View style={liveHeaderStyles.subRow}>
                        <Animated.View style={[liveHeaderStyles.dot, { opacity: pulseAnim }]} />
                        <Text style={liveHeaderStyles.sub}>Aguardando atendente</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={onEnd} style={liveHeaderStyles.endBtn} activeOpacity={0.8}>
                <Text style={liveHeaderStyles.endText}>Encerrar</Text>
            </TouchableOpacity>
        </View>
    );
};

const liveHeaderStyles = StyleSheet.create({
    container: { backgroundColor: '#10B981', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 54, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    title: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    subRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
    sub: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
    endBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
    endText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});

// ─── Painel do Supervisor ────────────────────────────────────────────────────
const SupervisorPanel = () => {
    const { user } = useUser();
    const { colors } = useTheme();
    const panelStyles = useMemo(() => makePanelStyles(colors), [colors]);
    const navigation = useNavigation<AppDrawerNavigationProp>();
    const [tickets, setTickets] = useState<Ticket[]>([]);

    const loadTickets = useCallback(() => {
        ticketService.getAllTickets().then(setTickets).catch(() => {});
    }, []);

    useEffect(() => {
        loadTickets();
        socketService.on('chamado:novo',       loadTickets);
        socketService.on('chamado:atualizado', loadTickets);
        return () => {
            socketService.off('chamado:novo');
            socketService.off('chamado:atualizado');
        };
    }, [loadTickets]);

    const open         = tickets.filter(t => t.status === 'open').length;
    const inProgress   = tickets.filter(t => t.status === 'inProgress').length;
    const closed       = tickets.filter(t => t.status === 'closed').length;
    const highPriority = tickets.filter(t => t.priority === 'high' && t.status !== 'closed').length;

    return (
        <View style={panelStyles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#E01E26" />
            <View style={panelStyles.header}>
                <View style={panelStyles.headerLeft}>
                    <View style={panelStyles.headerAvatar}><Text style={panelStyles.headerAvatarText}>KZ</Text></View>
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
                <View style={panelStyles.statsRow}>
                    {[
                        { label: 'Abertos',    value: open,       color: colors.status.open,       bg: colors.status.openBg },
                        { label: 'Andamento',  value: inProgress, color: colors.status.inProgress, bg: colors.status.inProgressBg },
                        { label: 'Encerrados', value: closed,     color: colors.status.closed,     bg: colors.status.closedBg },
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
                        <Text style={panelStyles.alertText}>{highPriority} chamado{highPriority > 1 ? 's' : ''} com alta prioridade!</Text>
                    </View>
                )}
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
                <Text style={panelStyles.sectionLabel}>ÚLTIMOS CHAMADOS</Text>
                {tickets.slice(0, 4).length === 0 ? (
                    <View style={panelStyles.emptyBox}><Text style={panelStyles.emptyText}>Nenhum chamado registrado ainda.</Text></View>
                ) : tickets.slice(0, 4).map(t => {
                    const sc    = { open: colors.status.open, inProgress: colors.status.inProgress, closed: colors.status.closed }[t.status];
                    const label = { open: 'Aberto', inProgress: 'Andamento', closed: 'Encerrado' }[t.status];
                    return (
                        <View key={t.id} style={panelStyles.ticketCard}>
                            <View style={panelStyles.ticketTop}>
                                <Text style={panelStyles.ticketSubject} numberOfLines={1}>{t.subject}</Text>
                                <View style={[panelStyles.statusDot, { backgroundColor: sc + '22' }]}>
                                    <Text style={[panelStyles.statusDotText, { color: sc }]}>{label}</Text>
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

// ─── Wrapper thin ─────────────────────────────────────────────────────────────
export const ChatScreen = () => {
    const { user } = useUser();
    const isSupervisor = user?.role === 'supervisor' || user?.role === 'admin';
    return isSupervisor ? <SupervisorPanel /> : <ClientChat />;
};

// ─── Chat do cliente ──────────────────────────────────────────────────────────
const ClientChat = () => {
    const { user } = useUser();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);
    const { status: serverStatus } = useServerStatus(30_000);

    const [inputText, setInputText]       = useState('');
    const [isLoading, setIsLoading]       = useState(false);
    const [errorToast, setErrorToast]     = useState('');
    const [rateLimitMsg, setRateLimitMsg] = useState('');
    const scrollViewRef  = useRef<ScrollView>(null);
    const msgTimestamps  = useRef<number[]>([]);

    // Live chat
    const [chatMode, setChatMode]             = useState<'bot' | 'live'>('bot');
    const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
    const seenCommentKeys = useRef<Set<string>>(new Set());

    const firstName = user?.name?.split(' ')[0] || 'você';
    const welcomeMsg: ChatMessage = useMemo(() => ({
        id: 'welcome', text: `Olá, ${firstName}! 👋 Sou a Kozzy, assistente virtual da Kozzy Alimentos.\n\nComo posso te ajudar hoje?`, type: 'bot', time: getNow(),
    }), [firstName]);

    const [messages, setMessages] = useState<ChatMessage[]>([welcomeMsg]);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY).then(saved => {
            if (saved) { const parsed: ChatMessage[] = JSON.parse(saved); if (parsed.length > 1) setMessages(parsed); }
        });
    }, []);

    useEffect(() => {
        if (messages.length > 1) AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, [messages]);

    const showError = (msg: string) => { setErrorToast(msg); setTimeout(() => setErrorToast(''), 4000); };

    const checkRateLimit = (): boolean => {
        const now = Date.now();
        msgTimestamps.current = msgTimestamps.current.filter(t => now - t < 60_000);
        if (msgTimestamps.current.length >= 5) {
            const wait = Math.ceil((60_000 - (now - msgTimestamps.current[0])) / 1000);
            setRateLimitMsg(`Muitas mensagens. Aguarde ${wait}s.`);
            setTimeout(() => setRateLimitMsg(''), wait * 1000);
            return false;
        }
        msgTimestamps.current.push(now);
        return true;
    };

    const addMessage = useCallback((text: string, type: 'user' | 'bot', id?: string): string => {
        const msgId = id ?? Math.random().toString();
        setMessages(prev => [...prev, { id: msgId, text, type, time: getNow() }]);
        return msgId;
    }, []);

    const clearChat = () => { setMessages([welcomeMsg]); AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY); };

    // ── Inicia chat ao vivo ────────────────────────────────────────────────────
    const startLiveChat = async () => {
        setIsLoading(true);
        try {
            const ticket = await ticketService.createLiveChatTicket(user?.name ?? 'Cliente');
            setActiveTicketId(ticket.id);
            seenCommentKeys.current = new Set();
            setChatMode('live');
            addMessage('🤝 Você está no chat ao vivo!\n\nUm atendente irá responder em breve. Pode digitar sua dúvida enquanto aguarda.', 'bot');
        } catch {
            addMessage('❌ Não foi possível iniciar o chat ao vivo agora. Tente novamente ou abra um ticket.', 'bot');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Encerra chat ao vivo ──────────────────────────────────────────────────
    const endLiveChat = async () => {
        if (!activeTicketId) return;
        try { await apiPut(`/atendimentos/${activeTicketId}`, { avanco: 'encerrado' }); } catch { /* best effort */ }
        setChatMode('bot');
        setActiveTicketId(null);
        addMessage('Atendimento encerrado. Voltando para a assistente virtual. 👋', 'bot');
    };

    // ── Socket: ouve atualizações do chamado em tempo real ────────────────────
    useEffect(() => {
        if (chatMode !== 'live' || !activeTicketId) return;

        const handleUpdate = (data: any) => {
            const id = data._id ?? data.id;
            if (id !== activeTicketId) return;

            if (data.avanco === 'concluido' || data.avanco === 'encerrado') {
                setChatMode('bot');
                setActiveTicketId(null);
                addMessage('✅ Atendimento encerrado pelo suporte. Voltando para a assistente virtual.', 'bot');
                return;
            }

            const comments: any[] = data.comentarios ?? [];
            comments.forEach(c => {
                const key = c._id ?? c.dataCriacao ?? JSON.stringify(c);
                if (seenCommentKeys.current.has(key)) return;
                if (!c.isPrivado && c.usuario?.perfilAcesso !== 'cliente') {
                    addMessage(`👤 ${c.usuario?.nomeCompleto ?? 'Atendente'}: ${c.mensagem}`, 'bot');
                    seenCommentKeys.current.add(key);
                }
            });
        };

        socketService.on('chamado:atualizado', handleUpdate);
        return () => socketService.off('chamado:atualizado');
    }, [chatMode, activeTicketId, addMessage]);

    // ── Polling de fallback a cada 10s ────────────────────────────────────────
    useEffect(() => {
        if (chatMode !== 'live' || !activeTicketId) return;

        const poll = async () => {
            try {
                const data = await apiGet<any>(`/atendimentos/${activeTicketId}`);
                if (!data) return;

                if (data.avanco === 'concluido' || data.avanco === 'encerrado') {
                    setChatMode('bot');
                    setActiveTicketId(null);
                    addMessage('✅ Atendimento encerrado. Voltando para a assistente virtual.', 'bot');
                    return;
                }

                const comments: any[] = data.comentarios ?? [];
                comments.forEach(c => {
                    const key = c._id ?? c.dataCriacao ?? JSON.stringify(c);
                    if (seenCommentKeys.current.has(key)) return;
                    if (!c.isPrivado && c.usuario?.perfilAcesso !== 'cliente') {
                        addMessage(`👤 ${c.usuario?.nomeCompleto ?? 'Atendente'}: ${c.mensagem}`, 'bot');
                        seenCommentKeys.current.add(key);
                    }
                });
            } catch { /* rede instável, tentar novamente na próxima poll */ }
        };

        const interval = setInterval(poll, 10_000);
        return () => clearInterval(interval);
    }, [chatMode, activeTicketId, addMessage]);

    // ── Enviar mensagem ───────────────────────────────────────────────────────
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

        // Modo live: envia como comentário no chamado
        if (chatMode === 'live' && activeTicketId) {
            setIsLoading(true);
            try {
                await ticketService.addComment(activeTicketId, texto);
            } catch {
                setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, failed: true } : m));
                showError('Falha ao enviar. Toque em Reenviar para tentar novamente.');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Modo bot: envia para servidor de IA
        setIsLoading(true);
        try {
            const history = messages
                .filter(m => !m.failed && m.id !== 'welcome')
                .slice(-10)
                .map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text }));

            const response = await aiApiPost('/chat', { message: texto, userName: user?.name || 'Usuário', history });

            if (response?.createTicket) {
                try {
                    const ticket = await ticketService.createTicket({ name: user?.name ?? 'Usuário', clientType: 'retail', priority: 'medium', ...response.createTicket });
                    const confirmText = response.response
                        ? `${response.response}\n\n🎫 Protocolo: *#${ticket.protocol}*`
                        : `✅ Ticket aberto!\n\n🎫 Protocolo: *#${ticket.protocol}*\nNossa equipe entrará em contato em breve.`;
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
            showError('Sem conexão com o servidor de IA. Toque em Reenviar para tentar novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const navigation = useNavigation<AppDrawerNavigationProp>();
    const handleAction = (action: QuickAction) => {
        if (action.action === 'navigate' && action.target) navigation.navigate(action.target);
        else if (action.action === 'live') startLiveChat();
        else if (action.action === 'message' && action.message) handleSend(action.message);
    };

    const getSuggestions = (): string[] => {
        if (chatMode === 'live') return [];
        const lastBot = [...messages].reverse().find(m => m.type === 'bot' && !m.failed);
        if (!lastBot || isLoading) return [];
        const t = lastBot.text.toLowerCase();
        if (['categoria', 'tipo de chamado', 'qual categoria', 'se encaixa', 'assunto se'].some(k => t.includes(k)))
            return ['Entrega', 'Faturamento', 'Produto', 'Comercial', 'Suporte TI', 'Outro'];
        return [];
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={chatMode === 'live' ? '#10B981' : '#E01E26'} />
            {chatMode === 'live'
                ? <LiveChatHeader onEnd={endLiveChat} />
                : <ChatHeader onClear={clearChat} />
            }
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {chatMode === 'bot' && <QuickActions onAction={handleAction} colors={colors} isDark={isDark} />}
                    {chatMode === 'bot' && (
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>conversa</Text>
                            <View style={styles.dividerLine} />
                        </View>
                    )}
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} colors={colors} onRetry={m => handleSend(m.text, m.id)} />
                    ))}
                    {isLoading && (
                        <View style={styles.botRow}>
                            <View style={[styles.botAvatar, chatMode === 'live' && { backgroundColor: '#10B981' }]}>
                                <Text style={styles.botAvatarText}>KZ</Text>
                            </View>
                            <View style={[styles.typingBubble, { backgroundColor: colors.white }]}>
                                <View style={styles.typingDots}>
                                    <View style={[styles.dot, { backgroundColor: colors.border.medium }]} />
                                    <View style={[styles.dot, styles.dot2, { backgroundColor: colors.border.medium }]} />
                                    <View style={[styles.dot, { backgroundColor: colors.border.medium }]} />
                                </View>
                            </View>
                        </View>
                    )}
                    <View style={{ height: 12 }} />
                </ScrollView>
                {chatMode === 'bot' && <SuggestionChips suggestions={getSuggestions()} onSelect={s => handleSend(s)} colors={colors} />}
                {serverStatus === 'offline' && chatMode === 'bot' && (
                    <View style={[styles.toast, { backgroundColor: '#374151' }]}>
                        <Ionicons name="cloud-offline-outline" size={15} color="#FFF" />
                        <Text style={styles.toastText}>Servidor de IA offline — verifique a conexão</Text>
                    </View>
                )}
                {!!rateLimitMsg && (
                    <View style={[styles.toast, { backgroundColor: '#F59E0B' }]}>
                        <Ionicons name="time-outline" size={15} color="#FFF" />
                        <Text style={styles.toastText}>{rateLimitMsg}</Text>
                    </View>
                )}
                {!!errorToast && (
                    <View style={styles.toast}>
                        <Ionicons name="wifi-outline" size={15} color="#FFF" />
                        <Text style={styles.toastText}>{errorToast}</Text>
                    </View>
                )}
                <ChatInput inputText={inputText} setInputText={setInputText} onSend={() => handleSend()} isLoading={isLoading} colors={colors} />
            </KeyboardAvoidingView>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: Colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.backgroundLight },
    scrollContent: { padding: 16, paddingTop: 24 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.border.light },
    dividerText: { fontSize: 11, color: c.text.light, fontWeight: '600' },
    botRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
    botAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    botAvatarText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    typingBubble: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
    typingDots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4 },
    dot2: { marginTop: -4 },
    toast: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#333', marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    toastText: { color: '#FFF', fontSize: 12, flex: 1 },
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
