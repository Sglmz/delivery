import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const categories = ['Todo', 'Pizza', 'Bebidas', 'Asiática'];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Todo');
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetch('http://192.242.6.127/fwapi/endpoints/restaurantes.php')
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = restaurants.filter((r) => {
    const category = r.category?.toLowerCase?.() || '';
    const selected = selectedCategory?.toLowerCase?.() || '';
    const matchCategory = selected === 'todo' || category === selected;
    const matchSearch = r.name?.toLowerCase?.().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurantes</Text>

      <TextInput
        placeholder="Buscar..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor="#aaa"
      />

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="black" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name || 'Sin nombre'}</Text>
                <Text style={styles.category}>{item.category || 'Sin categoría'}</Text>
                <Text style={styles.time}>{item.time || 'Sin tiempo'}</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.rating}>⭐ {item.rating ?? 'N/A'}</Text>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
                >
                  <Text style={styles.menuButtonText}>Ver Menú</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  searchInput: {
    backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20, marginBottom: 12, fontSize: 14, color: '#000',
  },
  categoryContainer: {
    flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap',
  },
  categoryButton: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: '#f0f0f0', marginRight: 8, marginBottom: 8,
  },
  categoryButtonSelected: { backgroundColor: 'black' },
  categoryText: { color: 'black', fontWeight: 'bold' },
  categoryTextSelected: { color: 'white' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9',
    borderRadius: 10, padding: 12, marginBottom: 10,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', marginRight: 12,
  },
  name: { fontWeight: 'bold' },
  category: { color: '#888', fontSize: 12 },
  time: { fontSize: 12, color: '#aaa' },
  rating: { fontWeight: 'bold', marginBottom: 6, textAlign: 'right' },
  infoRight: { alignItems: 'flex-end', justifyContent: 'space-between', height: 60 },
  menuButton: {
    backgroundColor: '#000', paddingVertical: 6,
    paddingHorizontal: 12, borderRadius: 20, marginTop: 6,
  },
  menuButtonText: {
    color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center',
  },
});
