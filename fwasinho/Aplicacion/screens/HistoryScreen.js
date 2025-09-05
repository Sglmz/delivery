import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.0.20/fwapi/endpoints';
const ENDPOINT_LIST = `${API_BASE}/pedidos_list.php`;
const ENDPOINT_CLEAR = `${API_BASE}/pedidos_clear.php`;

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const rawUser = await AsyncStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user?.id) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${ENDPOINT_LIST}?user_id=${encodeURIComponent(user.id)}`);
      const text = await res.text();
      console.log('pedidos_list.php =>', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respuesta no es JSON válido');
      }

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'No se pudo obtener el historial.');
      }

      const rows = Array.isArray(data?.data) ? data.data : [];

      const normalized = rows.map((o) => ({
        id: o.orden_id ?? o.idOrden ?? o.id ?? null,
        restaurantId: o.restaurant_id ?? null,
        restaurantName: o.restaurant_name ?? 'Restaurante',
        total: Number(o.total ?? 0),
        createdAt: o.fechaCreacion ?? o.created_at ?? o.fecha ?? new Date().toISOString(),
        items: Array.isArray(o.items)
          ? o.items.map((it) => ({
              id: it.product_id ?? null,
              name: it.nombre ?? it.name ?? 'Producto',
              qty: Number(it.cantidad ?? it.qty ?? 0),
              price: Number(it.precio ?? it.price ?? 0),
            }))
          : [],
      }));

      setHistory(normalized);
      setLoading(false);
    } catch (e) {
      console.error('Error cargando historial:', e);
      setLoading(false);
      Alert.alert('Error', e.message || 'No se pudo cargar el historial.');
    }
  };

  const limpiar = async () => {
    try {
      const rawUser = await AsyncStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user?.id) return;

      const res = await fetch(ENDPOINT_CLEAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const text = await res.text();
      console.log('pedidos_clear.php =>', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respuesta no es JSON válido');
      }

      if (!res.ok || data?.success !== true) {
        throw new Error(data?.message || 'No se pudo limpiar el historial.');
      }

      setHistory([]);
      Alert.alert('Listo', 'Se limpió tu historial.');
    } catch (e) {
      console.error('Error limpiando historial:', e);
      Alert.alert('Error', e.message || 'No se pudo limpiar el historial.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historial de pedidos</Text>

      {loading ? (
        <Text style={styles.empty}>Cargando...</Text>
      ) : history.length === 0 ? (
        <Text style={styles.empty}>Aún no tienes pedidos en tu historial</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, i) => `${item.id ?? item.createdAt}-${i}`}
          contentContainerStyle={{ paddingBottom: 60 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.restaurant}>{item.restaurantName}</Text>
                <Text style={styles.total}>Total: ${Number(item.total || 0).toFixed(2)}</Text>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <View>
                {Array.isArray(item.items) && item.items.length > 0 ? (
                  item.items.map((it, idx) => (
                    <Text key={idx} style={styles.item}>
                      {Number(it.qty || 0)}x {it.name}{' '}
                      {it.price != null ? `- $${Number(it.price).toFixed(2)}` : ''}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.item}>—</Text>
                )}
              </View>
            </View>
          )}
        />
      )}

      {history.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={limpiar}>
          <Text style={styles.clearTxt}>Limpiar historial</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', marginTop: 30 },
  empty: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  restaurant: { fontSize: 16, fontWeight: '600' },
  total: { fontSize: 14, color: '#000', marginTop: 4 },
  date: { fontSize: 12, color: '#666', marginTop: 2 },
  item: { fontSize: 12, color: '#444' },
  clearBtn: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  clearTxt: { color: 'white', fontWeight: 'bold' },
});
