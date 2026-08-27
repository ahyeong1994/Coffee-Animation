import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {BottomTabs} from './components/common/BottomTabs';
import {initialDeliveries} from './data/coffee';
import {CartScreen} from './screens/CartScreen';
import {CoffeeCameraScreen} from './screens/CoffeeCameraScreen';
import {DeliveryScreen} from './screens/DeliveryScreen';
import {OrderScreen} from './screens/OrderScreen';
import {ProfileScreen} from './screens/ProfileScreen';
import {colors} from './theme';
import {AppTab, CartLine, Coffee, Delivery} from './types/app';

const App = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<AppTab>('order');
  const [profileCameraOpen, setProfileCameraOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const pageProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    pageProgress.setValue(0);
    Animated.timing(pageProgress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTab, pageProgress, profileCameraOpen]);

  const addToCart = (coffee: Coffee) => {
    setCart(current => {
      const existing = current.find(line => line.coffee.id === coffee.id);
      if (existing) {
        return current.map(line =>
          line.coffee.id === coffee.id
            ? {...line, quantity: line.quantity + 1}
            : line,
        );
      }
      return [...current, {coffee, quantity: 1}];
    });
  };

  const changeQuantity = (coffeeId: string, quantity: number) => {
    setCart(current =>
      current.map(line =>
        line.coffee.id === coffeeId
          ? {...line, quantity: Math.max(1, Math.min(quantity, 999))}
          : line,
      ),
    );
  };

  const removeFromCart = (coffeeId: string) => {
    setCart(current => current.filter(line => line.coffee.id !== coffeeId));
  };

  const checkout = () => {
    if (cart.length === 0) {
      return;
    }
    const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
    const newDelivery: Delivery = {
      id: `CF-${String(Date.now()).slice(-4)}`,
      title: `${itemCount} ${itemCount === 1 ? 'coffee' : 'coffees'}`,
      status: 'Brewing',
      eta: '12–18 min',
      address: 'Home · Kuala Lumpur',
    };
    setDeliveries(current => [newDelivery, ...current]);
    setCart([]);
    setActiveTab('delivery');
  };

  const changeDeliveryStatus = (
    deliveryId: string,
    status: Delivery['status'],
  ) => {
    setDeliveries(current =>
      current.map(delivery =>
        delivery.id === deliveryId ? {...delivery, status} : delivery,
      ),
    );
  };

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  const renderScreen = () => {
    if (profileCameraOpen) {
      return <CoffeeCameraScreen onBack={() => setProfileCameraOpen(false)} />;
    }

    switch (activeTab) {
      case 'cart':
        return (
          <CartScreen
            lines={cart}
            onBrowse={() => setActiveTab('order')}
            onChangeQuantity={changeQuantity}
            onCheckout={checkout}
            onRemove={removeFromCart}
          />
        );
      case 'delivery':
        return (
          <DeliveryScreen
            deliveries={deliveries}
            onChangeStatus={changeDeliveryStatus}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onOpenCoffeeCamera={() => setProfileCameraOpen(true)}
          />
        );
      case 'order':
      default:
        return (
          <OrderScreen
            cartCount={cartCount}
            onAdd={addToCart}
            onOpenCart={() => setActiveTab('cart')}
          />
        );
    }
  };

  return (
    <View style={styles.root}>
      <Animated.View
        key={profileCameraOpen ? 'coffee-camera' : activeTab}
        style={[
          styles.page,
          {
            opacity: pageProgress,
            transform: [
              {
                translateY: pageProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}>
        {renderScreen()}
      </Animated.View>
      {!profileCameraOpen ? (
        <BottomTabs
          activeTab={activeTab}
          cartCount={cartCount}
          onChange={setActiveTab}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  page: {flex: 1},
});

export default App;
