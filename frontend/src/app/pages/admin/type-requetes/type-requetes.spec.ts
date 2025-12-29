import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeRequetes } from './type-requetes';

describe('TypeRequetes', () => {
  let component: TypeRequetes;
  let fixture: ComponentFixture<TypeRequetes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeRequetes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeRequetes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
