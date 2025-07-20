import { Perfume } from './perfume';

export interface CartItem {
  perfume: Perfume;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
}

export interface AddToCartRequest {
  perfume: string;
  quantity: number;
}
