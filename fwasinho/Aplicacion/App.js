import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthChoiceScreen from './screens/AuthChoice';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import MainTabs from './assets/Maintabs';
import Restaurant from './screens/Restaurants';

import { CartProvider } from './CartContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null); // 'AuthChoice' | 'MainTabs' | null

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        if (!mounted) return;
        setInitialRoute(user?.id ? 'MainTabs' : 'AuthChoice');
      } catch (e) {
        console.warn('No se pudo leer la sesión:', e);
        if (mounted) setInitialRoute('AuthChoice');
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!initialRoute) {
    // Loader mientras detectamos si hay sesión
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" />
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
          backgroundColor="#ffffff"
        />
      </View>
    );
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
          backgroundColor="#ffffff"
        />
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Restaurant" component={Restaurant} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
