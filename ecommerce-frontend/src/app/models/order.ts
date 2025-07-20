import { Perfume } from './perfume';
import { User } from './user';

export interface OrderPerfume {
  perfume: Perfume;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | User;
  perfumes: OrderPerfume[];
  totalPrice: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'shipped' | 'delivered';
}
