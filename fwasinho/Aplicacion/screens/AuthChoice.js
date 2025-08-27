import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function AuthChoiceScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.image} />

      <Text style={styles.title}>Bienvenido a</Text>
      <Text style={styles.appName}>Entrega de Comida</Text>
      <Text style={styles.subtitle}>Pide comida de tus restaurantes favoritos</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Empezar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  image: { width: 250, height: 250},
  title: { fontSize: 22, fontWeight: '600', color: '#333' },
  appName: { fontSize: 28, fontWeight: '900', color: '#000' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginVertical: 20 },
  button: { backgroundColor: '#000', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
