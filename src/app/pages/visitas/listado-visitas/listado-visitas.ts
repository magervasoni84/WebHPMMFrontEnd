import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PacienteModel } from '../../../models/visitar/paciente.model/paciente.model';
import { VisitarAcompanianteModel } from '../../../models/visitar/visitas.model/visitas.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-listado-visitas',
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-visitas.html',
  styleUrls: ['./listado-visitas.css', '../visitas-shared.css'],
})



export class ListadoVisitas {


  limiteAcompaniantes: number = 2;

  // Datos de ejemplo (luego vendrán de un servicio)
  pacientes: PacienteModel[] = [];

  // Paciente seleccionado para agregar visitante (solo el ID, no el objeto)
  pacienteSeleccionadoId: number | null = null;

  // Nuevo visitante para crear
  nuevoVisitante: VisitarAcompanianteModel = {
    idPaciente: 0,
    nombre: '',
    dni: '',
    entrada: new Date(),
    observacion: ''
  };

  // Nuevo paciente para crear
  nuevoPaciente: PacienteModel = {
    id: 0,
    idpaciente: 0,
    hab: 0,
    cama: 0,
    nombre: '',
    dni: 0,
    ubicacion: '',
    observacion: '',
    acompaniantes: []
  };

  // Variables para controlar la edición
  pacienteEnEdicion: number | null = null;  // ID del paciente que se está editando
  observacionEditada: string = '';          // Valor temporal de la observación
  observacionOriginal: string = '';         // Valor original para cancelar
  cargando: boolean = false;                // Estado de carga para el formulario de visitantes
  private cargandoPacientes: boolean = false; // Evita peticiones duplicadas al cargar la lista


  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Cargar datos del servicio
    this.cargarPacientes();
  }

  // Cargar pacientes desde el backend
  cargarPacientes(): void {
    if (this.cargandoPacientes) {
      console.log('Carga de pacientes ya en curso, omitiendo nueva petición');
      return;
    }
    this.cargandoPacientes = true;


    this.http.get<any[]>(`${environment.apiBaseUrl}/visitar`).subscribe({
      next: (data) => {
        this.pacientes = data.map(item => ({
          id: item.id,
          idpaciente: item.idpaciente,
          hab: item.hab,
          cama: item.cama,
          nombre: item.nombre,
          dni: item.dni,
          ubicacion: item.ubicacion,
          observacion: item.observacion,
          acompaniantes: (item.acompaniantes || item.visitas || []).map((acomp: any) => ({
            id: acomp.id || acomp.idacompaniante,
            idPaciente: acomp.idPaciente || acomp.idpaciente,
            nombre: acomp.nombre,
            dni: acomp.dni,
            entrada: acomp.entrada ? new Date(acomp.entrada) : new Date(),
            observacion: acomp.observacion || ''
          }))
        }));
        console.log('Datos de pacientes cargados: ', this.pacientes)

        // Forzar refresco de la vista para asegurarnos que la UI se actualiza
        this.pacientes = [...this.pacientes];
        this.cdr.detectChanges();

        // Permitir nuevas cargas
        this.cargandoPacientes = false;
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.cargandoPacientes = false;
      }
    });
  }





  // Iniciar edicion de observacion

  iniciarEdicion(paciente: PacienteModel): void {
    // Guardar el estado original
    this.pacienteEnEdicion = paciente.id;
    this.observacionOriginal = paciente.observacion;
    this.observacionEditada = paciente.observacion;
  }

  // Cancelar edición
  cancelarEdicion(): void {
    // Restaurar valor original si existe
    if (this.pacienteEnEdicion !== null) {
      const paciente = this.pacientes.find(p => p.id === this.pacienteEnEdicion);
      if (paciente) {
        paciente.observacion = this.observacionOriginal;
      }
    }

    // Limpiar variables de edición
    this.pacienteEnEdicion = null;
    this.observacionEditada = '';
    this.observacionOriginal = '';

    console.log('Edición cancelada');
  }

  // Guardar observación en el backend
  guardarObservacion(paciente: PacienteModel): void {
    if (!this.observacionEditada.trim()) {
      alert('La observación no puede estar vacía');
      return;
    }

    console.log('Guardando observación para paciente:', paciente.id, 'idpaciente:', paciente.idpaciente);

    // Primero actualizar localmente para mejor experiencia de usuario
    const pacienteIndex = this.pacientes.findIndex(p => p.id === paciente.id);
    if (pacienteIndex !== -1) {
      this.pacientes[pacienteIndex].observacion = this.observacionEditada;
    }

    // Enviar al backend
    this.http.put(`${environment.apiBaseUrl}/visitar/paciente/${paciente.idpaciente}`, {
      idpaciente: paciente.idpaciente,
      observacion: this.observacionEditada
    }).subscribe({
      next: (response: any) => {
        // Actualizar con datos del servidor (opcional, pero buena práctica)
        if (pacienteIndex !== -1 && response.observacion) {
          this.pacientes[pacienteIndex].observacion = response.observacion;
        }

        // Salir del modo edición PRIMERO
        this.pacienteEnEdicion = null;
        this.observacionEditada = '';
        this.observacionOriginal = '';

        // Luego forzar refresco de la vista
        this.pacientes = [...this.pacientes];
        setTimeout(() => {
          this.cdr.detectChanges();
          alert('Observación guardada correctamente');
        }, 0);
      },
      error: (error) => {
        console.error('Error al guardar observación:', error);

        // Revertir cambio local si falla en el servidor
        if (pacienteIndex !== -1) {
          this.pacientes[pacienteIndex].observacion = this.observacionOriginal;
        }

        // Forzar detección de cambios para reflejar el cambio revertido
        this.pacientes = [...this.pacientes];
        this.cdr.detectChanges();

        alert('Error al guardar la observación. Por favor, intente nuevamente.');
      }
    });
  }













  // Borrar esta funcion, NO se agregan manualmente los pacientes, vienen del backEnd
  // Crear nuevo paciente
  crearPaciente(): void {
    if (this.nuevoPaciente.nombre) {
      // Generar nuevo ID (en producción esto lo haría el backend)
      const nuevoId = this.pacientes.length > 0
        ? Math.max(...this.pacientes.map(p => p.id)) + 1
        : 1;

      this.nuevoPaciente.id = nuevoId;
      this.pacientes.push({ ...this.nuevoPaciente });

      // Resetear formulario
      this.nuevoPaciente = { id: 0, idpaciente: 0, hab: 0, cama: 0, nombre: '', dni: 0, ubicacion: '', observacion: '', acompaniantes: [] };
    }
  }









  // Seleccionar paciente para agregar visitante (toggle)
  agregarVisitante(paciente: PacienteModel): void {
    // Si ya está seleccionado, lo deseleccionamos (cerrar formulario)
    if (this.pacienteSeleccionadoId === paciente.id) {
      this.pacienteSeleccionadoId = null;
    } else {
      // Si no, guardamos solo el ID y creamos el objeto para el formulario
      this.pacienteSeleccionadoId = paciente.id;
      const fechaHoraActual = this.obtenerFechaActual();
      // Resetear formulario de visitante
      this.nuevoVisitante = {
        idPaciente: paciente.idpaciente,  // Usar idpaciente del paciente
        nombre: '',
        dni: '',
        entrada: fechaHoraActual,
        observacion: ''
      };
    }
  }


  // Guardar nuevo visitante
  guardarVisitante(): void {
    // Verificar que hay un paciente seleccionado
    if (!this.pacienteSeleccionadoId) {
      alert('No hay paciente seleccionado. Haga clic en "Agregar Visita" primero.');
      return;
    }

    // Buscar el paciente en el array local usando el ID
    const paciente = this.pacientes.find(p => p.id === this.pacienteSeleccionadoId);
    if (!paciente) {
      alert('Paciente no encontrado');
      return;
    }

    // Validaciones básicas
    if (!this.nuevoVisitante.nombre?.trim()) {
      alert('El nombre del visitante es requerido');
      return;
    }

    if (!this.nuevoVisitante.dni) {
      alert('El DNI del visitante es requerido');
      return;
    }

    // Preparar datos para enviar al backend
    const datosVisitante = {
      idPaciente: paciente.idpaciente,  // Usar idpaciente del paciente encontrado
      nombre: this.nuevoVisitante.nombre.trim(),
      dni: this.nuevoVisitante.dni,
      entrada: this.nuevoVisitante.entrada,
      observacion: this.nuevoVisitante.observacion?.trim() || ''
    };


    // Habilitar estado de carga
    this.cargando = true;

    // Enviar al backend
    this.http.post(`${environment.apiBaseUrl}/visitar/acompaniante/`, datosVisitante).subscribe({
      next: (response: any) => {
        // Buscar el índice del paciente en el array local
        const pacienteIndex = this.pacientes.findIndex(p => p.id === this.pacienteSeleccionadoId);

        if (pacienteIndex !== -1) {
          // Crear el objeto visitante con los datos del backend
          const nuevoVisitanteGuardado: any = {
            id: response.id || response.idacompaniante || 0,
            idPaciente: paciente.idpaciente,
            nombre: response.nombre || this.nuevoVisitante.nombre,
            dni: response.dni || this.nuevoVisitante.dni,
            entrada: response.entrada ? new Date(response.entrada) : this.nuevoVisitante.entrada,
            observacion: response.observacion || this.nuevoVisitante.observacion || ''
          };
          // Asegurarse de que el array de acompañantes existe
          if (!this.pacientes[pacienteIndex].acompaniantes) {
            this.pacientes[pacienteIndex].acompaniantes = [];
          }

          // Agregar el nuevo visitante al array
          this.pacientes[pacienteIndex].acompaniantes.push(nuevoVisitanteGuardado);

          // Forzar la detección de cambios de Angular
          this.pacientes = [...this.pacientes];
        }


        //Esta parte deberia borrarse? ya se que usaria el metodo detect changes
        // IMPORTANTE: Usar setTimeout para asegurar que Angular procesa el cierre del alert
        // y luego ejecuta el reset de forma atómica
        setTimeout(() => {
          this.pacienteSeleccionadoId = null;
          this.nuevoVisitante = {
            idPaciente: 0,
            nombre: '',
            dni: '',
            entrada: new Date(),
            observacion: ''
          };
          this.cargando = false;
          this.pacientes = [...this.pacientes]; // Forzar refresco final

          // CRITICO: Forzar la detección de cambios de Angular inmediatamente
          this.cdr.detectChanges();

          console.log('Formulario cerrado. ID seleccionado:', this.pacienteSeleccionadoId);
        }, 100);
      },
      error: (error) => {
        console.error('Error al guardar visitante:', error);
        this.cargando = false;  // Desactivar carga en caso de error
        alert('Error al agregar el visitante. Por favor, intente nuevamente.');
      }
    });
  }


  // Cancelar agregar visitante
  cancelarAgregarVisitante(): void {
    this.pacienteSeleccionadoId = null;  // Solo limpiamos el ID
    this.nuevoVisitante = {
      idPaciente: 0,
      nombre: '',
      dni: '',
      entrada: new Date(),
      observacion: ''
    };
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  // Método para obtener el nombre del paciente seleccionado
  getNombrePaciente(): string {
    if (!this.pacienteSeleccionadoId) return '';
    const paciente = this.pacientes.find(p => p.id === this.pacienteSeleccionadoId);
    return paciente ? paciente.nombre : '';
  }

  // Método para obtener la habitación del paciente seleccionado
  getHabitacionPaciente(): string {
    if (!this.pacienteSeleccionadoId) return '';
    const paciente = this.pacientes.find(p => p.id === this.pacienteSeleccionadoId);
    return paciente ? paciente.hab.toString() : '';
  }











  // Actualizar paciente Revisar si es necesario para el backend, actualmente solo actualiza localmente
  actualizarPaciente(): void {
    if (this.pacienteSeleccionadoId) {
      const paciente = this.pacientes.find(p => p.id === this.pacienteSeleccionadoId);
      if (paciente) {
        this.pacienteSeleccionadoId = null;
      }
    }
  }

  // Eliminar paciente
  eliminarPaciente(id: number): void {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      this.pacientes = this.pacientes.filter(p => p.id !== id);
    }
  }

  private obtenerFechaActual() : string{
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    return `${año}-${mes}-${dia}T${horas}:${minutos}`;  
  }



  // Método para cambiar el límite de la cantidad de visitas
  cambiarLimite(delta: number): void {
    const nuevoValor = this.limiteAcompaniantes + delta;
    if (nuevoValor >= 1 && nuevoValor <= 10) { // límites razonables
      this.limiteAcompaniantes = nuevoValor;
    }
  }

}
