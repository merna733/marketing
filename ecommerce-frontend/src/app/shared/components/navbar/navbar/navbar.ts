import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth';
import { ToastService } from '../../../services/toast';
import { User } from '../../../models/user';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isMenuCollapsed = true;
  private userSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      console.log('👤 Navbar - Current user:', user);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  // Navigation methods
  navigateToHome(): void {
    this.router.navigate(['/home']);
    this.collapseMenu();
  }

  navigateToPerfumes(): void {
    this.router.navigate(['/perfumes']);
    this.collapseMenu();
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
    this.collapseMenu();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.collapseMenu();
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
    this.collapseMenu();
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
    this.collapseMenu();
  }

  navigateToMyOrders(): void {
    this.router.navigate(['/my-orders']);
    this.collapseMenu();
  }

  navigateToAddPerfume(): void {
    this.router.navigate(['/add-perfume']);
    this.collapseMenu();
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
    this.collapseMenu();
  }

  // Authentication methods
  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      console.log('🚪 Logging out...');
      this.authService.logout();
      this.toastService.showSuccess('Successfully logged out');
      this.router.navigate(['/home']);
      this.collapseMenu();
    }
  }

  // Menu control methods
  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  collapseMenu(): void {
    this.isMenuCollapsed = true;
  }

  // Helper methods for template
  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get isUser(): boolean {
    return this.currentUser?.role === 'user';
  }

  get userName(): string {
    return this.currentUser?.name || 'User';
  }

  get userEmail(): string {
    return this.currentUser?.email || '';
  }

  get userInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
