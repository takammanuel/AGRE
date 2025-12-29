import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeRequeteModal } from './type-requete-modal';

describe('TypeRequeteModal', () => {
  let component: TypeRequeteModal;
  let fixture: ComponentFixture<TypeRequeteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeRequeteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeRequeteModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
