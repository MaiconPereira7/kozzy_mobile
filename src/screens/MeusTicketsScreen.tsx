// src/screens/MeusTicketsScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ticketService } from '../services/ticketService';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import type { Ticket, TicketPriority, TicketStatus } from '../types';

const STATUS_MAP: Record<TicketStatus, { label: string; color: string; bg: string; icon: any }> = {
    open: { label: 'Aberto', color: COLORS.status.open, bg: COLORS.status.openBg, icon: 'radio-button-on' },
    inProgress: { label: 'Em andamento', color: COLORS.status.inProgress, bg: COLORS.status.inProgressBg, icon: 'time-outline' },
    closed: { label: 'Encerrado', color: COLORS.status.closed, bg: COLORS.status.closedBg, icon: 'checkmark-circle-outline' },
};

const PRIORITY_MAP: Record<TicketPriority, { label: string; color: string }> = {
    high: { label: 'Alta', color: COLORS.priority.high },
    medium: { label: 'Média', color: COLORS.priority.medium },
    low: { label: 'Baixa', color: COLORS.priority.low },
};

const FILTERS: { key: TicketStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'open', label: 'Abertos' },
    { key: 'inProgress', label: 'Em andamento' },
    { key: 'closed', label: 'Encerrados' },
];

export const MeusTicketsScreen = () => {
    const navigation = useNavigation<any>();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filter, setFilter] = useState<TicketStatus | 'all'>('all');
    const [selected, setSelected] = useState<Ticket | null>(null);

    useEffect(() => {
        ticketService.getMyTickets().then(setTickets);
    }, []);

    const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Meus Tickets</Text>
                    <Text style={styles.headerSub}>{filtered.length} chamado{filtered.length !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('AbrirTicket')}>
                        <Ionicons name="add" size={18} color={COLORS.white} />
                        <Text style={styles.newBtnText}>Novo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ padding: SPACING.xs }}>
                        <Ionicons name="menu-outline" size={28} color={COLORS.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                horizontal data={FILTERS} keyExtractor={i => i.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterList}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
                        onPress={() => setFilter(item.key)}
                    >
                        <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                )}
            />

            <FlatList
                data={filtered}
                keyExtractor={i => i.id}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
                renderItem={({ item }) => {
                    const st = STATUS_MAP[item.status];
                    const pr = PRIORITY_MAP[item.priority];
                    return (
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
                                <Text style={styles.cardCategory}>{item.category}</Text>
                                <View style={styles.cardBottom}>
                                    <Text style={styles.cardProtocol}>#{item.protocol}</Text>
                                    <View style={styles.priorityWrap}>
                                        <View style={[styles.priorityDot, { backgroundColor: pr.color }]} />
                                        <Text style={[styles.priorityLabel, { color: pr.color }]}>{pr.label}</Text>
                                    </View>
                                    <Text style={styles.cardDate}>{item.date}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="ticket-outline" size={52} color={COLORS.border.medium} />
                        <Text style={styles.emptyText}>Nenhum ticket encontrado</Text>
                    </View>
                }
            />

            {/* Modal detalhe */}
            <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detalhes do Ticket</Text>
                            <TouchableOpacity onPress={() => setSelected(null)}>
                                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
                            </TouchableOpacity>
                        </View>
                        {selected && (() => {
                            const st = STATUS_MAP[selected.status];
                            const pr = PRIORITY_MAP[selected.priority];
                            return (
                                <>
                                    <View style={styles.modalHighlight}>
                                        <Text style={styles.modalSubject}>{selected.subject}</Text>
                                        <Text style={styles.modalProtocol}>Protocolo #{selected.protocol}</Text>
                                    </View>
                                    <DetailRow icon="pricetag-outline" label="Categoria" value={selected.category} />
                                    <DetailRow icon="calendar-outline" label="Data" value={`${selected.date} às ${selected.time}`} />
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLeft}>
                                            <Ionicons name="alert-circle-outline" size={16} color={COLORS.primary} />
                                            <Text style={styles.detailLabel}>Prioridade</Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: COLORS.priority.highBg }]}>
                                            <View style={[styles.priorityDot, { backgroundColor: pr.color }]} />
                                            <Text style={[styles.badgeText, { color: pr.color }]}>{pr.label}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLeft}>
                                            <Ionicons name="radio-button-on-outline" size={16} color={COLORS.primary} />
                                            <Text style={styles.detailLabel}>Status</Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: st.bg }]}>
                                            <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.descLabel}>Descrição</Text>
                                    <View style={styles.descBox}>
                                        <Text style={styles.descText}>{selected.description}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                                        <Text style={styles.closeBtnText}>Fechar</Text>
                                    </TouchableOpacity>
                                </>
                            );
                        })()}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const DetailRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailLeft}>
            <Ionicons name={icon} size={16} color={COLORS.primary} />
            <Text style={styles.detailLabel}>{label}</Text>
        </View>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.backgroundLight },
    header: { backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? (require('react-native').StatusBar.currentHeight ?? 0) + 12 : 56, paddingBottom: SPACING.base, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: COLORS.border.light },
    headerTitle: { fontSize: TYPOGRAPHY.sizes.xxl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
    headerSub: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.light, marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    newBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
    newBtnText: { color: COLORS.white, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.sm },
    filterList: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm },
    filterChip: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.circle, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border.medium },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.medium },
    filterTextActive: { color: COLORS.white, fontWeight: TYPOGRAPHY.weights.bold },
    list: { padding: SPACING.base },
    card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.base, flexDirection: 'row', ...SHADOWS.sm },
    cardAvatar: { width: 44, height: 44, borderRadius: BORDER_RADIUS.xl, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardAvatarText: { fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
    cardBody: { flex: 1 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
    cardSubject: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, flex: 1, marginRight: SPACING.sm },
    statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.circle, paddingHorizontal: SPACING.sm, paddingVertical: 3, gap: 3 },
    statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
    cardCategory: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.light, marginBottom: SPACING.sm },
    cardBottom: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    cardProtocol: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.border.dark, fontWeight: TYPOGRAPHY.weights.semibold },
    priorityWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    priorityDot: { width: 6, height: 6, borderRadius: 3 },
    priorityLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
    cardDate: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.border.dark, marginLeft: 'auto' },
    empty: { alignItems: 'center', marginTop: 80 },
    emptyText: { color: COLORS.border.dark, fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.md },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.round, borderTopRightRadius: BORDER_RADIUS.round, padding: SPACING.xl, maxHeight: '85%' },
    modalHandle: { width: 36, height: 4, backgroundColor: COLORS.border.medium, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    modalTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
    modalHighlight: { marginBottom: SPACING.lg, paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border.light },
    modalSubject: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
    modalProtocol: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primary, marginTop: SPACING.xs, fontWeight: TYPOGRAPHY.weights.semibold },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    detailLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    detailLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.semibold },
    detailValue: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },
    badge: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.circle, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, gap: SPACING.xs },
    badgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
    descLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.secondary, marginTop: SPACING.sm, marginBottom: SPACING.sm },
    descBox: { backgroundColor: COLORS.backgroundLight, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg },
    descText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.text.primary, lineHeight: 20 },
    closeBtn: { backgroundColor: COLORS.backgroundLight, borderRadius: BORDER_RADIUS.xl, height: 48, justifyContent: 'center', alignItems: 'center' },
    closeBtnText: { color: COLORS.text.secondary, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
});

export default MeusTicketsScreen;