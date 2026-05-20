import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    FlatList, Modal, Platform, StatusBar, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';

type Status = 'open' | 'inProgress' | 'closed';
type Priority = 'high' | 'medium' | 'low';

interface Ticket {
    id: string; protocol: string; subject: string; category: string;
    status: Status; priority: Priority; date: string; time: string; description: string;
}

const MOCK_TICKETS: Ticket[] = [
    { id: '1', protocol: '1042', subject: 'Produto com defeito', category: 'Produto', status: 'open', priority: 'high', date: '19/05/2025', time: '14:30', description: 'Recebi o lote com embalagens danificadas. Preciso de substituição urgente.' },
    { id: '2', protocol: '1039', subject: 'Atraso na entrega', category: 'Entrega', status: 'inProgress', priority: 'medium', date: '17/05/2025', time: '09:15', description: 'O pedido estava previsto para o dia 15 mas ainda não chegou.' },
    { id: '3', protocol: '1031', subject: 'Dúvida no boleto', category: 'Faturamento', status: 'closed', priority: 'low', date: '10/05/2025', time: '11:00', description: 'Não entendi a cobrança adicional na fatura de abril.' },
    { id: '4', protocol: '1028', subject: 'Solicitação de consultor', category: 'Comercial', status: 'closed', priority: 'medium', date: '05/05/2025', time: '16:45', description: 'Gostaria de falar com um consultor para renegociar meu plano.' },
];

const STATUS_MAP: Record<Status, { label: string; color: string; bg: string; icon: any }> = {
    open: { label: 'Aberto', color: '#E01E26', bg: '#FFF0F0', icon: 'radio-button-on' },
    inProgress: { label: 'Em andamento', color: '#F59E0B', bg: '#FFFBEB', icon: 'time-outline' },
    closed: { label: 'Encerrado', color: '#10B981', bg: '#ECFDF5', icon: 'checkmark-circle-outline' },
};

const PRIORITY_MAP: Record<Priority, { label: string; color: string }> = {
    high: { label: 'Alta', color: '#EF4444' },
    medium: { label: 'Média', color: '#F59E0B' },
    low: { label: 'Baixa', color: '#10B981' },
};

const FILTERS: { key: Status | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'open', label: 'Abertos' },
    { key: 'inProgress', label: 'Em andamento' },
    { key: 'closed', label: 'Encerrados' },
];

export const MeusTicketsScreen = () => {
    const navigation = useNavigation<any>();
    const [filter, setFilter] = useState<Status | 'all'>('all');
    const [selected, setSelected] = useState<Ticket | null>(null);

    const filtered = filter === 'all' ? MOCK_TICKETS : MOCK_TICKETS.filter(t => t.status === filter);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Meus Tickets</Text>
                    <Text style={styles.headerSub}>{filtered.length} chamado{filtered.length !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('AbrirTicket')}>
                        <Ionicons name="add" size={18} color="#FFF" />
                        <Text style={styles.newBtnText}>Novo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ padding: 4 }}>
                        <Ionicons name="menu-outline" size={28} color="#222" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filtros */}
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
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="ticket-outline" size={52} color="#DDD" />
                        <Text style={styles.emptyText}>Nenhum ticket encontrado</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const st = STATUS_MAP[item.status];
                    const pr = PRIORITY_MAP[item.priority];
                    const initials = item.subject.slice(0, 2).toUpperCase();
                    return (
                        <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.8}>
                            <View style={styles.cardLeft}>
                                <View style={[styles.cardAvatar, { backgroundColor: st.bg }]}>
                                    <Text style={[styles.cardAvatarText, { color: st.color }]}>{initials}</Text>
                                </View>
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
            />

            {/* Modal detalhe */}
            <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detalhes do Ticket</Text>
                            <TouchableOpacity onPress={() => setSelected(null)}>
                                <Ionicons name="close" size={24} color="#888" />
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
                                    <Row icon="pricetag-outline" label="Categoria" value={selected.category} />
                                    <Row icon="calendar-outline" label="Data" value={`${selected.date} às ${selected.time}`} />
                                    <View style={styles.row}>
                                        <View style={styles.rowLeft}>
                                            <Ionicons name="alert-circle-outline" size={16} color="#E01E26" />
                                            <Text style={styles.rowLabel}>Prioridade</Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: '#FFF0F0' }]}>
                                            <View style={[styles.priorityDot, { backgroundColor: pr.color }]} />
                                            <Text style={[styles.badgeText, { color: pr.color }]}>{pr.label}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.rowLeft}>
                                            <Ionicons name="radio-button-on-outline" size={16} color="#E01E26" />
                                            <Text style={styles.rowLabel}>Status</Text>
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

const Row = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={styles.row}>
        <View style={styles.rowLeft}>
            <Ionicons name={icon} size={16} color="#E01E26" />
            <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Text style={styles.rowValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    header: {
        backgroundColor: '#FFF',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56,
        paddingBottom: 16, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#222' },
    headerSub: { fontSize: 13, color: '#999', marginTop: 2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    newBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#E01E26', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    },
    newBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    filterList: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0' },
    filterChipActive: { backgroundColor: '#E01E26', borderColor: '#E01E26' },
    filterText: { fontSize: 13, color: '#777', fontWeight: '500' },
    filterTextActive: { color: '#FFF', fontWeight: '700' },
    list: { padding: 16 },
    empty: { alignItems: 'center', marginTop: 80 },
    emptyText: { color: '#CCC', fontSize: 15, marginTop: 12 },
    card: {
        backgroundColor: '#FFF', borderRadius: 14, padding: 16, flexDirection: 'row',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    cardLeft: { marginRight: 12 },
    cardAvatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cardAvatarText: { fontWeight: '700', fontSize: 14 },
    cardBody: { flex: 1 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardSubject: { fontSize: 14, fontWeight: '700', color: '#222', flex: 1, marginRight: 8 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, gap: 3 },
    statusText: { fontSize: 11, fontWeight: '600' },
    cardCategory: { fontSize: 12, color: '#999', marginBottom: 8 },
    cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardProtocol: { fontSize: 12, color: '#BBB', fontWeight: '600' },
    priorityWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    priorityDot: { width: 6, height: 6, borderRadius: 3 },
    priorityLabel: { fontSize: 11, fontWeight: '600' },
    cardDate: { fontSize: 11, color: '#CCC', marginLeft: 'auto' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
    modalHandle: { width: 36, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
    modalHighlight: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalSubject: { fontSize: 20, fontWeight: '700', color: '#222' },
    modalProtocol: { fontSize: 13, color: '#E01E26', marginTop: 4, fontWeight: '600' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rowLabel: { fontSize: 13, color: '#888', fontWeight: '600' },
    rowValue: { fontSize: 13, color: '#333', fontWeight: '500' },
    badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    descLabel: { fontSize: 13, fontWeight: '700', color: '#888', marginTop: 6, marginBottom: 8 },
    descBox: { backgroundColor: '#F7F8FA', borderRadius: 10, padding: 14, marginBottom: 20 },
    descText: { fontSize: 14, color: '#333', lineHeight: 20 },
    closeBtn: { backgroundColor: '#F7F8FA', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center' },
    closeBtnText: { color: '#888', fontWeight: '700', fontSize: 14 },
});

export default MeusTicketsScreen;