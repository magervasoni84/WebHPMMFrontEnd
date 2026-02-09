import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitarPacienteModel } from './visitas.model';

describe('VisitasModel', () => {
  let component: VisitarPacienteModel;
  let fixture: ComponentFixture<VisitarPacienteModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitarPacienteModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitarPacienteModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
