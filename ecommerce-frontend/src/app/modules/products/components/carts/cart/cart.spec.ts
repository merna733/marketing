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
    console.log('🔑 Token exists:', !!token);

    if (!token) {
      this.error = 'Please login to view cart';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('🔄 Loading cart from API...');

    this.http.get('http://localhost:3000/cart', { headers }).subscribe({
      next: (response: any) => {
        console.log('✅ Cart loaded successfully:', response);
        this.cart = response.cart;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading cart:', error);
        this.isLoading = false;

        if (error.status === 404) {
          // No cart found - create empty cart
          this.cart = { items: [], totalPrice: 0 };
          console.log('📝 Created empty cart');
        } else {
          this.error = 'Failed to load cart';
          this.toastService.showError('Failed to load cart');
        }
      },
    });
  }

  updateQuantity(item: any, newQuantity: number): void {
    console.log(`🔄 Updating ${item.perfume.name} quantity to ${newQuantity}`);

    if (newQuantity < 1 || newQuantity > item.perfume.stock) {
      console.log('❌ Invalid quantity');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // Remove item first, then add with new quantity
    this.http
      .delete(`http://localhost:3000/cart/${item.perfume._id}`, { headers })
      .subscribe({
        next: () => {
          const body = { perfume: item.perfume._id, quantity: newQuantity };
          this.http
            .post('http://localhost:3000/cart', body, { headers })
            .subscribe({
              next: () => {
                console.log('✅ Quantity updated');
                this.loadCart();
                this.toastService.showSuccess('Quantity updated');
              },
              error: (error) => {
                console.error('❌ Error adding item:', error);
                this.toastService.showError('Failed to update quantity');
              },
            });
        },
        error: (error) => {
          console.error('❌ Error removing item:', error);
          this.toastService.showError('Failed to update quantity');
        },
      });
  }

  removeFromCart(perfumeId: string): void {
    console.log('🗑️ Removing perfume from cart:', perfumeId);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http
      .delete(`http://localhost:3000/cart/${perfumeId}`, { headers })
      .subscribe({
        next: () => {
          console.log('✅ Perfume removed from cart');
          this.toastService.showSuccess('Perfume removed from cart');
          this.loadCart();
        },
        error: (error) => {
          console.error('❌ Error removing perfume:', error);
          this.toastService.showError('Failed to remove perfume');
        },
      });
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    console.log('🧹 Clearing cart');

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http
      .delete('http://localhost:3000/cart/clear', { headers })
      .subscribe({
        next: () => {
          console.log('✅ Cart cleared');
          this.toastService.showSuccess('Cart cleared');
          this.loadCart();
        },
        error: (error) => {
          console.error('❌ Error clearing cart:', error);
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

  showOrderConfirmation(): void {
    console.log('🔔 Show order confirmation clicked');

    if (!this.cart || this.cart.items.length === 0) {
      console.log('❌ Cart is empty');
      this.toastService.showWarning('Your cart is empty');
      return;
    }

    console.log('✅ Cart has items, showing confirmation');

    // Try to show Bootstrap modal
    const modalElement = document.getElementById('orderModal');
    if (modalElement) {
      console.log('📋 Opening Bootstrap modal');
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.log('📋 Modal not found, using direct confirmation');
      this.directOrderConfirmation();
    }
  }

  directOrderConfirmation(): void {
    const message = `Place order for $${this.cart.totalPrice.toFixed(
      2
    )}?\n\nItems: ${this.getTotalItems()}\n\nThis action cannot be undone.`;

    if (confirm(message)) {
      console.log('✅ User confirmed order via alert');
      this.confirmOrder();
    } else {
      console.log('❌ User cancelled order');
    }
  }

  confirmOrder(): void {
    console.log('🚀 Confirm order called');

    if (this.isPlacingOrder) {
      console.log('⚠️ Already placing order, ignoring');
      return;
    }

    if (!this.cart || this.cart.items.length === 0) {
      console.log('❌ Cannot place order - cart is empty');
      this.toastService.showWarning('Your cart is empty');
      return;
    }

    this.isPlacingOrder = true;
    console.log('🔄 Placing order...');

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      this.toastService.showError('Please login to place order');
      this.router.navigate(['/login']);
      this.isPlacingOrder = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('📡 Making API call to place order');

    this.http.post('http://localhost:3000/orders', {}, { headers }).subscribe({
      next: (response: any) => {
        console.log('✅ Order placed successfully:', response);
        this.isPlacingOrder = false;

        // Close modal if it exists
        const modalElement = document.getElementById('orderModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(
            modalElement
          );
          if (modal) {
            console.log('📋 Closing modal');
            modal.hide();
          }
        }

        // Show success message
        this.toastService.showSuccess('Order placed successfully!');

        // Navigate to orders page
        console.log('🔄 Navigating to my-orders');
        this.router.navigate(['/my-orders']);
      },
      error: (error) => {
        console.error('❌ Error placing order:', error);
        this.isPlacingOrder = false;

        let errorMessage = 'Failed to place order';

        if (error.status === 400) {
          errorMessage = error.error?.message || 'Cart is empty or invalid';
        } else if (error.status === 401) {
          errorMessage = 'Please login again';
        } else if (error.status === 403) {
          errorMessage = 'Access denied';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        console.log('📋 Error message:', errorMessage);
        this.toastService.showError(errorMessage);
      },
    });
  }

  // Simple test method
  testButton(): void {
    console.log('🧪 Test button clicked');
    alert('Button click works!');
  }
}
