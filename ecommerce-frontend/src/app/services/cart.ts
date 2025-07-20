import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart, AddToCartRequest } from '../models/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:3000/cart';

  constructor(private http: HttpClient) {}

  getCart(): Observable<{ message: string; cart: Cart }> {
    return this.http.get<{ message: string; cart: Cart }>(this.apiUrl);
  }

  addToCart(
    request: AddToCartRequest
  ): Observable<{ message: string; cart: Cart }> {
    return this.http.post<{ message: string; cart: Cart }>(
      this.apiUrl,
      request
    );
  }

  removeFromCart(
    perfumeId: string
  ): Observable<{ message: string; cart: Cart }> {
    return this.http.delete<{ message: string; cart: Cart }>(
      `${this.apiUrl}/${perfumeId}`
    );
  }

  clearCart(): Observable<{ message: string; cart: Cart }> {
    return this.http.delete<{ message: string; cart: Cart }>(
      `${this.apiUrl}/clear`
    );
  }
}
