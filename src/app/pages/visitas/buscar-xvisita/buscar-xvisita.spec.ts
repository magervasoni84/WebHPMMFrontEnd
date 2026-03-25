import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarXVisita } from './buscar-xvisita';

describe('BuscarXVisita', () => {
  let component: BuscarXVisita;
  let fixture: ComponentFixture<BuscarXVisita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarXVisita]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarXVisita);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
