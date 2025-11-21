import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FicheQualiteService } from './fiche-qualite.service';

describe('FicheQualiteService', () => {
  let service: FicheQualiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(FicheQualiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
