import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import {
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
} from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🚀 AuthService initialized');
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    console.log(
      '🔍 Loading current user, token:',
      token ? 'exists' : 'not found'
    );

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📝 Token payload:', payload);

        const user: User = {
          _id: payload._id || 'unknown',
          name: payload.name || 'User',
          email: payload.email || 'No email',
          role: payload.role || 'user',
        };

        console.log('✅ User loaded from token:', user);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('❌ Error decoding token:', error);
        this.logout();
      }
    } else {
      console.log('❌ No token found, user not logged in');
      this.currentUserSubject.next(null);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Login attempt for:', credentials.email);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('✅ Login successful:', response);
          localStorage.setItem('token', response.token);

          // Force reload user data after login
          setTimeout(() => {
            this.loadCurrentUser();
          }, 100);
        }),
        catchError(this.handleError)
      );
  }

  signup(userData: SignupRequest): Observable<any> {
    console.log('📝 Signup attempt for:', userData.email);

    return this.http.post(`${this.apiUrl}/signup`, userData).pipe(
      tap((response) => {
        console.log('✅ Signup successful:', response);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    console.log('✅ User logged out');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const isLoggedIn = !!token;
    console.log('🔍 Check if logged in:', isLoggedIn);
    return isLoggedIn;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Method to manually refresh user data
  refreshUser(): void {
    console.log('🔄 Manually refreshing user data');
    this.loadCurrentUser();
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ HTTP Error:', error);

    let errorMessage = 'An error occurred';

    if (error.status === 0) {
      errorMessage =
        'Cannot connect to server. Please check if backend is running.';
    } else if (error.status === 404) {
      errorMessage = 'API endpoint not found.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials.';
    } else {
      errorMessage =
        error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    return throwError(() => ({ error: { message: errorMessage } }));
  }
}
