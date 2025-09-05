import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CartContext } from '../CartContext';

export default function RestaurantScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { addToCart } = useContext(CartContext);
  const { restaurant } = route.params;

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    fetch(`http://192.168.0.20/fwapi/endpoints/productos.php?restaurante_id=${restaurant.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMenu(data.productos);
        } else {
          console.error('Error del servidor:', data.message);
          setMenu([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error de red:', err);
        setMenu([]);
        setLoading(false);
      });
  }, [restaurant.id]);

  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(''), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{restaurant.name}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="black" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={menu}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    // 👉 Aquí aseguramos incluir restaurant_id
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      restaurant_id: restaurant.id,
                    });
                    showPopup(`${item.name} agregado al carrito`);
                  }}
                >
                  <Text style={styles.addText}>Agregar al carrito</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      {popupMessage !== '' && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>{popupMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    color: '#000',
    marginTop: 2,
  },
  addBtn: {
    marginTop: 8,
    backgroundColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  popup: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    opacity: 0.9,
    zIndex: 10,
  },
  popupText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
