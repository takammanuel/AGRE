import { TestBed } from '@angular/core/testing';

import { Requete } from './requete.service';

describe('Requete', () => {
  let service: Requete;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Requete);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
