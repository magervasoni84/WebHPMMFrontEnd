import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteModel } from '../../../models/visitar/paciente.model/paciente.model';

@Component({
  selector: 'app-listado-visitas',
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-visitas.html',
  styleUrl: './listado-visitas.css',
})
export class ListadoVisitas {

  // Datos de ejemplo (luego vendrán de un servicio)
  pacientes: PacienteModel[] = [
    { id: 1, hab: 0, CAM: 0, habitacion: 101, nombre: 'Juan Pérez', edad: 45, motivo:'', novedad: 'Estable' },
    { id: 2, hab: 5484, CAM: 0, habitacion: 203, nombre: 'María López', edad: 32, motivo:'', novedad: 'En observación' },
    { id: 3, hab: 5484, CAM: 0, habitacion: 105, nombre: 'Carlos Gómez', edad: 67, motivo:'', novedad: 'Alta médica' }
  ];

  // Paciente seleccionado para editar
  pacienteSeleccionado: PacienteModel | null = null;
  
  // Nuevo paciente para crear
  nuevoPaciente: PacienteModel = {
    id: 0,
    hab: 0,
    CAM: 0,
    habitacion: 0,
    nombre: '',
    edad: 0,
    motivo:'',
    novedad: ''
  };

  constructor() { }

  ngOnInit(): void {
    // Aquí cargarías datos de un servicio
  }

  // Crear nuevo paciente
  crearPaciente(): void {
    if (this.nuevoPaciente.nombre && this.nuevoPaciente.habitacion > 0) {
      // Generar nuevo ID (en producción esto lo haría el backend)
      const nuevoId = this.pacientes.length > 0 
        ? Math.max(...this.pacientes.map(p => p.id)) + 1 
        : 1;
      
      this.nuevoPaciente.id = nuevoId;
      this.pacientes.push({...this.nuevoPaciente});
      
      // Resetear formulario
      this.nuevoPaciente = { id: 0, hab: 0, CAM: 0, habitacion: 0, nombre: '', edad: 0, motivo:'', novedad: ''};
    }
  }

  // Seleccionar paciente para editar
  seleccionarPaciente(paciente: PacienteModel): void {
    this.pacienteSeleccionado = { ...paciente };
  }

  // Actualizar paciente
  actualizarPaciente(): void {
    if (this.pacienteSeleccionado) {
      const index = this.pacientes.findIndex(p => p.id === this.pacienteSeleccionado!.id);
      if (index !== -1) {
        this.pacientes[index] = { ...this.pacienteSeleccionado };
        this.pacienteSeleccionado = null;
      }
    }
  }

  // Eliminar paciente
  eliminarPaciente(id: number): void {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      this.pacientes = this.pacientes.filter(p => p.id !== id);
    }
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.pacienteSeleccionado = null;
  }

}
