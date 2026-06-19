import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  let service: ServicesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicesService]
    });
    service = TestBed.inject(ServicesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all services', () => {
    const mockServices = [
      { id: 1, nom: 'Service 1', description: 'Description 1' },
      { id: 2, nom: 'Service 2', description: 'Description 2' }
    ];

    service.getAll().subscribe(services => {
      expect(services).toEqual(mockServices);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/admin/services?page=1&per_page=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockServices);
  });

  it('should create service', () => {
    const newService = { nom: 'New Service', description: 'New Description' };
    const mockResponse = { id: 3, ...newService };

    service.create(newService).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/admin/services');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update service', () => {
    const updateData = { nom: 'Updated Service', description: 'Updated Description' };
    const mockResponse = { id: 1, ...updateData };

    service.update(1, updateData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/admin/services/1');
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should delete service', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne('http://localhost:8000/api/admin/services/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});