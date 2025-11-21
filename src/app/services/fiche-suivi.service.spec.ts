import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FicheSuiviService } from './fiche-suivi.service';

describe('FicheSuiviService', () => {
  let service: FicheSuiviService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(FicheSuiviService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
