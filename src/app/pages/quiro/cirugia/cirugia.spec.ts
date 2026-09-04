import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Cirugia } from './cirugia';

describe('Cirugia', () => {
  let component: Cirugia;
  let fixture: ComponentFixture<Cirugia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cirugia],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(Cirugia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe resetear los filtros de HCL y fechas', () => {
    component.hcl = '123';
    component.fechaDesde = '2026-08-01';
    component.fechaHasta = '2026-08-15';

    component.resetFiltros();

    expect(component.hcl).toBe('');
    expect(component.fechaDesde).toBe('');
    expect(component.fechaHasta).toBe('');
  });

  it('debe avisar cuando no hay resultados para descargar CSV', () => {
    component.resultados = [];

    component.descargarCsv();

    expect(component.error).toBe('No hay resultados para descargar en CSV.');
  });
});
