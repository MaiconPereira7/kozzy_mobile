import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS } from '../../theme';
import type { Colors } from '../../theme/colors';
import type { AppDrawerParamList } from '../../types/navigation';

export type QuickAction = {
  label: string;
  icon: any;
  color: string;
  bg: string;
  action: 'navigate' | 'message';
  target?: keyof AppDrawerParamList;
  message?: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Abrir Ticket',       icon: 'ticket-outline',  color: '#E01E26', bg: '#FFF0F0', action: 'navigate', target: 'AbrirTicket' },
  { label: 'Meus Tickets',       icon: 'list-outline',    color: '#3B82F6', bg: '#EFF6FF', action: 'navigate', target: 'MeusTickets' },
  { label: 'Status do Pedido',   icon: 'cube-outline',    color: '#F59E0B', bg: '#FFFBEB', action: 'message',  message: 'Quero saber o status do meu pedido.' },
  { label: 'Falar com Consultor',icon: 'headset-outline', color: '#10B981', bg: '#ECFDF5', action: 'message',  message: 'Gostaria de falar com um consultor humano.' },
];

interface Props {
  onAction: (action: QuickAction) => void;
  colors: Colors;
  isDark: boolean;
}

export const QuickActions = ({ onAction, colors, isDark }: Props) => (
  <View style={styles.actionsSection}>
    <Text style={[styles.actionsLabel, { color: colors.text.light }]}>ACESSO RÁPIDO</Text>
    <View style={styles.actionsGrid}>
      {QUICK_ACTIONS.map(action => (
        <TouchableOpacity
          key={action.label}
          style={[styles.actionBtn, { backgroundColor: isDark ? colors.white : action.bg, borderColor: colors.border.light }]}
          onPress={() => onAction(action)}
          activeOpacity={0.75}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: action.color + '22' }]}>
            <Ionicons name={action.icon} size={22} color={action.color} />
          </View>
          <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
          <Ionicons name="chevron-forward" size={14} color={action.color + '80'} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  actionsSection: { marginBottom: 8 },
  actionsLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, marginLeft: 2 },
  actionsGrid: { gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.xl, paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderWidth: 1 },
  actionIconWrap: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
});
