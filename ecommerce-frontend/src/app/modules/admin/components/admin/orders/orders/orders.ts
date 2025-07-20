import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../../../services/toast';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;
  error: string | null = null;
  router: any;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  ngOnInit(): void {
    console.log('📦 Orders component initialized');
    this.loadOrders();
  }

  loadOrders(): void {
    console.log('🔄 Starting to load orders...');
    this.isLoading = true;
    this.error = null;

    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('🔑 Token exists:', !!token);

    if (!token) {
      console.log('❌ No token found');
      this.error = 'No authentication token found. Please login.';
      this.isLoading = false;
      return;
    }

    // Set up headers manually
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('🌐 Making request to: http://localhost:3000/orders');
    console.log('🔑 With token:', token.substring(0, 20) + '...');

    // Make the API call with timeout
    const request = this.http.get('http://localhost:3000/orders', { headers });

    // Add timeout
    const timeout = setTimeout(() => {
      console.log('⏰ Request timed out after 10 seconds');
      this.error = 'Request timed out. Please check if backend is running.';
      this.isLoading = false;
      this.toastService.showError('Request timed out');
    }, 10000);

    request.subscribe({
      next: (response: any) => {
        clearTimeout(timeout);
        console.log('✅ Orders loaded successfully:', response);
        this.orders = response.orders || [];
        this.isLoading = false;
        this.toastService.showSuccess(`Loaded ${this.orders.length} orders`);
      },
      error: (error) => {
        clearTimeout(timeout);
        console.error('❌ Error loading orders:', error);
        this.error = this.getErrorMessage(error);
        this.isLoading = false;
        this.toastService.showError(this.error);
      },
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Cannot connect to server. Make sure backend is running on localhost:3000';
    } else if (error.status === 401) {
      return 'Unauthorized. Please login again.';
    } else if (error.status === 403) {
      return 'Access denied. Admin privileges required.';
    } else if (error.status === 404) {
      return 'Orders endpoint not found. Check backend routes.';
    } else if (error.status === 500) {
      return 'Server error. Check backend logs.';
    } else {
      return error.error?.message || error.message || 'Unknown error occurred';
    }
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    console.log(`🔄 Updating order ${orderId} to ${newStatus}`);

    const token = localStorage.getItem('token');
    if (!token) {
      this.toastService.showError('No authentication token');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const body = { status: newStatus };

    this.http
      .put(`http://localhost:3000/orders/${orderId}/status`, body, { headers })
      .subscribe({
        next: (response) => {
          console.log('✅ Order status updated');
          this.toastService.showSuccess('Order status updated');
          this.loadOrders(); // Refresh the list
        },
        error: (error) => {
          console.error('❌ Error updating order:', error);
          this.toastService.showError('Failed to update order status');
        },
      });
  }

  retryLoading(): void {
    this.router.navigate(['/perfumes']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'shipped':
        return 'badge bg-info';
      case 'delivered':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  }

  getUserName(user: any): string {
    if (typeof user === 'object' && user?.name) {
      return user.name;
    }
    return 'Unknown User';
  }

  getUserEmail(user: any): string {
    if (typeof user === 'object' && user?.email) {
      return user.email;
    }
    return 'Unknown Email';
  }
}
