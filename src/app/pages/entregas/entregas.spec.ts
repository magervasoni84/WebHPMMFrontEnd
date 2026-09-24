import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Entregas } from './entregas';

describe('Entregas', () => {
  let component: Entregas;
  let fixture: ComponentFixture<Entregas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Entregas]
    }).compileComponents();

    fixture = TestBed.createComponent(Entregas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe descargar el PDF usando una petición blob y un enlace temporal', () => {
    const httpClient = TestBed.inject(HttpClient);
    const getSpy = spyOn(httpClient, 'get').and.returnValue(
      of(
        new HttpResponse({
          body: new Blob(['pdf'], { type: 'application/pdf' }),
          headers: new HttpHeaders({ 'content-type': 'application/pdf' })
        })
      )
    );

    const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:pdf');
    const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');

    const anchor = document.createElement('a');
    const clickSpy = spyOn(anchor, 'click');
    const createElementSpy = spyOn(document, 'createElement').and.callFake((tagName: string) => {
      if (tagName === 'a') {
        return anchor as unknown as HTMLElement;
      }
      return document.createElement(tagName);
    });

    component.resultado = {
      pdf: {
        downloadPath: '/api/entregas/pdf',
        fileName: 'entrega.pdf'
      }
    } as never;

    component.descargarPdf();

    expect(getSpy).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });
});
