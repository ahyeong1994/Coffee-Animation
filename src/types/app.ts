export type AppTab = 'order' | 'cart' | 'delivery' | 'profile';

export type Coffee = {
  id: string;
  name: string;
  subtitle: string;
  origin: string;
  category: string;
  price: number;
  rating: number;
  symbol: string;
  accent: string;
};

export type CartLine = {
  coffee: Coffee;
  quantity: number;
};

export type Delivery = {
  id: string;
  title: string;
  status: 'Brewing' | 'Arriving' | 'Delivered';
  eta: string;
  address: string;
};
