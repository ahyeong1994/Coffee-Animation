export type AppTab = 'order' | 'cart' | 'delivery' | 'profile';

export type CheckoutMethod = 'slide' | 'hold';

export type CoffeeSize = 'S' | 'M' | 'L';

export type Coffee = {
  id: string;
  name: string;
  subtitle: string;
  origin: string;
  category: string;
  description: string;
  prices: Record<CoffeeSize, number>;
  rating: number;
  symbol: string;
  accent: string;
};

export type CartLine = {
  id: string;
  coffee: Coffee;
  size: CoffeeSize;
  unitPrice: number;
  quantity: number;
};

export type Delivery = {
  id: string;
  title: string;
  status: 'Brewing' | 'Arriving' | 'Delivered';
  eta: string;
  address: string;
};
