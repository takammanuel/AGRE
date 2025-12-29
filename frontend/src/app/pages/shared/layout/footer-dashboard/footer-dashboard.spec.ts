import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterDashboard } from './footer-dashboard';

describe('FooterDashboard', () => {
  let component: FooterDashboard;
  let fixture: ComponentFixture<FooterDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
