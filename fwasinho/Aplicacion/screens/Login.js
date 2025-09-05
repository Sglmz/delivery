import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = 'http://192.168.0.20/fwapi/endpoints';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Completa todos los campos.');
    }

    try {
      const response = await fetch(`${API}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log('Respuesta cruda:', text);

      const data = JSON.parse(text);

      if (data.success && data.user) {
        // Guardamos la sesión en almacenamiento local
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        Alert.alert('Éxito', `Bienvenido: ${data.user?.nombre || email}`);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error', data.message || 'Credenciales incorrectas.');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Iniciar sesión</Text>

      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        ¿No tienes una cuenta?{' '}
        <Text style={styles.link} onPress={() => navigation.replace('Register')}>
          Regístrate
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 28, textAlign: 'center' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  input: { flex: 1, height: 50, paddingLeft: 8 },
  linkRight: { alignSelf: 'flex-end', color: '#666', marginBottom: 20 },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  registerText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#333' },
  link: { color: '#000', fontWeight: '600' },
});
