import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const NotificacoesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      <Text>Você não tem novas notificações.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 }
});