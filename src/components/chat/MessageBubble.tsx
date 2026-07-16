import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Colors } from '../../theme/colors';
import type { ChatMessage } from '../../types';

interface Props {
  message: ChatMessage;
  colors: Colors;
  onRetry: (msg: ChatMessage) => void;
}

export const MessageBubble = ({ message: msg, colors, onRetry }: Props) => {
  const s = useMemo(() => makeStyles(colors), [colors]);

  if (msg.type === 'bot') {
    return (
      <View style={s.botRow}>
        <View style={s.botAvatar}>
          <Text style={s.botAvatarText}>KZ</Text>
        </View>
        <View style={s.msgColumn}>
          <View style={[s.botBubble, msg.failed && s.failedBubble]}>
            <Text style={s.botText}>{msg.text}</Text>
          </View>
          <View style={s.msgMeta}>
            <Text style={s.msgTime}>{msg.time}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.userRow}>
      <View style={s.msgColumn}>
        <View style={[s.userBubble, msg.failed && s.failedBubble]}>
          <Text style={s.userText}>{msg.text}</Text>
        </View>
        <View style={[s.msgMeta, { alignSelf: 'flex-end' }]}>
          <Text style={s.msgTime}>{msg.time}</Text>
          {msg.failed && (
            <TouchableOpacity
              onPress={() => onRetry(msg)}
              style={s.retryBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.6}
            >
              <Ionicons name="refresh-outline" size={13} color="#E01E26" />
              <Text style={s.retryText}>Reenviar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const makeStyles = (c: Colors) => StyleSheet.create({
  botRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
  userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  botAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E01E26', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  botAvatarText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  msgColumn: { flex: 1, maxWidth: '85%' },
  botBubble: { backgroundColor: c.white, padding: 14, borderRadius: 18, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  userBubble: { backgroundColor: '#E01E26', padding: 14, borderRadius: 18, borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  failedBubble: { opacity: 0.6 },
  botText: { color: c.text.primary, fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginHorizontal: 4 },
  msgTime: { fontSize: 10, color: c.text.light },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 2, paddingHorizontal: 4 },
  retryText: { fontSize: 11, color: '#E01E26', fontWeight: '600' },
});
