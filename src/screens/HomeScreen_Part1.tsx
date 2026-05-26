import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// O nome deve ser exatamente HomeScreen_Part1
export const HomeScreen_Part1 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Central Kozzy</Text>
      <Text style={styles.text}>Bem-vindo ao sistema Kozzy Alimentos</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#E31E24' },
  text: { fontSize: 16, marginTop: 10 }
});