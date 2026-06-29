import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Modal, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { ticketService } from '../services/ticketService';
import { BORDER_RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import type { Colors } from '../theme/colors';
import type { Ticket, TicketPriority, TicketStatus } from '../types';
import type { AppDrawerNavigationProp } from '../types/navigation';

type SortKey = 'newest' | 'oldest' | 'priority' | 'status';
const SORT_LABELS: Record<SortKey, string> = { newest: 'Mais recentes', oldest: 'Mais antigos', priority: 'Prioridade', status: 'Status' };
const FILTERS: { key: TicketStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' }, { key: 'open', label: 'Abertos' },
    { key: 'inProgress', label: 'Em andamento' }, { key: 'closed', label: 'Encerrados' },
];
const PRIORITY_ORDER: Record<TicketPriority, number> = { high: 0, medium: 1, low: 2 };
const STATUS_ORDER: Record<TicketStatus, number> = { open: 0, inProgress: 1, closed: 2 };

// ─── Skeleton ────────────────────────────────────────────────────────────────
const TicketSkeleton = ({ colors }: { colors: Colors }) => {
    const opacity = useRef(new Animated.Value(0.4)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])).start();
    }, []);
    return (
        <Animated.View style={{ opacity }}>
            {[0, 1, 2].map(i => (
                <View key={i} style={[skeletonCard, { backgroundColor: colors.white, marginBottom: SPACING.md }]}>
                    <View style={{ width: 44, height: 44, borderRadius: BORDER_RADIUS.xl, backgroundColor: colors.border.light, marginRight: SPACING.md }} />
                    <View style={{ flex: 1 }}>
                        <View style={{ height: 14, borderRadius: 4, backgroundColor: colors.border.light, width: '70%', marginBottom: 8 }} />
                        <View style={{ height: 10, borderRadius: 4, backgroundColor: colors.border.light, width: '40%' }} />
                    </View>
                </View>
            ))}
        </Animated.View>
    );
};
const skeletonCard: object = { flexDirection: 'row', borderRadius: BORDER_RADIUS.xxl, padding: SPACING.base };

// ─── Rating Modal ────────────────────────────────────────────────────────────
const RatingModal = ({ visible, onClose, onSubmit }: { visible: boolean; onClose: () => void; onSubmit: (stars: number, comment: string) => void }) => {
    const { colors } = useTheme();
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.xl }}>
                <View style={{ backgroundColor: colors.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xl }}>
                    <Text style={{ fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: colors.text.primary, marginBottom: SPACING.sm }}>Como foi o atendimento?</Text>
                    <Text style={{ fontSize: TYPOGRAPHY.sizes.sm, color: colors.text.light, marginBottom: SPACING.lg }}>Sua avaliação nos ajuda a melhorar.</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.lg }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <TouchableOpacity key={s} onPress={() => setStars(s)}>
                                <Ionicons name={s <= stars ? 'star' : 'star-outline'} size={36} color={s <= stars ? '#F59E0B' : colors.border.dark} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        style={{ backgroundColor: colors.backgroundLight, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: colors.border.light, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.sm, color: colors.text.primary, minHeight: 72, textAlignVertical: 'top', marginBottom: SPACING.lg }}
                        placeholder="Comentário opcional..."
                        placeholderTextColor={colors.input.placeholder}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={{ backgroundColor: stars > 0 ? colors.primary : colors.border.medium, borderRadius: BORDER_RADIUS.xl, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm }}
                        onPress={() => { if (stars > 0) onSubmit(stars, comment); }}
                        disabled={stars === 0}
                    >
                        <Text style={{ color: '#FFF', fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.base }}>Enviar avaliação</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={{ alignItems: 'center', paddingVertical: SPACING.sm }}>
                        <Text style={{ color: colors.text.light, fontSize: TYPOGRAPHY.sizes.sm }}>Pular</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// ─── Tela principal ──────────────────────────────────────────────────────────
