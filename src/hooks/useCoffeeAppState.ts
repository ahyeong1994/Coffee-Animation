import {useMemo, useState} from 'react';
import {initialDeliveries} from '../data/coffee';
import {AppTab, CartLine, CheckoutMethod, Coffee, Delivery} from '../types/app';

/** Owns the coffee app's cart, delivery, navigation, and checkout state. */
export const useCoffeeAppState = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('order');
  const [profileCameraOpen, setProfileCameraOpen] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState<CheckoutMethod>('slide');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);

  /** Adds a new coffee or increments its existing cart quantity. */
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

  /** Applies a user-entered cart quantity while enforcing valid limits. */
  const changeQuantity = (coffeeId: string, quantity: number) => {
    setCart(current =>
      current.map(line =>
        line.coffee.id === coffeeId
          ? {...line, quantity: Math.max(1, Math.min(quantity, 999))}
          : line,
      ),
    );
  };

  /** Removes one product line from the cart. */
  const removeFromCart = (coffeeId: string) => {
    setCart(current => current.filter(line => line.coffee.id !== coffeeId));
  };

  /** Converts the current cart into a delivery and opens Delivery tab. */
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

  /** Updates the temporary interactive status of one delivery. */
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

  const cartCount = useMemo(
    () => cart.reduce((total, line) => total + line.quantity, 0),
    [cart],
  );

  return {
    activeTab,
    profileCameraOpen,
    checkoutMethod,
    cart,
    deliveries,
    cartCount,
    setActiveTab,
    setProfileCameraOpen,
    setCheckoutMethod,
    addToCart,
    changeQuantity,
    removeFromCart,
    checkout,
    changeDeliveryStatus,
  };
};
