import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
})
export class CartComponent implements OnInit {
  cart: any = null;
  isPlacingOrder = false;
  isLoading = false;
  error: string | null = null;
  showConfirmationModal = false;
  showClearConfirmation = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    console.log('🚀 Cart component initialized');
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.error = null;

    const token = localStorage.getItem('token');

    if (!token) {
      this.error = 'Please login to view cart';
      this.isLoading = false;
      this.toastService.showWarning('Please login to view your cart');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http.get('http://localhost:3000/cart', { headers }).subscribe({
      next: (response: any) => {
        console.log('✅ Cart loaded successfully');
        this.cart = response.cart;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading cart:', error);
        this.isLoading = false;

        if (error.status === 404) {
          this.cart = { items: [], totalPrice: 0 };
        } else {
          this.error = 'Failed to load cart';
          this.toastService.showError('Failed to load cart');
        }
      },
    });
  }

  updateQuantity(item: any, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.perfume.stock) {
      this.toastService.showWarning('Invalid quantity selected');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http
      .delete(`http://localhost:3000/cart/${item.perfume._id}`, { headers })
      .subscribe({
        next: () => {
          const body = { perfume: item.perfume._id, quantity: newQuantity };
          this.http
            .post('http://localhost:3000/cart', body, { headers })
            .subscribe({
              next: () => {
                this.loadCart();
                this.toastService.showSuccess('Quantity updated successfully');
              },
              error: (error) => {
                this.toastService.showError('Failed to update quantity');
              },
            });
        },
        error: (error) => {
          this.toastService.showError('Failed to update quantity');
        },
      });
  }

  removeFromCart(perfumeId: string): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http
      .delete(`http://localhost:3000/cart/${perfumeId}`, { headers })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Perfume removed from cart');
          this.loadCart();
        },
        error: (error) => {
          this.toastService.showError('Failed to remove perfume');
        },
      });
  }

  // Show clear cart confirmation
  showClearCartConfirmation(): void {
    this.showClearConfirmation = true;
  }

  // Cancel clear cart
  cancelClearCart(): void {
    this.showClearConfirmation = false;
  }

  // Confirm clear cart
  confirmClearCart(): void {
    this.showClearConfirmation = false;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http
      .delete('http://localhost:3000/cart/clear', { headers })
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Cart cleared successfully');
          this.loadCart();
        },
        error: (error) => {
          this.toastService.showError('Failed to clear cart');
        },
      });
  }

  getTotalItems(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce(
      (total: number, item: any) => total + item.quantity,
      0
    );
  }

  // Show order confirmation modal
  showOrderConfirmation(): void {
    if (!this.cart || this.cart.items.length === 0) {
      this.toastService.showWarning('Your cart is empty');
      return;
    }

    this.showConfirmationModal = true;
  }

  // Cancel order
  cancelOrder(): void {
    this.showConfirmationModal = false;
    this.toastService.showInfo('Order cancelled');
  }

  // Confirm and place order
  confirmOrder(): void {
    console.log('🚀 Placing order...');

    if (this.isPlacingOrder) {
      return;
    }

    if (!this.cart || this.cart.items.length === 0) {
      this.toastService.showWarning('Your cart is empty');
      return;
    }

    // Close modal
    this.showConfirmationModal = false;
    this.isPlacingOrder = true;

    const token = localStorage.getItem('token');
    if (!token) {
      this.toastService.showError('Please login to place order');
      this.router.navigate(['/login']);
      this.isPlacingOrder = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // Show loading toast
    this.toastService.showInfo('Processing your order...');

    this.http.post('http://localhost:3000/orders', {}, { headers }).subscribe({
      next: (response: any) => {
        console.log('✅ Order placed successfully');
        this.isPlacingOrder = false;

        // Show success message
        this.toastService.showSuccess(
          '🎉 Order placed successfully! Redirecting to your orders...'
        );

        // Navigate after short delay to show success message
        setTimeout(() => {
          this.router.navigate(['/my-orders']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error placing order:', error);
        this.isPlacingOrder = false;

        let errorMessage = 'Failed to place order';

        if (error.status === 400) {
          errorMessage =
            error.error?.message || 'Cart is empty or has invalid items';
        } else if (error.status === 401) {
          errorMessage = 'Session expired. Please login again';
        } else if (error.status === 403) {
          errorMessage = 'Access denied';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.toastService.showError(`❌ ${errorMessage}`);
      },
    });
  }

  // Calculate subtotal for an item
  getItemSubtotal(item: any): number {
    return item.perfume.price * item.quantity;
  }

  // Check if cart is valid for checkout
  isCartValid(): boolean {
    return this.cart && this.cart.items && this.cart.items.length > 0;
  }

  // Format currency
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Get savings amount (if applicable)
  getSavings(): number {
    // This could calculate discounts, coupons, etc.
    return 0;
  }
}
