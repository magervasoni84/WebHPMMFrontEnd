import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarXPaciente } from './buscar-xpaciente';

describe('BuscarXPaciente', () => {
  let component: BuscarXPaciente;
  let fixture: ComponentFixture<BuscarXPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarXPaciente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarXPaciente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
