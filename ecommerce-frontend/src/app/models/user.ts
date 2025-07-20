export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  favorites?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
}
