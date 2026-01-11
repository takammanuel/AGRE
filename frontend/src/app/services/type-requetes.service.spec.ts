import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TypeRequetesService } from './type-requetes.service';

describe('TypeRequetesService', () => {
  let service: TypeRequetesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TypeRequetesService]
    });
    service = TestBed.inject(TypeRequetesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all type requetes', () => {
    const mockTypeRequetes = [
      { id: 1, nom: 'Type 1', description: 'Description 1', service_id: 1 },
      { id: 2, nom: 'Type 2', description: 'Description 2', service_id: 2 }
    ];

    service.getAll().subscribe(typeRequetes => {
      expect(typeRequetes).toEqual(mockTypeRequetes);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/admin/type-requetes?page=1&per_page=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockTypeRequetes);
  });

  it('should get services', () => {
    const mockServices = [
      { id: 1, nom: 'Service 1', description: 'Description 1' },
      { id: 2, nom: 'Service 2', description: 'Description 2' }
    ];

    service.getServices().subscribe(services => {
      expect(services).toEqual(mockServices);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/admin/services');
    expect(req.request.method).toBe('GET');
    req.flush(mockServices);
  });

  it('should create type requete', () => {
    const newTypeRequete = { nom: 'New Type', description: 'New Description', service_id: 1 };
    const mockResponse = { id: 3, ...newTypeRequete };

    service.create(newTypeRequete).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/admin/type-requetes');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});