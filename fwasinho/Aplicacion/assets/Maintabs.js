import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/Home';
import HistoryScreen from '../screens/HistoryScreen';
import CartScreen from '../screens/Cart';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
        tabBarIcon: ({ focused }) => {
          let iconName;

          switch (route.name) {
            case 'Inicio':
              iconName = focused ? 'home-variant' : 'home-variant-outline';
              break;
            case 'Historial':
              iconName = focused ? 'history' : 'history';
              break;
            case 'Carrito':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={26}
              color={focused ? '#FF2E4D' : '#888'}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Carrito" component={CartScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}