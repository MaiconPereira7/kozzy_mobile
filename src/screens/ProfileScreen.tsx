import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../contexts/UserContext'; // <--- Importa Contexto

export default function ProfileScreen() {
  const navigation = useNavigation(); 
  
  // PEGA DADOS E FUNÇÃO DE ATUALIZAR DO GLOBAL
  const { user, updateUser } = useContext(UserContext);

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });

  const handleEdit = () => {
    setTempUser({ ...user }); 
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempUser({ ...user }); 
  };

  const handleSave = () => {
    if (!tempUser.name || !tempUser.email) {
      Alert.alert("Erro", "Nome e Email são obrigatórios!");
      return;
    }
    
    // ATUALIZA O ESTADO GLOBAL AQUI
    updateUser(tempUser);
    
    setIsEditing(false);
    Alert.alert("Sucesso", "Perfil atualizado!");
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setTempUser({ ...tempUser, avatar: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <View style={styles.avatarContainer}>
          <Image 
            source={ 
              (isEditing ? tempUser.avatar : user.avatar) 
              ? { uri: isEditing ? tempUser.avatar! : user.avatar! } 
              : require('../../assets/adaptive-icon.png') 
            } 
            style={styles.avatar} 
          />
          {isEditing && (
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={isEditing ? tempUser.name : user.name}
            onChangeText={(text) => setTempUser({...tempUser, name: text})}
            editable={isEditing}
          />
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={isEditing ? tempUser.email : user.email}
            onChangeText={(text) => setTempUser({...tempUser, email: text})}
            editable={isEditing}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value="******" 
            editable={false} // Senha bloqueada visualmente para simplificar
            secureTextEntry={true} 
          />
        </View>

        <View style={styles.buttonContainer}>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.buttonText}>Editar Perfil</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
    height: 50,
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 30,
    marginTop: 10,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFF',
    backgroundColor: '#E1E1E1'
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#e60023',
    padding: 10,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#F5F5F5',
  },
  formContainer: { width: '90%' },
  label: {
    color: '#e60023',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0', 
    color: '#777',
    borderColor: 'transparent'
  },
  buttonContainer: {
    marginTop: 40,
    width: '90%',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#e60023',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#e60023',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#FFF', 
    borderWidth: 2,
    borderColor: '#e60023',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
    color: '#e60023',
    fontWeight: 'bold',
    fontSize: 16,
  }
});