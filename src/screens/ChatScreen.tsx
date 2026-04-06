import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView, Platform, SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useUser } from '../contexts/UserContext';

export const ChatScreen = () => {
    const { user } = useUser();
    const navigation = useNavigation();
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    // MENSAGENS
    const [messages, setMessages] = useState([
        { id: '1', text: `Olá, ${user?.name || 'Maicon'}! 👋\nSou a Kozzy. Como posso ajudar a Kozzy Alimentos hoje?`, type: 'bot' }
    ]);

    // ESTADO DO FORMULÁRIO DO TICKET
    const [fluxo, setFluxo] = useState<{
        ativo: boolean;
        etapa: 'tipo_cliente' | 'area' | 'descricao' | 'finalizado';
        dados: {
            origem: string;
            status: string;
            tipo_cliente: string;
            area: string;
            descricao: string;
            data_hora: string;
        }
    }>({
        ativo: false,
        etapa: 'tipo_cliente',
        dados: {
            origem: 'App Mobile',
            status: 'Aberto',
            tipo_cliente: '',
            area: '',
            descricao: '',
            data_hora: ''
        }
    });

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const addMessage = (text: string, type: 'user' | 'bot') => {
        setMessages(prev => [...prev, { id: Math.random().toString(), text, type }]);
    };

    // LOGICA DO ATENDIMENTO
    const processarResposta = (msg: string) => {
        if (msg.toLowerCase() === 'abrir ticket' && !fluxo.ativo) {
            setFluxo({
                ...fluxo,
                ativo: true,
                etapa: 'tipo_cliente',
                dados: { ...fluxo.dados, data_hora: new Date().toLocaleString('pt-BR') }
            });
            addMessage("Com certeza! Vamos abrir um ticket. Primeiro, qual o **Tipo de Cliente**? (Ex: Varejo, Atacado, Interno)", "bot");
            return;
        }

        if (fluxo.ativo) {
            const novosDados = { ...fluxo.dados };

            switch (fluxo.etapa) {
                case 'tipo_cliente':
                    novosDados.tipo_cliente = msg;
                    setFluxo({ ...fluxo, etapa: 'area', dados: novosDados });
                    addMessage("Entendido. Qual a **Área ou Departamento** responsável?", "bot");
                    break;

                case 'area':
                    novosDados.area = msg;
                    setFluxo({ ...fluxo, etapa: 'descricao', dados: novosDados });
                    addMessage("Perfeito. Agora, por favor, me dê uma **Descrição curta** do que está acontecendo.", "bot");
                    break;

                case 'descricao':
                    novosDados.descricao = msg;
                    setFluxo({ ...fluxo, ativo: false, etapa: 'finalizado', dados: novosDados });

                    // RESUMO DO TICKET
                    const resumo = `✅ **Ticket Criado!**\n\n` +
                        `📍 Origem: ${novosDados.origem}\n` +
                        `📊 Status: ${novosDados.status}\n` +
                        `👤 Cliente: ${novosDados.tipo_cliente}\n` +
                        `🏢 Área: ${novosDados.area}\n` +
                        `📝 Descrição: ${novosDados.descricao}\n` +
                        `📅 Data: ${novosDados.data_hora}`;

                    addMessage(resumo, "bot");

                    // AQUI VOCÊ PODE DAR UM CONSOLE.LOG PARA VER O OBJETO PRONTO
                    console.log("DADOS PARA O BANCO:", novosDados);
                    break;
            }
        } else {
            addMessage("Entendi! Para abrir um chamado, clique no botão acima ou digite 'Abrir ticket'.", "bot");
        }
    };

    const handleSend = (override?: string) => {
        const texto = override || inputText;
        if (!texto.trim()) return;

        addMessage(texto, 'user');
        setInputText('');

        // Simula tempo de resposta
        setTimeout(() => processarResposta(texto), 600);
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <SafeAreaView style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>KZ</Text></View>
                        <View>
                            <Text style={styles.headerTitle}>Central Kozzy</Text>
                            <View style={styles.statusRow}><View style={styles.dot} /><Text style={styles.statusText}>Online</Text></View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
                        <Ionicons name="menu-outline" size={36} color="#FFF" />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.welcomeCard}>
                        <Text style={styles.welcomeTitle}>Olá, {user?.name || 'Maicon'}! 👋</Text>
                        <Text style={styles.welcomeBody}>Como posso ajudar a Kozzy Alimentos hoje?</Text>
                    </View>

                    <Text style={styles.sectionLabel}>OPÇÕES RÁPIDAS</Text>

                    <View style={styles.grid}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#1E1E1E' }]} onPress={() => handleSend('Abrir ticket')}>
                            <Ionicons name="ticket-outline" size={24} color="#FFF" />
                            <Text style={styles.btnText}>Abrir ticket</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#334155' }]} onPress={() => handleSend('Ver meus tickets')}>
                            <Ionicons name="list-outline" size={24} color="#FFF" />
                            <Text style={styles.btnText}>Ver meus tickets</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#7E3AF2' }]} onPress={() => handleSend('Problema no pedido')}>
                            <Ionicons name="cube-outline" size={24} color="#FFF" />
                            <Text style={styles.btnText}>Problema no pedido</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#057A55' }]} onPress={() => handleSend('Falar com consultor')}>
                            <Ionicons name="person-outline" size={24} color="#FFF" />
                            <Text style={styles.btnText}>Falar com consultor</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.dateDivider}>hoje</Text>

                    {messages.map((msg) => (
                        <View key={msg.id} style={msg.type === 'bot' ? styles.botMsgWrapper : styles.userMsgWrapper}>
                            <View style={msg.type === 'bot' ? styles.botMsg : styles.userMsg}>
                                <Text style={msg.type === 'bot' ? styles.botMsgText : styles.userMsgText}>{msg.text}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputArea}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Digite aqui..."
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity onPress={() => handleSend()}>
                            <Ionicons name="send" size={24} color="#E01E26" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: '#E01E26', paddingBottom: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'android' ? 40 : 0, paddingHorizontal: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#FFF', fontWeight: 'bold' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 6 },
    statusText: { color: '#EEE', fontSize: 12 },
    scrollContent: { padding: 15 },
    welcomeCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
    welcomeTitle: { fontSize: 18, fontWeight: 'bold', color: '#E01E26' },
    welcomeBody: { color: '#666', marginTop: 5 },
    sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#AAA', textAlign: 'center', marginBottom: 15 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    btn: { width: '48%', height: 90, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 3 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginTop: 5 },
    dateDivider: { textAlign: 'center', color: '#CCC', marginVertical: 20, fontSize: 12 },
    botMsgWrapper: { alignSelf: 'flex-start', marginBottom: 15, maxWidth: '85%' },
    botMsg: { backgroundColor: '#FFF', padding: 15, borderRadius: 18, borderTopLeftRadius: 2, elevation: 1 },
    botMsgText: { color: '#333', fontSize: 15 },
    userMsgWrapper: { alignSelf: 'flex-end', marginBottom: 15, maxWidth: '85%' },
    userMsg: { backgroundColor: '#E01E26', padding: 15, borderRadius: 18, borderTopRightRadius: 2 },
    userMsgText: { color: '#FFF', fontSize: 15 },
    inputArea: { backgroundColor: '#FFF', padding: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: 30, paddingHorizontal: 15, height: 50 },
    input: { flex: 1, fontSize: 16 }
});

export default ChatScreen;