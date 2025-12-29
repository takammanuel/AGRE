import { TestBed } from '@angular/core/testing';

import { TypeRequetesService } from './type-requetes.service';

describe('TypeRequetesService', () => {
  let service: TypeRequetesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeRequetesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
