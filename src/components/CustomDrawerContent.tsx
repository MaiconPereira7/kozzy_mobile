import {
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList
} from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// O nome exportado DEVE ser CustomDrawerContent para bater com o seu import
export const CustomDrawerContent = (props: any) => {
    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
            {/* Cabeçalho do Menu Lateral - Estilo Kozzy Alimentos */}
            <View style={styles.header}>
                <View style={styles.logoPlaceholder}>
                    <Text style={styles.brandName}>KOZZY</Text>
                </View>
                <Text style={styles.userName}>Maicon Pereira</Text>
                <Text style={styles.userEmail}>maicon@kozzy.com.br</Text>
            </View>

            {/* Lista de links definida no AppDrawer.tsx (Home, Notificacoes) */}
            <View style={styles.drawerItems}>
                <DrawerItemList {...props} />
            </View>

            {/* Item extra opcional: Sair */}
            <View style={styles.footer}>
                <DrawerItem
                    label="Sair da Conta"
                    onPress={() => console.log('Logout pressionado')}
                    labelStyle={{ color: '#E31E24', fontWeight: 'bold' }}
                />
            </View>
        </DrawerContentScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        alignItems: 'center',
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E31E24', // Cor vermelha da Kozzy
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    brandName: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    userEmail: {
        fontSize: 12,
        color: '#666',
    },
    drawerItems: {
        flex: 1,
        marginTop: 10,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingBottom: 20,
    }
});