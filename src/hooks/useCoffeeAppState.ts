import {useMemo, useState} from 'react';
import {initialDeliveries} from '../data/coffee';
import {
  AppTab,
  CartLine,
  CheckoutMethod,
  Coffee,
  CoffeeSize,
  Delivery,
} from '../types/app';

/** Owns the coffee app's cart, delivery, navigation, and checkout state. */
export const useCoffeeAppState = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('order');
  const [profileCameraOpen, setProfileCameraOpen] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState<CheckoutMethod>('slide');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);

  /** Adds a size-specific line or increments that exact coffee/size pair. */
  const addToCart = (coffee: Coffee, size: CoffeeSize = 'M', quantity = 1) => {
    const lineId = `${coffee.id}:${size}`;
    setCart(current => {
      const existing = current.find(line => line.id === lineId);
      if (existing) {
        return current.map(line =>
          line.id === lineId
            ? {
                ...line,
                quantity: Math.min(999, line.quantity + quantity),
              }
            : line,
        );
      }
      return [
        ...current,
        {
          id: lineId,
          coffee,
          size,
          unitPrice: coffee.prices[size],
          quantity: Math.max(1, Math.min(quantity, 999)),
        },
      ];
    });
  };

  /** Applies a user-entered cart quantity while enforcing valid limits. */
  const changeQuantity = (lineId: string, quantity: number) => {
    setCart(current =>
      current.map(line =>
        line.id === lineId
          ? {...line, quantity: Math.max(1, Math.min(quantity, 999))}
          : line,
      ),
    );
  };

  /** Removes one product line from the cart. */
  const removeFromCart = (lineId: string) => {
    setCart(current => current.filter(line => line.id !== lineId));
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
