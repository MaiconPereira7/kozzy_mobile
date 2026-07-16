import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import type { Colors } from '../../theme/colors';

interface Props {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
  colors: Colors;
}

export const ChatInput = ({ inputText, setInputText, onSend, isLoading, colors }: Props) => {
  return (
    <View style={[styles.inputArea, { backgroundColor: colors.white, borderTopColor: colors.border.light }]}>
      <View style={[styles.inputRow, { backgroundColor: colors.backgroundLight, borderColor: colors.border.light }]}>
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.input.placeholder}
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading
            ? <ActivityIndicator size="small" color="#FFF" />
            : <Ionicons name="send" size={18} color="#FFF" />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputArea: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 28 : 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 24, borderWidth: 1, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, gap: 8 },
  input: { flex: 1, fontSize: 15, maxHeight: 100, paddingTop: 6, paddingBottom: 6 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#F0B0B3' },
});
