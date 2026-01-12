import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexVisitas } from './index-visitas';

describe('IndexVisitas', () => {
  let component: IndexVisitas;
  let fixture: ComponentFixture<IndexVisitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexVisitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexVisitas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
