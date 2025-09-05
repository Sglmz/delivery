import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
  if (!name || !email || !password) {
    return Alert.alert('Error', 'Completa todos los campos.');
  }

  try {
    const response = await fetch('http://192.168.0.20/fwapi/endpoints/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: name, email, password }),
    });

    const text = await response.text();
    console.log('Respuesta cruda del servidor:', text);

    const data = JSON.parse(text); 
    if (data.success) {
      Alert.alert('¡Registro exitoso!', `Bienvenido, ${name}`, [
        { text: 'Iniciar sesión', onPress: () => navigation.replace('Login') },
      ]);
    } else {
      Alert.alert('Error', data.message || 'No se pudo registrar.');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Hubo un problema al registrar. Verifica tu conexión.');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crear cuenta</Text>

      <View style={styles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarme</Text>
      </TouchableOpacity>

      <Text style={styles.registerText}>
        ¿Ya tienes cuenta?{' '}
        <Text style={styles.link} onPress={() => navigation.replace('Login')}>Inicia sesión</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 28, textAlign: 'center' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#fafafa' },
  input: { flex: 1, height: 50, paddingLeft: 8 },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  registerText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#333' },
  link: { color: '#000', fontWeight: '600' },
});
