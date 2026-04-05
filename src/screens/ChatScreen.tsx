import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { apiPost } from '../services/api';
import { COLORS } from '../theme/colors';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export const ChatScreen = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: `Olá ${user?.name || 'Maicon'}! Como a Kozzy pode te ajudar hoje?`, sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        try {
            // Chama a nova rota do chatbot no seu server.js
            const response = await apiPost('/chatbot', { message: inputText, userId: user?.id });
            const botMsg: Message = { id: response.id, text: response.text, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: 'err', text: 'Erro de conexão com a Central.', sender: 'bot' }]);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                        <Text style={item.sender === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
                    </View>
                )}
                contentContainerStyle={{ padding: 15 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={inputText} onChangeText={setInputText} placeholder="Digite sua dúvida..." />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enviar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    bubble: { padding: 12, borderRadius: 18, marginBottom: 10, maxWidth: '80%' },
    userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary }, // Vermelho Kozzy
    botBubble: { alignSelf: 'flex-start', backgroundColor: '#E1E1E1' },
    userText: { color: COLORS.white },
    botText: { color: COLORS.text.primary },
    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
    input: { flex: 1, height: 45, borderWidth: 1, borderColor: '#DDD', borderRadius: 22, paddingHorizontal: 15 },
    sendButton: { marginLeft: 10, backgroundColor: COLORS.primary, borderRadius: 22, justifyContent: 'center', paddingHorizontal: 15 }
});