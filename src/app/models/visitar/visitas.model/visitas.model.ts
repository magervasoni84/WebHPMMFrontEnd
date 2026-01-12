export class VisitasModel {

  id: number;
  habitacion: number;
  nombre: string;
  edad: number;
  novedad: string;

  constructor(id: number, habitacion: number, nombre: string, edad: number, novedad: string) {
    this.id = id;
    this.habitacion = habitacion;
    this.nombre = nombre;
    this.edad = edad;
    this.novedad = novedad;
  }
}