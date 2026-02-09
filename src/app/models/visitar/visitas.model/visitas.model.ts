export class VisitarPacienteModel {
  idPaciente: number
  habitacion: number;
  cama: number;
  nombre: string;
  edad: number;
  observacion: string;
  visitas: VisitarAcompanianteModel[];

  constructor(idPaciente: number, habitacion: number, cama: number, nombre: string, edad: number, observacion: string, visitas: VisitarAcompanianteModel[] = []) {
    this.idPaciente = idPaciente;
    this.habitacion = habitacion;
    this.cama = cama;
    this.nombre = nombre;
    this.edad = edad;
    this.observacion = observacion;
    this.visitas = visitas;
  }
}


export class VisitarAcompanianteModel {
  idPaciente: number;
  nombre: string;
  dni: string;
  entrada: Date;

  observacion: string;

  constructor(idPaciente: number, nombre: string, dni: string, entrada: Date, observacion: string) {
    this.idPaciente = idPaciente;
    this.nombre = nombre;
    this.dni = dni;
    this.entrada = entrada;

    this.observacion = observacion;
  }
}