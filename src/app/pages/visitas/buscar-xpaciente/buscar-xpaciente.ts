import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PacienteBuscadoModel } from '../../../models/visitar/paciente.model/paciente.model';

@Component({
  selector: 'app-buscar-xpaciente',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './buscar-xpaciente.html',
  styleUrls: ['./buscar-xpaciente.css', '../visitas-shared.css'],
})


export class BuscarXPaciente {
  nombrePaciente: string = '';
  dniPaciente: string = '';
  fichaPaciente: string = '';
  diasEgreso: number = 3;
  pacientes: any[] = [];
  cargandoPacientes: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  buscarPaciente() {
    console.log('Buscando:', this.nombrePaciente, this.dniPaciente, this.fichaPaciente, this.diasEgreso);

    this.cargandoPacientes = true;

    const params = new HttpParams()
      .set('nombre', this.nombrePaciente || '')
      .set('dni', this.dniPaciente || '')
      .set('ficha', this.fichaPaciente || '')
      .set('diasEgreso', this.diasEgreso?.toString() || '');

    this.http
      .get<PacienteBuscadoModel[]>(`${environment.apiBaseUrl}/visitar/buscar-xpaciente`, { params })
      .subscribe({
        next: (data) => {
          this.pacientes = data.map(item => ({
            idpaciente: item.idpaciente,
            nombre: item.nombre,
            dni: item.dni,
            fechaIngreso: item.fechaIngreso,
            fechaEgreso: item.fechaEgreso
          }));

          console.log('Datos de pacientes recibidos: ', this.pacientes);

          this.cargandoPacientes = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar pacientes:', error);
          this.cargandoPacientes = false;
        }
      });



  }

}
