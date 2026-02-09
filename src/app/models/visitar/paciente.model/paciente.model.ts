import { VisitarAcompanianteModel } from '../visitas.model/visitas.model';

export class PacienteModel {
  id: number;
  idpaciente: number;
  hab: number;
  cama: number;
  nombre: string;
  dni: number;
  ubicacion: string;
  observacion: string;
  acompaniantes: VisitarAcompanianteModel[];

  constructor( id: number = 0, idpaciente: number = 0, hab: number = 0, cama: number = 0, nombre: string = '', dni: number = 0, ubicacion: string = '', observacion: string = '', acompaniantes: VisitarAcompanianteModel[] = [] ) {
    this.id = id;
    this.idpaciente = idpaciente;
    this.hab = hab;
    this.cama = cama;
    this.nombre = nombre;
    this.dni = dni;
    this.ubicacion = ubicacion;
    this.observacion = observacion;
    this.acompaniantes = acompaniantes;
  }
} 