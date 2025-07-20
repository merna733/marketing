import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../../services/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.html',
})
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;
  cancellingOrderId: string | null = null;
  showCancelModal = false;
  orderToCancel: any = null;
  // router: any;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;

    const token = localStorage.getItem('token');
    if (!token) {
      this.toastService.showError('Please login to view orders');
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http
      .get('http://localhost:3000/orders/my-orders', { headers })
      .subscribe({
        next: (response: any) => {
          console.log('✅ Orders loaded successfully');
          this.orders = response.orders || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading orders:', error);
          this.isLoading = false;
          this.toastService.showError('Failed to load orders');
        },
      });
  }

  // Show cancel confirmation modal
  showCancelConfirmation(order: any): void {
    this.orderToCancel = order;
    this.showCancelModal = true;
  }

  // Close cancel modal
  closeCancelModal(): void {
    this.showCancelModal = false;
    this.orderToCancel = null;
  }

  // Cancel order
  cancelOrder(): void {
    if (!this.orderToCancel) {
      return;
    }

    const orderId = this.orderToCancel._id;
    this.cancellingOrderId = orderId;
    this.showCancelModal = false;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // ✅ Use the new cancel endpoint
    this.http
      .put(`http://localhost:3000/orders/${orderId}/cancel`, {}, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('✅ Order cancelled successfully');
          this.cancellingOrderId = null;
          this.orderToCancel = null;
          this.toastService.showSuccess('Order cancelled successfully');
          this.loadOrders(); // Refresh orders list
        },
        error: (error) => {
          console.error('❌ Error cancelling order:', error);
          this.cancellingOrderId = null;
          this.orderToCancel = null;

          let errorMessage = 'Failed to cancel order';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.toastService.showError(errorMessage);
        },
      });
  }

  // Check if order can be cancelled
  canCancelOrder(order: any): boolean {
    return order.status === 'pending';
  }

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    const classes = {
      pending: 'bg-warning text-dark',
      shipped: 'bg-info text-white',
      delivered: 'bg-success text-white',
      cancelled: 'bg-danger text-white',
    };
    return `badge ${classes[status as keyof typeof classes] || 'bg-secondary'}`;
  }

  // Format date
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  // Calculate total items in order
  getTotalItems(order: any): number {
    return (
      order.perfumes?.reduce(
        (total: number, item: any) => total + (item.quantity || 0),
        0
      ) || 0
    );
  }

  // Format price
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Get order status icon
  getStatusIcon(status: string): string {
    const icons = {
      pending: 'bi-clock',
      shipped: 'bi-truck',
      delivered: 'bi-check-circle',
      cancelled: 'bi-x-circle',
    };
    return icons[status as keyof typeof icons] || 'bi-question-circle';
  }

  // Get order progress percentage
  getOrderProgress(status: string): number {
    const progress = {
      pending: 25,
      shipped: 75,
      delivered: 100,
      cancelled: 0,
    };
    return progress[status as keyof typeof progress] || 0;
  }

  goToPerfumes() {
    this.router.navigate(['/perfumes']);
  }
}
