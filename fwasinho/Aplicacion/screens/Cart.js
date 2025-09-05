import React, { useContext, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, SafeAreaView, Modal, TextInput
} from 'react-native';
import { CartContext } from '../CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = 'http://192.168.0.20/fwapi/endpoints';

export default function CartScreen({ navigation }) {
  const { cartItems, clearCart } = useContext(CartContext);
  const [showPayment, setShowPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const normalizedItems = (cartItems || [])
    .map(it => ({
      id: Number(it.id),
      name: String(it.name ?? ''),
      price: Number(it.price ?? 0),
      qty: Number(it.quantity ?? 0),
      restaurant_id: it.restaurant_id ?? null,
    }))
    .filter(it => it.id && it.qty > 0);

  const total = normalizedItems.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );

  // 👉 Formatear tarjeta en XXXX-XXXX-XXXX-XXXX
  const handleCardNumber = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1-');
    setCardNumber(formatted);
  };

  // 👉 Formatear fecha en MM/AA
  const handleExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    setExpiry(formatted);
  };

  // 👉 CVV solo 3 dígitos
  const handleCvv = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 3);
    setCvv(digits);
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      Alert.alert('Error', 'Por favor completa todos los campos de pago.');
      return;
    }

    try {
      const rawUser = await AsyncStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (!user?.id) {
        Alert.alert('Sesión requerida', 'Inicia sesión para completar la compra.');
        return navigation.replace('Login');
      }

      // ⚠️ Ya NO incluimos los datos de tarjeta en el payload
      const payload = {
        user_id: Number(user.id),
        total: Number(total.toFixed(2)),
        items: normalizedItems.map(it => ({
          id: it.id,
          name: it.name,
          price: Number(it.price || 0),
          qty: Number(it.qty || 0),
          restaurant_id: it.restaurant_id,
        })),
      };

      console.log('Payload =>', payload);

      const res = await fetch(`${API}/pedidos_crear.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('Respuesta =>', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respuesta no es JSON válido.');
      }

      if (!res.ok || data?.success !== true) {
        throw new Error(data?.message || data?.error || 'No se pudo registrar el pedido.');
      }

      setShowPayment(false);
      clearCart(); // 🔥 vacía carrito tras pagar
      Alert.alert('¡Pedido realizado!', 'Tu compra fue registrada.');
      navigation.navigate('Historial');
    } catch (e) {
      console.error('Error en checkout:', e);
      Alert.alert('Error', String(e?.message || e));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Carrito</Text>

        {normalizedItems.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            Tu carrito está vacío.
          </Text>
        ) : (
          <FlatList
            data={normalizedItems}
            keyExtractor={(item, i) => item.id?.toString() || `c-${i}`}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Cant: {item.qty}</Text>
                </View>
                <Text style={styles.price}>${Number(item.price || 0).toFixed(2)}</Text>
              </View>
            )}
          />
        )}
      </View>

      {normalizedItems.length > 0 && (
        <View style={styles.footerContainer}>
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => setShowPayment(true)}>
              <Text style={styles.checkoutText}>Proceder al pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal de pago */}
      <Modal visible={showPayment} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Pago</Text>
            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={handleCardNumber}
              maxLength={19} // 16 dígitos + 3 guiones
            />
            <TextInput
              style={styles.input}
              placeholder="MM/AA"
              keyboardType="numeric"
              value={expiry}
              onChangeText={handleExpiry}
              maxLength={5}
            />
            <TextInput
              style={styles.input}
              placeholder="CVV"
              secureTextEntry
              keyboardType="numeric"
              value={cvv}
              onChangeText={handleCvv}
              maxLength={3}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.checkoutBtn, { flex: 1, marginRight: 8 }]} onPress={handlePayment}>
                <Text style={styles.checkoutText}>Confirmar Pago</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.checkoutBtn, { flex: 1, backgroundColor: '#888' }]} onPress={() => setShowPayment(false)}>
                <Text style={styles.checkoutText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  inner: { width: '100%', maxWidth: 400, paddingHorizontal: 16, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemQty: { fontSize: 13, color: '#666', marginTop: 2 },
  price: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 12,
  },
  footer: { width: '100%', maxWidth: 400, paddingHorizontal: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
  checkoutBtn: {
    backgroundColor: 'black',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  checkoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});