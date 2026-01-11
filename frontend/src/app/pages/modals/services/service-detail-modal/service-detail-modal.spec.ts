import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDetailModal } from './service-detail-modal';

describe('ServiceDetailModal', () => {
  let component: ServiceDetailModal;
  let fixture: ComponentFixture<ServiceDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDetailModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceDetailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
