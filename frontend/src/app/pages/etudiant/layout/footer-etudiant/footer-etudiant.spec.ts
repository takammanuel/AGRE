import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterEtudiant } from './footer-etudiant';

describe('FooterEtudiant', () => {
  let component: FooterEtudiant;
  let fixture: ComponentFixture<FooterEtudiant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterEtudiant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterEtudiant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
