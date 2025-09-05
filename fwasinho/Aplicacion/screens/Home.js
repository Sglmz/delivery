import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    let alive = true;
    fetch('http://192.168.0.20/fwapi/endpoints/restaurantes.php')
      .then((res) => res.json())
      .then((data) => {
        if (alive) {
          setRestaurants(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const filtered = restaurants.filter((r) => {
    const name = (r.name || r.nombre || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Restaurantes</Text>

      <TextInput
        placeholder="Buscar..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor="#aaa"
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) =>
            item.id?.toString?.() ||
            item.idRestaurante?.toString?.() ||
            `r-${i}`
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
              No hay restaurantes que coincidan con la búsqueda.
            </Text>
          }
          renderItem={({ item }) => {
            const name = item.name || item.nombre || 'Sin nombre';
            const category = item.category || item.categoria || 'Sin categoría';
            const time = item.time || item.tiempo || 'Sin tiempo';
            const rating = item.rating ?? item.calificacion ?? 'N/A';

            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.category}>{category}</Text>
                  <Text style={styles.time}>{time}</Text>
                </View>
                <View style={styles.infoRight}>
                  <Text style={styles.rating}>⭐ {rating}</Text>
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
                  >
                    <Text style={styles.menuButtonText}>Ver Menú</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 30, marginBottom: 20, textAlign: 'center' },
  searchInput: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    fontSize: 14,
    color: '#000'
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  name: { fontWeight: 'bold' },
  category: { color: '#888', fontSize: 12 },
  time: { fontSize: 12, color: '#aaa' },
  rating: { fontWeight: 'bold', marginBottom: 6, textAlign: 'right' },
  infoRight: { alignItems: 'flex-end', justifyContent: 'space-between', height: 60 },
  menuButton: { backgroundColor: '#000', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginTop: 6 },
  menuButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
});