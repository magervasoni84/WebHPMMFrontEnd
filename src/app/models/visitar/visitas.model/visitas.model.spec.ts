import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitasModel } from './visitas.model';

describe('VisitasModel', () => {
  let component: VisitasModel;
  let fixture: ComponentFixture<VisitasModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitasModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitasModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
