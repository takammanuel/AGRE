import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeRequeteDetailModal } from './type-requete-detail-modal';

describe('TypeRequeteDetailModal', () => {
  let component: TypeRequeteDetailModal;
  let fixture: ComponentFixture<TypeRequeteDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeRequeteDetailModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeRequeteDetailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
