import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useUser } from '../contexts/UserContext';

const CATEGORIAS = ['Entrega', 'Faturamento', 'Produto', 'Comercial', 'Suporte TI', 'Outro'];
const PRIORIDADES = [
    { key: 'low', label: 'Baixa', color: '#10B981', bg: '#ECFDF5' },
    { key: 'medium', label: 'Média', color: '#F59E0B', bg: '#FFFBEB' },
    { key: 'high', label: 'Alta', color: '#EF4444', bg: '#FEF2F2' },
];

export const AbrirTicketScreen = () => {
    const navigation = useNavigation();
    const { user } = useUser();

    const [assunto, setAssunto] = useState('');
    const [descricao, setDescricao] = useState('');
    const [categoria, setCategoria] = useState('');
    const [prioridade, setPrioridade] = useState('medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!assunto.trim() || !descricao.trim() || !categoria) {
            Alert.alert('Campos obrigatórios', 'Preencha assunto, categoria e descrição.');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const protocol = `#${Math.floor(1000 + Math.random() * 9000)}`;
            Alert.alert(
                '✅ Ticket aberto!',
                `Protocolo ${protocol} criado com sucesso.\nNossa equipe entrará em contato em breve.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }, 1200);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Abrir Ticket</Text>
                <View style={{ width: 32 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* Info */}
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
                        <Text style={styles.infoText}>Descreva seu problema e nossa equipe responderá em até 24h.</Text>
                    </View>

                    {/* Assunto */}
                    <Text style={styles.label}>Assunto *</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Problema na entrega do pedido"
                            placeholderTextColor="#BBB"
                            value={assunto}
                            onChangeText={setAssunto}
                            maxLength={80}
                        />
                    </View>

                    {/* Categoria */}
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

                    {/* Prioridade */}
                    <Text style={styles.label}>Prioridade *</Text>
                    <View style={styles.priorityRow}>
                        {PRIORIDADES.map(p => (
                            <TouchableOpacity
                                key={p.key}
                                style={[styles.priorityBtn, prioridade === p.key && { backgroundColor: p.bg, borderColor: p.color, borderWidth: 1.5 }]}
                                onPress={() => setPrioridade(p.key)}
                            >
                                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                                <Text style={[styles.priorityText, prioridade === p.key && { color: p.color, fontWeight: '700' }]}>{p.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Descrição */}
                    <Text style={styles.label}>Descrição *</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="Descreva detalhadamente o problema..."
                        placeholderTextColor="#BBB"
                        value={descricao}
                        onChangeText={setDescricao}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{descricao.length}/500</Text>

                    {/* Solicitante */}
                    <View style={styles.solicitanteCard}>
                        <Ionicons name="person-circle-outline" size={20} color="#E01E26" />
                        <Text style={styles.solicitanteText}>Solicitante: <Text style={{ fontWeight: '700' }}>{user?.name || 'Usuário'}</Text></Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Ionicons name={loading ? 'hourglass-outline' : 'send-outline'} size={18} color="#FFF" />
                        <Text style={styles.submitText}>{loading ? 'Enviando...' : 'Abrir Ticket'}</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    header: {
        backgroundColor: '#FFF',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 56,
        paddingBottom: 16, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
    scroll: { padding: 20, paddingBottom: 40 },
    infoCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 24, gap: 10,
    },
    infoText: { flex: 1, fontSize: 13, color: '#3B82F6', lineHeight: 18 },
    label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 10 },
    inputRow: {
        backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EBEBEB',
        paddingHorizontal: 14, height: 52, justifyContent: 'center', marginBottom: 20,
    },
    input: { fontSize: 14, color: '#222' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0',
    },
    chipActive: { backgroundColor: '#FFF0F0', borderColor: '#E01E26' },
    chipText: { fontSize: 13, color: '#777' },
    chipTextActive: { color: '#E01E26', fontWeight: '700' },
    priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    priorityBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FFF', borderRadius: 10, paddingVertical: 12,
        borderWidth: 1, borderColor: '#E0E0E0', gap: 6,
    },
    priorityDot: { width: 8, height: 8, borderRadius: 4 },
    priorityText: { fontSize: 13, color: '#777' },
    textarea: {
        backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EBEBEB',
        padding: 14, fontSize: 14, color: '#222', minHeight: 120, marginBottom: 6,
    },
    charCount: { fontSize: 11, color: '#BBB', textAlign: 'right', marginBottom: 20 },
    solicitanteCard: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12, marginBottom: 24,
    },
    solicitanteText: { fontSize: 13, color: '#777' },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#E01E26', borderRadius: 14, height: 54, gap: 10,
        shadowColor: '#E01E26', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
    },
    submitText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

export default AbrirTicketScreen;