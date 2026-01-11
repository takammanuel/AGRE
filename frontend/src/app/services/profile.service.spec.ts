import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get profile', () => {
    const mockProfile = {
      id: 1,
      nom: 'Doe',
      prenom: 'John',
      email: 'john@test.com',
      role: 'USER'
    };

    service.getProfile().subscribe(profile => {
      expect(profile).toEqual(mockProfile);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/profile');
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('should update profile', () => {
    const updateData = { nom: 'Smith' };
    const mockResponse = { id: 1, nom: 'Smith', email: 'john@test.com' };

    service.updateProfile(updateData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/profile');
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });
});