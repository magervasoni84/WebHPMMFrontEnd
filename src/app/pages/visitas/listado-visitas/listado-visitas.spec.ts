import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoVisitas } from './listado-visitas';

describe('ListadoVisitas', () => {
  let component: ListadoVisitas;
  let fixture: ComponentFixture<ListadoVisitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoVisitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoVisitas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
