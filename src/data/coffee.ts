import {Coffee, Delivery} from '../types/app';

export const coffeeCategories = ['All', 'Espresso', 'Milk', 'Cold Brew'];

export const coffees: Coffee[] = [
  {
    id: 'velvet-latte',
    name: 'Velvet Latte',
    subtitle: 'Silky milk · double shot',
    origin: 'Colombia',
    category: 'Milk',
    description:
      'A velvety double espresso finished with silky steamed milk and a soft layer of microfoam.',
    prices: {S: 5.2, M: 5.8, L: 6.6},
    rating: 4.9,
    symbol: '☕',
    accent: '#7D563F',
  },
  {
    id: 'midnight-espresso',
    name: 'Midnight Espresso',
    subtitle: 'Cacao · toasted almond',
    origin: 'Ethiopia',
    category: 'Espresso',
    description:
      'A concentrated espresso with deep cacao, toasted almond and a lingering bittersweet finish.',
    prices: {S: 3.7, M: 4.2, L: 4.9},
    rating: 4.8,
    symbol: '◒',
    accent: '#4A342B',
  },
  {
    id: 'cloud-cappuccino',
    name: 'Cloud Cappuccino',
    subtitle: 'Airy foam · cinnamon',
    origin: 'Brazil',
    category: 'Milk',
    description:
      'Balanced espresso and warm milk under a cloud of airy foam, finished with aromatic cinnamon.',
    prices: {S: 4.8, M: 5.4, L: 6.2},
    rating: 4.7,
    symbol: '♨',
    accent: '#8B6C50',
  },
  {
    id: 'noir-cold-brew',
    name: 'Noir Cold Brew',
    subtitle: '18-hour brew · dark cherry',
    origin: 'Guatemala',
    category: 'Cold Brew',
    description:
      'Slow-steeped for 18 hours to create a smooth cold brew with dark cherry and cocoa notes.',
    prices: {S: 5.3, M: 5.9, L: 6.8},
    rating: 4.9,
    symbol: '✦',
    accent: '#38454A',
  },
];

export const initialDeliveries: Delivery[] = [
  {
    id: 'CF-2408',
    title: '2 coffees',
    status: 'Delivered',
    eta: '24 Aug · 10:42 AM',
    address: 'Home · Kuala Lumpur',
    items: [
      {
        id: 'velvet-latte:M',
        name: 'Velvet Latte',
        size: 'M',
        unitPrice: 5.8,
        quantity: 2,
        symbol: '☕',
        accent: '#7D563F',
      },
    ],
    subtotal: 11.6,
    deliveryFee: 1.5,
  },
];
