// src/screens/AbrirTicketScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { ticketService } from '../services/ticketService';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../theme';
import type { TicketPriority } from '../types';

const CATEGORIAS = ['Entrega', 'Faturamento', 'Produto', 'Comercial', 'Suporte TI', 'Outro'];

const PRIORIDADES: { key: TicketPriority; label: string; color: string; bg: string }[] = [
    { key: 'low', label: 'Baixa', color: COLORS.priority.low, bg: COLORS.priority.lowBg },
    { key: 'medium', label: 'Média', color: COLORS.priority.medium, bg: COLORS.priority.mediumBg },
    { key: 'high', label: 'Alta', color: COLORS.priority.high, bg: COLORS.priority.highBg },
];

export const AbrirTicketScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useUser();

    const [assunto, setAssunto] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState('');
    const [prioridade, setPrioridade] = useState<TicketPriority>('medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!assunto.trim() || !descricao.trim() || !categoria) {
            Alert.alert('Campos obrigatórios', 'Preencha assunto, categoria e descrição.');
            return;
        }
        setLoading(true);
        try {
            const ticket = await ticketService.createTicket({
                name: user?.name ?? 'Usuário',
                subject: assunto,
                clientType: 'retail',
                category: categoria,
                priority: prioridade,
                description: descricao,
            });
            Alert.alert(
                '✅ Ticket aberto!',
                `Protocolo #${ticket.protocol} criado com sucesso.\nNossa equipe entrará em contato em breve.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch {
            Alert.alert('Erro', 'Não foi possível abrir o ticket. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Abrir Ticket</Text>
                <View style={{ width: 32 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
                        <Text style={styles.infoText}>Descreva seu problema e nossa equipe responderá em até 24h.</Text>
                    </View>

                    <Text style={styles.label}>Assunto *</Text>
                    <TextInput
                        style={styles.inputBox}
                        placeholder="Ex: Problema na entrega do pedido"
                        placeholderTextColor={COLORS.input.placeholder}
                        value={assunto}
                        onChangeText={setAssunto}
                        maxLength={80}
                    />

                    <Text style={styles.label}>Categoria *</Text>
                    <View style={styles.chipRow}>
                        {CATEGORIAS.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, categoria === cat && styles.chipActive]}
                                onPress={() => setCategoria(cat)}
                            >
                                <Text style={[styles.chipText, categoria === cat && styles.chipTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Prioridade *</Text>
                    <View style={styles.priorityRow}>
                        {PRIORIDADES.map(p => (
                            <TouchableOpacity
                                key={p.key}
                                style={[styles.priorityBtn, prioridade === p.key && { backgroundColor: p.bg, borderColor: p.color, borderWidth: 1.5 }]}
                                onPress={() => setPrioridade(p.key)}
                            >
                                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                                <Text style={[styles.priorityText, prioridade === p.key && { color: p.color, fontWeight: TYPOGRAPHY.weights.bold }]}>{p.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Descrição *</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="Descreva detalhadamente o problema..."
                        placeholderTextColor={COLORS.input.placeholder}
                        value={descricao}
                        onChangeText={setDescricao}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{descricao.length}/500</Text>

                    <View style={styles.solicitanteCard}>
                        <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.solicitanteText}>Solicitante: <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>{user?.name || 'Usuário'}</Text></Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Ionicons name={loading ? 'hourglass-outline' : 'send-outline'} size={18} color={COLORS.white} />
                        <Text style={styles.submitText}>{loading ? 'Enviando...' : 'Abrir Ticket'}</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.backgroundLight },
    header: { backgroundColor: COLORS.white, paddingTop: Platform.OS === 'android' ? (require('react-native').StatusBar.currentHeight ?? 0) + 12 : 56, paddingBottom: SPACING.base, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border.light },
    backBtn: { padding: SPACING.xs },
    headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
    scroll: { padding: SPACING.lg, paddingBottom: SPACING.huge },
    infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: BORDER_RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.xl, gap: SPACING.sm },
    infoText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.info, lineHeight: 18 },
    label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.sm },
    inputBox: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.border.light, paddingHorizontal: SPACING.md, height: 52, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.text.primary, marginBottom: SPACING.lg },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
    chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.circle, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border.medium },
    chipActive: { backgroundColor: COLORS.status.openBg, borderColor: COLORS.primary },
    chipText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
    chipTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
    priorityRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
    priorityBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.border.medium, gap: SPACING.sm },
    priorityDot: { width: 8, height: 8, borderRadius: 4 },
    priorityText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
    textarea: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.border.light, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, color: COLORS.text.primary, minHeight: 120, marginBottom: SPACING.xs },
    charCount: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.light, textAlign: 'right', marginBottom: SPACING.lg },
    solicitanteCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.status.openBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xl },
    solicitanteText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xxl, height: 54, gap: SPACING.sm, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
    submitText: { color: COLORS.white, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.base },
});

export default AbrirTicketScreen;