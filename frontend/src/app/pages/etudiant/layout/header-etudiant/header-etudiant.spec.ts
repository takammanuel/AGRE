import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderEtudiant } from './header-etudiant';

describe('HeaderEtudiant', () => {
  let component: HeaderEtudiant;
  let fixture: ComponentFixture<HeaderEtudiant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderEtudiant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderEtudiant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
