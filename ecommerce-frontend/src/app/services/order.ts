import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, UpdateOrderStatusRequest } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  createOrder(): Observable<{ message: string; order: Order }> {
    return this.http.post<{ message: string; order: Order }>(this.apiUrl, {});
  }

  getUserOrders(): Observable<{ message: string; orders: Order[] }> {
    return this.http.get<{ message: string; orders: Order[] }>(
      `${this.apiUrl}/my-orders`
    );
  }

  getAllOrders(): Observable<{ message: string; orders: Order[] }> {
    return this.http.get<{ message: string; orders: Order[] }>(this.apiUrl);
  }

  updateOrderStatus(
    id: string,
    status: UpdateOrderStatusRequest
  ): Observable<{ message: string; order: Order }> {
    return this.http.put<{ message: string; order: Order }>(
      `${this.apiUrl}/${id}/status`,
      status
    );
  }
}
