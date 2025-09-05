import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (e) {
        console.error('Error cargando usuario:', e);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      Alert.alert('Sesión cerrada');
      navigation.replace('AuthChoice'); // vuelve a la pantalla inicial de autenticación
    } catch (e) {
      console.error('Error cerrando sesión:', e);
    }
  };

  const nombre = user?.nombre || 'Usuario';
  const email = user?.email || 'correo@ejemplo.com';
  const avatar = user?.avatar || 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png';

  return (
    <View style={styles.container}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <Text style={styles.name}>{nombre}</Text>
      <Text style={styles.email}>{email}</Text>

      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, backgroundColor: '#eee' },
  name: { fontSize: 20, fontWeight: '700' },
  email: { fontSize: 14, color: '#666', marginTop: 4 },
  btn: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 20 },
  btnText: { color: '#fff', fontWeight: '700' },
});
