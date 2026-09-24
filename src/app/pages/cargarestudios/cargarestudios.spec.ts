import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cargarestudios } from './cargarestudios';

describe('Cargarestudios', () => {
  let component: Cargarestudios;
  let fixture: ComponentFixture<Cargarestudios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cargarestudios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cargarestudios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
