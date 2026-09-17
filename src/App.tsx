import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, BackHandler, StyleSheet, View} from 'react-native';
import {usePageTransitionAnimation} from './animations/navigation/usePageTransitionAnimation';
import {BottomTabs} from './components/common/BottomTabs';
import {OrderSuccessOverlay} from './components/cart/OrderSuccessOverlay';
import {useCoffeeAppState} from './hooks/useCoffeeAppState';
import {CartScreen} from './screens/CartScreen';
import {CoffeeCameraScreen} from './screens/CoffeeCameraScreen';
import {CoffeeDetailScreen} from './screens/CoffeeDetailScreen';
import {DeliveryScreen} from './screens/DeliveryScreen';
import {OrderScreen} from './screens/OrderScreen';
import {ProfileScreen} from './screens/ProfileScreen';
import {colors} from './theme';
import {Coffee} from './types/app';

/** Composes the current page while business state remains inside one hook. */
const App = (): JSX.Element => {
  const state = useCoffeeAppState();
  const {activeTab, profileCameraOpen, setActiveTab, setProfileCameraOpen} =
    state;
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
  const [orderSuccessVisible, setOrderSuccessVisible] = useState(false);
  const checkoutInProgressRef = useRef(false);
  const checkoutRef = useRef(state.checkout);
  checkoutRef.current = state.checkout;
  const pageTransition = usePageTransitionAnimation([
    state.activeTab,
    state.profileCameraOpen,
    selectedCoffee?.id,
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

  useEffect(() => {
    /**
     * Android hardware back navigation is handled at the app shell so every
     * custom screen follows one predictable hierarchy. Returning true consumes
     * the event; the Order root therefore stays open instead of exiting.
     */
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (orderSuccessVisible) {
          return true;
        }

        if (profileCameraOpen) {
          setProfileCameraOpen(false);
          return true;
        }

        if (selectedCoffee) {
          setSelectedCoffee(null);
          return true;
        }

        if (activeTab !== 'order') {
          setActiveTab('order');
          return true;
        }

        // Consume Back on the root page so Android does not close the app.
        return true;
      },
    );

    return () => subscription.remove();
  }, [
    orderSuccessVisible,
    selectedCoffee,
    activeTab,
    profileCameraOpen,
    setActiveTab,
    setProfileCameraOpen,
  ]);

  const renderScreen = () => {
    if (state.profileCameraOpen) {
      return (
        <CoffeeCameraScreen onBack={() => state.setProfileCameraOpen(false)} />
      );
    }

    if (selectedCoffee) {
      return (
        <CoffeeDetailScreen
          coffee={selectedCoffee}
          onAdd={state.addToCart}
          onBack={() => setSelectedCoffee(null)}
        />
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
            onOpenDetail={setSelectedCoffee}
            onOpenCart={() => state.setActiveTab('cart')}
          />
        );
    }
  };

  return (
    <View style={styles.root}>
      <Animated.View
        key={
          state.profileCameraOpen
            ? 'coffee-camera'
            : selectedCoffee
            ? `coffee-detail-${selectedCoffee.id}`
            : state.activeTab
        }
        style={[
          styles.page,
          {
            opacity: pageTransition.opacity,
            transform: [{translateY: pageTransition.translateY}],
          },
        ]}>
        {renderScreen()}
      </Animated.View>
      {!state.profileCameraOpen && !selectedCoffee && !orderSuccessVisible && (
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