export const MeusTicketsScreen = () => {
    const navigation = useNavigation<AppDrawerNavigationProp>();
    const { colors, isDark } = useTheme();
    const { user } = useUser();
    const isSupervisor = user?.role === 'supervisor' || user?.role === 'admin';
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const STATUS_MAP = useMemo(() => ({
        open: { label: 'Aberto', color: colors.status.open, bg: colors.status.openBg, icon: 'radio-button-on' as any },
        inProgress: { label: 'Em andamento', color: colors.status.inProgress, bg: colors.status.inProgressBg, icon: 'time-outline' as any },
        closed: { label: 'Encerrado', color: colors.status.closed, bg: colors.status.closedBg, icon: 'checkmark-circle-outline' as any },
    }), [colors]);

    const PRIORITY_MAP = useMemo(() => ({
        high: { label: 'Alta', color: colors.priority.high },
        medium: { label: 'Média', color: colors.priority.medium },
        low: { label: 'Baixa', color: colors.priority.low },
    }), [colors]);

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filter, setFilter] = useState<TicketStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortKey>('newest');
    const [selected, setSelected] = useState<Ticket | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ratingVisible, setRatingVisible] = useState(false);
    const [pendingResolve, setPendingResolve] = useState<Ticket | null>(null);
    const [responseText, setResponseText] = useState('');
    const [sendingResponse, setSendingResponse] = useState(false);

    const loadTickets = async () => {
        const data = isSupervisor
            ? await ticketService.getAllTickets()
            : await ticketService.getMyTickets(user?.name);
        setTickets(data);
        setLoading(false);
    };

    useEffect(() => { loadTickets(); }, [isSupervisor]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTickets();
        setRefreshing(false);
    };

    const handleResolve = (ticket: Ticket) => {
        setPendingResolve(ticket);
        setRatingVisible(true);
    };

    const finishResolve = async (stars: number, comment: string) => {
        if (!pendingResolve) return;
        await ticketService.updateTicketStatus(pendingResolve.id, 'closed');
        if (stars > 0) await ticketService.rateTicket(pendingResolve.id, stars, comment || undefined);
        setTickets(prev => prev.map(t => t.id === pendingResolve.id ? { ...t, status: 'closed', rating: { stars, comment } } : t));
        setSelected(prev => prev?.id === pendingResolve.id ? { ...prev, status: 'closed' } : prev);
        setRatingVisible(false);
        setPendingResolve(null);
    };

    const handlePriority = async (ticket: Ticket, priority: TicketPriority) => {
        await ticketService.updateTicketPriority(ticket.id, priority);
        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, priority } : t));
        setSelected(prev => prev?.id === ticket.id ? { ...prev, priority } : prev);
    };

    const handleSendResponse = async () => {
        if (!selected || !responseText.trim()) return;
        setSendingResponse(true);
        await ticketService.addResponse(selected.id, responseText.trim(), user?.name ?? 'Supervisor', user?.role as any ?? 'supervisor');
        const updated = { ...selected, responses: [...(selected.responses ?? []), { id: Date.now().toString(), text: responseText.trim(), author: user?.name ?? 'Supervisor', authorRole: (user?.role ?? 'supervisor') as any, createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }], status: selected.status === 'open' ? 'inProgress' as TicketStatus : selected.status };
        setSelected(updated);
        setTickets(prev => prev.map(t => t.id === selected.id ? updated : t));
        setResponseText('');
        setSendingResponse(false);
    };

    const cycleSort = () => {
        const keys: SortKey[] = ['newest', 'oldest', 'priority', 'status'];
        setSort(prev => keys[(keys.indexOf(prev) + 1) % keys.length]);
    };

    const filtered = useMemo(() => {
        let list = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(t => t.subject.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.protocol.includes(q));
        }
        return [...list].sort((a, b) => {
            if (sort === 'newest') return 0; // já está em ordem de criação
            if (sort === 'oldest') return 1;
            if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
            if (sort === 'status') return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
            return 0;
        });
    }, [tickets, filter, search, sort]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.white} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{isSupervisor ? 'Todos os Chamados' : 'Meus Tickets'}</Text>
                    <Text style={styles.headerSub}>{filtered.length} chamado{filtered.length !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.sortBtn} onPress={cycleSort}>
                        <Ionicons name="swap-vertical-outline" size={16} color={colors.primary} />
                        <Text style={styles.sortBtnText}>{SORT_LABELS[sort]}</Text>
                    </TouchableOpacity>
                    {!isSupervisor && (
                        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('AbrirTicket')}>
                            <Ionicons name="add" size={18} color={colors.text.white} />
                            <Text style={styles.newBtnText}>Novo</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ padding: SPACING.xs }}>
                        <Ionicons name="menu-outline" size={28} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                horizontal data={FILTERS} keyExtractor={i => i.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterList}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.filterChip, filter === item.key && styles.filterChipActive]} onPress={() => setFilter(item.key)}>
                        <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                )}
            />

            <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={16} color={colors.text.light} />
                <TextInput style={styles.searchInput} placeholder="Buscar por assunto, categoria ou protocolo..." placeholderTextColor={colors.input.placeholder} value={search} onChangeText={setSearch} clearButtonMode="while-editing" />
                {!!search && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={colors.text.light} /></TouchableOpacity>}
            </View>

            {loading ? (
                <View style={{ padding: SPACING.base }}><TicketSkeleton colors={colors} /></View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={i => i.id}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
                    renderItem={({ item, index }) => {
                        const st = STATUS_MAP[item.status];
                        const pr = PRIORITY_MAP[item.priority];
                        const hasRating = !!item.rating;
                        return (
                            <ReAnimated.View entering={FadeInDown.delay(index * 60).springify()}>
                                <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
                                    <View style={[styles.cardAvatar, { backgroundColor: st.bg }]}>
                                        <Text style={[styles.cardAvatarText, { color: st.color }]}>{item.subject.slice(0, 2).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.cardBody}>
                                        <View style={styles.cardTopRow}>
                                            <Text style={styles.cardSubject} numberOfLines={1}>{item.subject}</Text>
                                            <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                                                <Ionicons name={st.icon} size={11} color={st.color} />
                                                <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardCategory}>{item.category}{isSupervisor ? ` • ${item.name}` : ''}</Text>
                                        <View style={styles.cardBottom}>
                                            <Text style={styles.cardProtocol}>#{item.protocol}</Text>
                                            <View style={styles.priorityWrap}>
                                                <View style={[styles.priorityDot, { backgroundColor: pr.color }]} />
                                                <Text style={[styles.priorityLabel, { color: pr.color }]}>{pr.label}</Text>
                                            </View>
                                            {hasRating && <Ionicons name="star" size={12} color="#F59E0B" />}
                                            <Text style={styles.cardDate}>{item.date}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </ReAnimated.View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="ticket-outline" size={52} color={colors.border.medium} />
                            <Text style={styles.emptyText}>Nenhum ticket encontrado</Text>
                        </View>
                    }
                />
            )}

            {/* Modal de detalhe */}
            <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detalhes do Ticket</Text>
                            <TouchableOpacity onPress={() => setSelected(null)}>
                                <Ionicons name="close" size={24} color={colors.text.secondary} />
                            </TouchableOpacity>
                        </View>
                        {selected && (() => {
                            const st = STATUS_MAP[selected.status];
                            const pr = PRIORITY_MAP[selected.priority];
                            return (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.modalHighlight}>
                                        <Text style={styles.modalSubject}>{selected.subject}</Text>
                                        <Text style={styles.modalProtocol}>Protocolo #{selected.protocol}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLeft}><Ionicons name="pricetag-outline" size={16} color={colors.primary} /><Text style={styles.detailLabel}>Categoria</Text></View>
                                        <Text style={styles.detailValue}>{selected.category}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLeft}><Ionicons name="calendar-outline" size={16} color={colors.primary} /><Text style={styles.detailLabel}>Data</Text></View>
                                        <Text style={styles.detailValue}>{selected.date} às {selected.time}</Text>
                                    </View>

                                    {/* Prioridade — supervisor pode trocar */}
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLeft}><Ionicons name="alert-circle-outline" size={16} color={colors.primary} /><Text style={styles.detailLabel}>Prioridade</Text></View>
                                        {isSupervisor ? (
                                            <View style={styles.prioritySelector}>
                                                {(['low', 'medium', 'high'] as TicketPriority[]).map(p => {
                                                    const pm = PRIORITY_MAP[p];
                                                    const active = selected.priority === p;
                                                    return (
                                                        <TouchableOpacity key={p} onPress={() => handlePriority(selected, p)} style={[styles.prioritySelectorBtn, active && { backgroundColor: pm.color + '22', borderColor: pm.color }]}>
                                                            <View style={[styles.priorityDot, { backgroundColor: pm.color }]} />
                                                            <Text style={[styles.badgeText, { color: pm.color }]}>{pm.label}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        ) : (
                                            <View style={[styles.badge, { backgroundColor: colors.priority.highBg }]}>
                                                <View style={[styles.priorityDot, { backgroundColor: pr.color }]} />
                                                <Text style={[styles.badgeText, { color: pr.color }]}>{pr.label}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Status */}
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLeft}><Ionicons name="radio-button-on-outline" size={16} color={colors.primary} /><Text style={styles.detailLabel}>Status</Text></View>
                                        <View style={[styles.badge, { backgroundColor: st.bg }]}><Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text></View>
                                    </View>

                                    {/* Descrição */}
                                    <Text style={styles.descLabel}>Descrição</Text>
                                    <View style={styles.descBox}><Text style={styles.descText}>{selected.description}</Text></View>

                                    {/* Respostas */}
                                    {(selected.responses?.length ?? 0) > 0 && (
                                        <>
                                            <Text style={styles.descLabel}>Respostas da equipe</Text>
                                            {selected.responses!.map(r => (
                                                <View key={r.id} style={styles.responseCard}>
                                                    <View style={styles.responseHeader}>
                                                        <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                                                        <Text style={styles.responseAuthor}>{r.author}</Text>
                                                        <Text style={styles.responseTime}>{r.createdAt}</Text>
                                                    </View>
                                                    <Text style={styles.responseText}>{r.text}</Text>
                                                </View>
                                            ))}
                                        </>
                                    )}

                                    {/* Rating */}
                                    {selected.rating && (
                                        <View style={styles.ratingRow}>
                                            <Text style={styles.ratingLabel}>Avaliação: </Text>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Ionicons key={s} name={s <= selected.rating!.stars ? 'star' : 'star-outline'} size={16} color="#F59E0B" />
                                            ))}
                                            {selected.rating.comment ? <Text style={styles.ratingComment}> "{selected.rating.comment}"</Text> : null}
                                        </View>
                                    )}

                                    {/* Supervisor: campo de resposta */}
                                    {isSupervisor && selected.status !== 'closed' && (
                                        <View style={styles.responseInput}>
                                            <TextInput
                                                style={styles.responseInputField}
                                                placeholder="Escreva uma resposta ao cliente..."
                                                placeholderTextColor={colors.input.placeholder}
                                                value={responseText}
                                                onChangeText={setResponseText}
                                                multiline
                                                textAlignVertical="top"
                                            />
                                            <TouchableOpacity
                                                style={[styles.responseSendBtn, (!responseText.trim() || sendingResponse) && { opacity: 0.5 }]}
                                                onPress={handleSendResponse}
                                                disabled={!responseText.trim() || sendingResponse}
                                            >
                                                <Ionicons name="send-outline" size={16} color="#FFF" />
                                                <Text style={styles.responseSendText}>Responder</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Marcar como resolvido */}
                                    {selected.status !== 'closed' && (
                                        <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(selected)}>
                                            <Ionicons name="checkmark-circle-outline" size={18} color={colors.text.white} />
                                            <Text style={styles.resolveBtnText}>Marcar como Resolvido</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                                        <Text style={styles.closeBtnText}>Fechar</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            );
                        })()}
                    </View>
                </View>
            </Modal>

            {/* Rating modal */}
            <RatingModal
                visible={ratingVisible}
                onClose={() => { setRatingVisible(false); setPendingResolve(null); finishResolve(0, ''); }}
                onSubmit={finishResolve}
            />
        </View>
    );
};

