import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    service = new AuthService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and retrieve a token', () => {
    service.setToken('test-token');
    expect(service.getToken()).toBe('test-token');
  });

  it('should return null when no token is set', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return true when authenticated', () => {
    service.setToken('test-token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should return false when not authenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should remove token on logout', () => {
    service.setToken('test-token');
    service.logout();
    expect(service.getToken()).toBeNull();
  });
});
