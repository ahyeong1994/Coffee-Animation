import React, {useCallback, useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {usePageTransitionAnimation} from './animations/navigation/usePageTransitionAnimation';
import {BottomTabs} from './components/common/BottomTabs';
import {OrderSuccessOverlay} from './components/cart/OrderSuccessOverlay';
import {useCoffeeAppState} from './hooks/useCoffeeAppState';
import {CartScreen} from './screens/CartScreen';
import {CoffeeCameraScreen} from './screens/CoffeeCameraScreen';
import {DeliveryScreen} from './screens/DeliveryScreen';
import {OrderScreen} from './screens/OrderScreen';
import {ProfileScreen} from './screens/ProfileScreen';
import {colors} from './theme';

/** Composes the current page while business state remains inside one hook. */
const App = (): JSX.Element => {
  const state = useCoffeeAppState();
  const [orderSuccessVisible, setOrderSuccessVisible] = useState(false);
  const checkoutInProgressRef = useRef(false);
  const checkoutRef = useRef(state.checkout);
  checkoutRef.current = state.checkout;
  const pageTransition = usePageTransitionAnimation([
    state.activeTab,
    state.profileCameraOpen,
  ]);

  /** Starts one shared confirmation flow for both checkout interactions. */
  const handleCheckoutRequested = useCallback(() => {
    if (checkoutInProgressRef.current || state.cartCount === 0) {
      return;
    }

    checkoutInProgressRef.current = true;
    setOrderSuccessVisible(true);
  }, [state.cartCount]);

  /** Creates the delivery only after the success animation has completed. */
  const handleOrderSuccessComplete = useCallback(() => {
    checkoutRef.current();
    setOrderSuccessVisible(false);
    checkoutInProgressRef.current = false;
  }, []);

  const renderScreen = () => {
    if (state.profileCameraOpen) {
      return (
        <CoffeeCameraScreen onBack={() => state.setProfileCameraOpen(false)} />
      );
    }

    switch (state.activeTab) {
      case 'cart':
        return (
          <CartScreen
            checkoutMethod={state.checkoutMethod}
            lines={state.cart}
            onBrowse={() => state.setActiveTab('order')}
            onChangeQuantity={state.changeQuantity}
            onCheckout={handleCheckoutRequested}
            onRemove={state.removeFromCart}
          />
        );
      case 'delivery':
        return (
          <DeliveryScreen
            deliveries={state.deliveries}
            onChangeStatus={state.changeDeliveryStatus}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            checkoutMethod={state.checkoutMethod}
            onChangeCheckoutMethod={state.setCheckoutMethod}
            onOpenCoffeeCamera={() => state.setProfileCameraOpen(true)}
          />
        );
      case 'order':
      default:
        return (
          <OrderScreen
            cartCount={state.cartCount}
            onAdd={state.addToCart}
            onOpenCart={() => state.setActiveTab('cart')}
          />
        );
    }
  };

  return (
    <View style={styles.root}>
      <Animated.View
        key={state.profileCameraOpen ? 'coffee-camera' : state.activeTab}
        style={[
          styles.page,
          {
            opacity: pageTransition.opacity,
            transform: [{translateY: pageTransition.translateY}],
          },
        ]}>
        {renderScreen()}
      </Animated.View>
      {!state.profileCameraOpen && !orderSuccessVisible && (
        <BottomTabs
          activeTab={state.activeTab}
          cartCount={state.cartCount}
          onChange={state.setActiveTab}
        />
      )}
      {orderSuccessVisible ? (
        <OrderSuccessOverlay onComplete={handleOrderSuccessComplete} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  page: {flex: 1},
});

export default App;
