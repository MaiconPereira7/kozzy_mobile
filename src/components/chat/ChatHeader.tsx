import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppDrawerNavigationProp } from '../../types/navigation';

interface Props {
  onClear: () => void;
}

export const ChatHeader = ({ onClear }: Props) => {
  const navigation = useNavigation<AppDrawerNavigationProp>();

  return (
    <View style={styles.header}>
      <View style={styles.headerInner}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>KZ</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Central Kozzy</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Assistente Online</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={15} color="rgba(255,255,255,0.9)" />
            <Text style={styles.clearBtnText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={styles.menuBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#E01E26',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 5 },
  onlineText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { padding: 4 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  clearBtnText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },
});
