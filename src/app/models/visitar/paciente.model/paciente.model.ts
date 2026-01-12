export class PacienteModel {
  id: number;
hab: number;
  CAM: number;
  habitacion: number;
  nombre: string;
  edad: number;
  motivo: string;
  novedad: string;


  constructor(id: number, hab:number, CAM: number, habitacion: number, nombre: string, edad: number, motivo:string, novedad: string) {
    this.id = id;
    this.hab = hab;
    this.CAM = CAM;
    this.habitacion = habitacion;
    this.nombre = nombre;
    this.edad = edad;
    this.motivo = motivo;
    this.novedad = novedad;
  }
}