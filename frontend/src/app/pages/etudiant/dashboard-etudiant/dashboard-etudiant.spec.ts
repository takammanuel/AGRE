import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEtudiant } from './dashboard-etudiant';

describe('DashboardEtudiant', () => {
  let component: DashboardEtudiant;
  let fixture: ComponentFixture<DashboardEtudiant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEtudiant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEtudiant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
