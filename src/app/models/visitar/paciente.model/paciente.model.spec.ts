import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteModel } from './paciente.model';

describe('PacienteModel', () => {
  let component: PacienteModel;
  let fixture: ComponentFixture<PacienteModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
