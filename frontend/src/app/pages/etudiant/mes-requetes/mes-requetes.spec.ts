import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesRequetes } from './mes-requetes';

describe('MesRequetes', () => {
  let component: MesRequetes;
  let fixture: ComponentFixture<MesRequetes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesRequetes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesRequetes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
