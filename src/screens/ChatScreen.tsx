import { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../theme/colors'; // Importação essencial para as cores

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export const ChatScreen = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: `Olá ${user?.name || 'Maicon'}! Como posso ajudar na Central Kozzy?`, sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    // Lógica de resposta simulada (Sem necessidade de servidor agora)
    const getBotResponse = (text: string) => {
        const msg = text.toLowerCase();
        if (msg.includes("oi") || msg.includes("olá")) return "Olá! Sou o assistente da Kozzy. Como vai?";
        if (msg.includes("ticket") || msg.includes("ajuda")) return "Posso abrir um chamado para você. Qual o problema?";
        return "Entendido! Registrei sua mensagem.";
    };

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = inputText;
        setInputText('');

        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(currentInput),
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[
                        styles.bubble,
                        item.sender === 'user' ? styles.userBubble : styles.botBubble
                    ]}>
                        <Text style={item.sender === 'user' ? styles.userText : styles.botText}>
                            {item.text}
                        </Text>
                    </View>
                )}
                contentContainerStyle={{ padding: 15 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Digite sua mensagem..."
                    placeholderTextColor="#999"
                />
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
    userText: { color: '#FFF' },
    botText: { color: '#333' },
    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
    input: { flex: 1, height: 45, borderWidth: 1, borderColor: '#DDD', borderRadius: 22, paddingHorizontal: 15 },
    sendButton: { marginLeft: 10, backgroundColor: COLORS.primary, borderRadius: 22, justifyContent: 'center', paddingHorizontal: 15 }
});