import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { ticketService } from '../services/ticketService';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { Colors } from '../theme/colors';
import type { AppDrawerNavigationProp } from '../types/navigation';

const CATEGORIAS = ['Entrega', 'Faturamento', 'Produto', 'Comercial', 'Suporte TI', 'Outro'];

export const AbrirTicketScreen = () => {
    const navigation = useNavigation<AppDrawerNavigationProp>();
    const { user } = useUser();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => makeStyles(colors), [colors]);

    const [assunto, setAssunto] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState('');
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
                description: descricao,
                // prioridade definida pelo admin após triagem
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
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.white} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Abrir Ticket</Text>
                <View style={{ width: 32 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                        <Text style={styles.infoText}>Descreva seu problema e nossa equipe responderá em até 24h.</Text>
                    </View>

                    <Text style={styles.label}>Assunto *</Text>
                    <TextInput
                        style={styles.inputBox}
                        placeholder="Ex: Problema na entrega do pedido"
                        placeholderTextColor={colors.input.placeholder}
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

                    <Text style={styles.label}>Descrição *</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="Descreva detalhadamente o problema..."
                        placeholderTextColor={colors.input.placeholder}
                        value={descricao}
                        onChangeText={setDescricao}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{descricao.length}/500</Text>

                    <View style={styles.solicitanteCard}>
                        <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                        <Text style={styles.solicitanteText}>Solicitante: <Text style={{ fontWeight: TYPOGRAPHY.weights.bold, color: colors.text.primary }}>{user?.name || 'Usuário'}</Text></Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Ionicons name={loading ? 'hourglass-outline' : 'send-outline'} size={18} color={colors.text.white} />
                        <Text style={styles.submitText}>{loading ? 'Enviando...' : 'Abrir Ticket'}</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const makeStyles = (c: Colors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.backgroundLight },
    header: { backgroundColor: c.white, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56, paddingBottom: SPACING.base, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: c.border.light },
    backBtn: { padding: SPACING.xs },
    headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary },
    scroll: { padding: SPACING.lg, paddingBottom: SPACING.huge },
    infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.backgroundLight, borderRadius: BORDER_RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.xl, gap: SPACING.sm, borderWidth: 1, borderColor: c.border.light },
    infoText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, color: c.info, lineHeight: 18 },
    label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, color: c.text.primary, marginBottom: SPACING.sm },
    inputBox: { backgroundColor: c.white, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: c.border.light, paddingHorizontal: SPACING.md, height: 52, fontSize: TYPOGRAPHY.sizes.md, color: c.text.primary, marginBottom: SPACING.lg },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
    chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.xl, backgroundColor: c.white, borderWidth: 1, borderColor: c.border.medium },
    chipActive: { backgroundColor: c.status.openBg, borderColor: c.primary },
    chipText: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.secondary },
    chipTextActive: { color: c.primary, fontWeight: TYPOGRAPHY.weights.bold },
    textarea: { backgroundColor: c.white, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: c.border.light, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, color: c.text.primary, minHeight: 120, marginBottom: SPACING.xs },
    charCount: { fontSize: TYPOGRAPHY.sizes.xs, color: c.text.light, textAlign: 'right', marginBottom: SPACING.lg },
    solicitanteCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: c.status.openBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xl },
    solicitanteText: { fontSize: TYPOGRAPHY.sizes.sm, color: c.text.secondary },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary, borderRadius: BORDER_RADIUS.xxl, height: 54, gap: SPACING.sm, shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
    submitText: { color: c.text.white, fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.base },
});

export default AbrirTicketScreen;
