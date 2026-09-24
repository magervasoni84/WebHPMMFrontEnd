import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface EstudioPendiente {
  archivo: File;
  puerta: string;
  protocolo: string;
  paciente: string;
}

interface ResultadoEstudio {
  archivo: string;
  estado: string;
  mensaje: string;
}

interface RespuestaCarga {
  estado: string;
  mensaje: string;
  usuario: string;
  estudios: ResultadoEstudio[];
}

@Component({
  selector: 'app-cargarestudios',
  imports: [CommonModule, FormsModule],
  templateUrl: './cargarestudios.html',
  styleUrl: './cargarestudios.css',
})
export class Cargarestudios {
  paso = 1;
  archivosSeleccionados: File[] = [];
  estudiosPendientes: EstudioPendiente[] = [];
  mensajeError = '';
  cargando = false;
  respuestaCarga: RespuestaCarga | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    const archivosNoPdf = archivos.filter(archivo => archivo.type !== 'application/pdf');

    this.mensajeError = archivosNoPdf.length
      ? 'Solo se pueden seleccionar archivos PDF.'
      : '';

    const nuevosArchivos = archivos.filter(archivo => archivo.type === 'application/pdf');
    this.archivosSeleccionados = [
      ...this.archivosSeleccionados,
      ...nuevosArchivos.filter(archivo =>
        !this.archivosSeleccionados.some(seleccionado =>
          seleccionado.name === archivo.name && seleccionado.size === archivo.size
        )
      )
    ];

    input.value = '';
  }

  quitarArchivo(indice: number): void {
    this.archivosSeleccionados.splice(indice, 1);
    this.archivosSeleccionados = [...this.archivosSeleccionados];
  }

  avanzarAlPasoDos(): void {
    if (!this.archivosSeleccionados.length) {
      this.mensajeError = 'Seleccione al menos un archivo PDF para continuar.';
      return;
    }

    this.estudiosPendientes = this.archivosSeleccionados.map(archivo => ({
      archivo,
      puerta: '',
      protocolo: '',
      paciente: ''
    }));
    this.mensajeError = '';
    this.paso = 2;
  }

  volverAlPasoUno(): void {
    this.paso = 1;
    this.mensajeError = '';
    this.respuestaCarga = null;
  }

  limpiarCarga(): void {
    this.archivosSeleccionados = [];
    this.estudiosPendientes = [];
    this.volverAlPasoUno();
  }

  private reiniciarPantallaLuegoDeCarga(): void {
    this.cargando = false;
    this.limpiarCarga();
    window.location.reload();
  }

  quitarEstudio(indice: number): void {
    this.estudiosPendientes.splice(indice, 1);
    this.estudiosPendientes = [...this.estudiosPendientes];
    this.archivosSeleccionados = this.estudiosPendientes.map(estudio => estudio.archivo);

    if (!this.estudiosPendientes.length) {
      this.volverAlPasoUno();
    }
  }

  normalizarNumero(estudio: EstudioPendiente, campo: 'protocolo' | 'paciente'): void {
    estudio[campo] = estudio[campo].replace(/\D/g, '').slice(0, 10);
  }

  normalizarPuerta(estudio: EstudioPendiente): void {
    estudio.puerta = estudio.puerta.toUpperCase().slice(0, 3);
  }

  private validarDatosNumericos(): boolean {
    const estudioInvalido = this.estudiosPendientes.find(estudio =>
      !/^\d+$/.test(estudio.protocolo) || !/^\d+$/.test(estudio.paciente)
    );

    if (estudioInvalido) {
      this.mensajeError = 'El protocolo y el paciente deben contener solo números.';
      return false;
    }

    return true;
  }

  prepararCarga(): void {
    console.log('[Cargar estudios] Click en "Enviar estudios"', {
      paso: this.paso,
      cargando: this.cargando,
      archivosSeleccionados: this.archivosSeleccionados.length,
      estudiosPendientes: this.estudiosPendientes.length
    });

    const usuarioId = this.authService.getUserInfo()?.operario;
    console.log('[Cargar estudios] Usuario obtenido de la sesión:', usuarioId);

    if (usuarioId === undefined || usuarioId === null) {
      console.error('[Cargar estudios] No hay un operario válido en la sesión.');
      this.mensajeError = 'No se pudo identificar al usuario de la sesión.';
      return;
    }

    if (!this.validarDatosNumericos()) {
      return;
    }

    const estudios = this.estudiosPendientes.map(estudio => ({
      archivo: estudio.archivo.name,
      puerta: estudio.puerta.trim().toUpperCase(),
      protocolo: Number(estudio.protocolo),
      paciente: Number(estudio.paciente)
    }));
    console.log('[Cargar estudios] Estudios que se enviarán:', estudios);

    const formData = new FormData();

    formData.append('usuario', String(usuarioId));
    formData.append('estudios', JSON.stringify(estudios));
    this.estudiosPendientes.forEach(estudio => {
      formData.append('archivos', estudio.archivo, estudio.archivo.name);
    });

    console.log('[Cargar estudios] FormData preparado:', {
      usuario: String(usuarioId),
      estudios: JSON.stringify(estudios),
      archivos: this.estudiosPendientes.map(estudio => ({
        nombre: estudio.archivo.name,
        tipo: estudio.archivo.type,
        tamanio: estudio.archivo.size
      }))
    });
    console.log('[Cargar estudios] URL de envío:', `${environment.apiBaseUrl}/cargarestudios`);

    this.cargando = true;
    this.mensajeError = '';
    this.respuestaCarga = null;

    this.http.post<RespuestaCarga>(`${environment.apiBaseUrl}/cargarestudios`, formData).subscribe({
      next: respuesta => {
        console.log('[Cargar estudios] Respuesta exitosa:', respuesta);
        this.cargando = false;

        if (respuesta.estado?.trim().toUpperCase() === 'OK') {
          console.log('[Cargar estudios] Carga confirmada. Reiniciando la pantalla.');
          this.reiniciarPantallaLuegoDeCarga();
          return;
        }

        this.respuestaCarga = respuesta;
        this.mensajeError = respuesta.mensaje;
      },
      error: error => {
        console.error('[Cargar estudios] Error en la petición:', {
          status: error?.status,
          statusText: error?.statusText,
          url: error?.url,
          error: error?.error,
          mensaje: error?.message
        });
        this.mensajeError = error?.error?.mensaje || 'No se pudieron enviar los estudios.';
        this.cargando = false;
      }
    });
  }

}
