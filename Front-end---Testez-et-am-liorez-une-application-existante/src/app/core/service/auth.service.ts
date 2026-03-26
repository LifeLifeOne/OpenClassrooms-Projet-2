import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jwt_token';

  setToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
  }
}
