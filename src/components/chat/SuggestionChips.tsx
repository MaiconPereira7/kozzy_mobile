import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Colors } from '../../theme/colors';

interface Props {
  suggestions: string[];
  onSelect: (text: string) => void;
  colors: Colors;
}

export const SuggestionChips = ({ suggestions, onSelect, colors }: Props) => {
  if (suggestions.length === 0) return null;

  return (
    <View style={[styles.row, { backgroundColor: colors.white, borderTopColor: colors.border.light }]}>
      {suggestions.map(s => (
        <TouchableOpacity
          key={s}
          style={[styles.chip, { backgroundColor: colors.backgroundLight, borderColor: colors.border.medium }]}
          onPress={() => onSelect(s)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, { color: colors.text.primary }]}>{s}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
});