const makeStyles = (c: Colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.backgroundLight },
    header: { backgroundColor: c.white, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56, paddingBottom: SPACING.base, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: c.border.light },
    headerTitle: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
    headerSub: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.light, marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.status.openBg, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
    sortBtnText: { color: c.primary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
    newBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: c.primary, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
    newBtnText: { color: c.text.white, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.sm },
    filterList: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm },
    filterChip: { paddingHorizontal: SPACING.base, paddingVertical: 5, borderRadius: BORDER_RADIUS.lg, backgroundColor: c.white, borderWidth: 1, borderColor: c.border.medium },
    filterChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    filterText: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.secondary, fontWeight: TYPOGRAPHY.weights.medium },
    filterTextActive: { color: c.text.white, fontWeight: TYPOGRAPHY.weights.bold },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: c.white, marginHorizontal: SPACING.base, marginTop: SPACING.sm, marginBottom: SPACING.xs, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: c.border.light, paddingHorizontal: SPACING.md, height: 40 },
    searchInput: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, color: c.text.primary },
    list: { padding: SPACING.base },
    card: { backgroundColor: c.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.base, flexDirection: 'row', ...SHADOWS.sm },
    cardAvatar: { width: 44, height: 44, borderRadius: BORDER_RADIUS.xl, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardAvatarText: { fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
    cardBody: { flex: 1 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
    cardSubject: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary, flex: 1, marginRight: SPACING.sm },
    statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.circle, paddingHorizontal: SPACING.sm, paddingVertical: 3, gap: 3 },
    statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
    cardCategory: { fontSize: TYPOGRAPHY.sizes.xs, color: c.text.light, marginBottom: SPACING.sm },
    cardBottom: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    cardProtocol: { fontSize: TYPOGRAPHY.sizes.xs, color: c.border.dark, fontWeight: TYPOGRAPHY.weights.semibold },
    priorityWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    priorityDot: { width: 6, height: 6, borderRadius: 3 },
    priorityLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
    cardDate: { fontSize: TYPOGRAPHY.sizes.xs, color: c.border.dark, marginLeft: 'auto' },
    empty: { alignItems: 'center', marginTop: 80 },
    emptyText: { color: c.border.dark, fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.md },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: c.white, borderTopLeftRadius: BORDER_RADIUS.round, borderTopRightRadius: BORDER_RADIUS.round, padding: SPACING.xl, maxHeight: '90%' },
    modalHandle: { width: 36, height: 4, backgroundColor: c.border.medium, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    modalTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
    modalHighlight: { marginBottom: SPACING.lg, paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: c.border.light },
    modalSubject: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
    modalProtocol: { fontSize: TYPOGRAPHY.sizes.sm, color: c.primary, marginTop: SPACING.xs, fontWeight: TYPOGRAPHY.weights.semibold },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    detailLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    detailLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.secondary, fontWeight: TYPOGRAPHY.weights.semibold },
    detailValue: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.primary, fontWeight: TYPOGRAPHY.weights.medium },
    badge: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.circle, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, gap: SPACING.xs },
    badgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
    descLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.secondary, marginTop: SPACING.sm, marginBottom: SPACING.sm },
    descBox: { backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
    descText: { fontSize: TYPOGRAPHY.sizes.md, color: c.text.primary, lineHeight: 20 },
    responseCard: { backgroundColor: c.status.openBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderLeftWidth: 3, borderLeftColor: c.primary },
    responseHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs },
    responseAuthor: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, color: c.primary, flex: 1 },
    responseTime: { fontSize: TYPOGRAPHY.sizes.xs, color: c.text.light },
    responseText: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.primary, lineHeight: 18 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, flexWrap: 'wrap' },
    ratingLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.secondary, fontWeight: TYPOGRAPHY.weights.semibold },
    ratingComment: { fontSize: TYPOGRAPHY.sizes.xs, color: c.text.light, fontStyle: 'italic' },
    responseInput: { marginBottom: SPACING.sm },
    responseInputField: { backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: c.border.light, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.sm, color: c.text.primary, minHeight: 80, marginBottom: SPACING.sm },
    responseSendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: c.primary, borderRadius: BORDER_RADIUS.xl, height: 44, marginBottom: SPACING.sm },
    responseSendText: { color: '#FFF', fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.sm },
    resolveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: c.success, borderRadius: BORDER_RADIUS.xl, height: 48, marginBottom: SPACING.sm },
    resolveBtnText: { color: c.text.white, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
    closeBtn: { backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.xl, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
    closeBtnText: { color: c.text.secondary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
    prioritySelector: { flexDirection: 'row', gap: SPACING.xs },
    prioritySelectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: c.border.medium },
});

export default MeusTicketsScreen;
