import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './authentification.service';
import { environment } from 'src/environments/environment';

/**
 * Tests unitaires pour AuthService
 * Utilise Jasmine et HttpClientTestingModule pour simuler les appels HTTP
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwidXNlcklkIjoidXNlcjEyMyIsImV4cCI6OTk5OTk5OTk5OX0.test';
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwidXNlcklkIjoidXNlcjEyMyIsImV4cCI6MTYwMDAwMDAwMH0.test';

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store token', () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = { token: mockToken };

      service.login(email, password).subscribe(response => {
        expect(response.token).toBe(mockToken);
        expect(localStorage.getItem('token')).toBe(mockToken);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      service.login(email, password).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request', () => {
      const email = 'test@example.com';
      const mockResponse = { message: 'Email envoyé avec succès' };

      service.forgotPassword(email).subscribe(response => {
        expect(response.message).toBe('Email envoyé avec succès');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', () => {
      const token = 'reset-token-123';
      const newPassword = 'newPassword123';
      const mockResponse = { message: 'Mot de passe réinitialisé' };

      service.resetPassword(token, newPassword).subscribe(response => {
        expect(response.message).toBe('Mot de passe réinitialisé');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token, newPassword });
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage', () => {
      localStorage.setItem('token', mockToken);
      expect(localStorage.getItem('token')).toBe(mockToken);

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when valid token exists', () => {
      localStorage.setItem('token', mockToken);

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false and remove expired token', () => {
      localStorage.setItem('token', expiredToken);

      expect(service.isLoggedIn()).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('getRole', () => {
    it('should return role from valid token', () => {
      localStorage.setItem('token', mockToken);

      const role = service.getRole();

      expect(role).toBe('ADMIN');
    });

    it('should return null when no token exists', () => {
      const role = service.getRole();

      expect(role).toBeNull();
    });

    it('should return null for invalid token', () => {
      localStorage.setItem('token', 'invalid-token');

      const role = service.getRole();

      expect(role).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return userId from valid token', () => {
      localStorage.setItem('token', mockToken);

      const userId = service.getUserId();

      expect(userId).toBe('user123');
    });

    it('should return null when no token exists', () => {
      const userId = service.getUserId();

      expect(userId).toBeNull();
    });
  });

  describe('Role checks', () => {
    it('isAdmin should return true for ADMIN role', () => {
      localStorage.setItem('token', mockToken);

      expect(service.isAdmin()).toBe(true);
      expect(service.isChefProjet()).toBe(false);
      expect(service.isPiloteQualite()).toBe(false);
    });

    it('should return false for all roles when no token', () => {
      expect(service.isAdmin()).toBe(false);
      expect(service.isChefProjet()).toBe(false);
      expect(service.isPiloteQualite()).toBe(false);
    });
  });
});
