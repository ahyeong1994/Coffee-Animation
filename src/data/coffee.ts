import {Coffee, Delivery} from '../types/app';

export const coffeeCategories = ['All', 'Espresso', 'Milk', 'Cold Brew'];

export const coffees: Coffee[] = [
  {
    id: 'velvet-latte',
    name: 'Velvet Latte',
    subtitle: 'Silky milk · double shot',
    origin: 'Colombia',
    category: 'Milk',
    price: 5.8,
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
    price: 4.2,
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
    price: 5.4,
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
    price: 5.9,
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
  },
];
