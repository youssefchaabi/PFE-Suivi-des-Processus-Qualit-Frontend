import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UtilisateurService, Utilisateur } from './utilisateur.service';
import { environment } from '../../environments/environment';

/**
 * Tests unitaires pour UtilisateurService
 * Teste les opérations CRUD sur les utilisateurs
 */
describe('UtilisateurService', () => {
  let service: UtilisateurService;
  let httpMock: HttpTestingController;

  const mockUtilisateur: Utilisateur = {
    id: 'user123',
    nom: 'Test User',
    email: 'test@example.com',
    role: 'ADMIN'
  };

  const mockUtilisateurs: Utilisateur[] = [
    mockUtilisateur,
    {
      id: 'user456',
      nom: 'Chef Projet',
      email: 'chef@example.com',
      role: 'CHEF_PROJET'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UtilisateurService]
    });

    service = TestBed.inject(UtilisateurService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUtilisateurs', () => {
    it('should retrieve all utilisateurs', () => {
      service.getUtilisateurs().subscribe(utilisateurs => {
        expect(utilisateurs).toEqual(mockUtilisateurs);
        expect(utilisateurs.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUtilisateurs);
    });

    it('should handle error when retrieving utilisateurs', () => {
      service.getUtilisateurs().subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getUtilisateurById', () => {
    it('should retrieve utilisateur by id', () => {
      service.getUtilisateurById('user123').subscribe(utilisateur => {
        expect(utilisateur).toEqual(mockUtilisateur);
        expect(utilisateur.id).toBe('user123');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/user123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUtilisateur);
    });

    it('should handle 404 error for non-existent user', () => {
      service.getUtilisateurById('nonexistent').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/nonexistent`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUtilisateur', () => {
    it('should create new utilisateur', () => {
      const newUser: Utilisateur = {
        id: '',
        nom: 'New User',
        email: 'new@example.com',
        role: 'PILOTE_QUALITE',
        password: 'password123'
      };

      service.createUtilisateur(newUser).subscribe(utilisateur => {
        expect(utilisateur.nom).toBe('New User');
        expect(utilisateur.email).toBe('new@example.com');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/create-user`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.email).toBe('new@example.com');
      expect(req.request.body.password).toBe('password123');
      req.flush({ ...newUser, id: 'user789' });
    });

    it('should handle error when email already exists', () => {
      const duplicateUser: Utilisateur = {
        id: '',
        nom: 'Duplicate',
        email: 'test@example.com',
        role: 'ADMIN',
        password: 'password123'
      };

      service.createUtilisateur(duplicateUser).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/create-user`);
      req.flush('Email already exists', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateUtilisateur', () => {
    it('should update existing utilisateur', () => {
      const updatedUser: Utilisateur = {
        ...mockUtilisateur,
        nom: 'Updated Name'
      };

      service.updateUtilisateur('user123', updatedUser).subscribe(utilisateur => {
        expect(utilisateur.nom).toBe('Updated Name');
        expect(utilisateur.id).toBe('user123');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/user123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.nom).toBe('Updated Name');
      req.flush(updatedUser);
    });

    it('should handle error when updating non-existent user', () => {
      service.updateUtilisateur('nonexistent', mockUtilisateur).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/nonexistent`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('supprimerUtilisateur', () => {
    it('should delete utilisateur', () => {
      service.supprimerUtilisateur('user123').subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/user123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting non-existent user', () => {
      service.supprimerUtilisateur('nonexistent').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/nonexistent`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteUtilisateur', () => {
    it('should call supprimerUtilisateur', () => {
      spyOn(service, 'supprimerUtilisateur').and.callThrough();

      service.deleteUtilisateur('user123').subscribe();

      expect(service.supprimerUtilisateur).toHaveBeenCalledWith('user123');
      
      const req = httpMock.expectOne(`${environment.apiUrl}/utilisateurs/user123`);
      req.flush(null);
    });
  });
});
