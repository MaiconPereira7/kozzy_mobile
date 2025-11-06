// src/screens/NotificacoesScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- MUDANÇA AQUI
import Feather from 'react-native-vector-icons/Feather';

const NotificacoesScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Feather name="bell" size={40} color="#777" />
        <Text style={styles.title}>Notificações</Text>
        <Text style={styles.subtitle}>
          Esta tela ainda está em construção.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default NotificacoesScreen;