import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InternadoModel } from '../../models/internados/internado.model';

interface RegistroHistoria {
  fecha: string;
  origen: string;
  puerta: string | null;
  ord: number | null;
  servicio: string;
  txt: string;
  profesional: string;
}

interface RespuestaHistoria {
  evoluciones: RegistroHistoria[];
  informesRayos: RegistroHistoria[];
  resultadosLaboratorio: RegistroHistoria[];
}

interface GrupoHistoria {
  titulo: string;
  registros: RegistroHistoria[];
}

@Component({
  selector: 'app-ver-hcl',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verhcl.html',
  styleUrl: './verhcl.css'
})
export class VerHcl implements OnDestroy, OnInit {
  internados: InternadoModel[] = [];
  cargando = false;
  mensajeError = '';
  historiaAbierta = false;
  cargandoHistoria = false;
  errorHistoria = '';
  pacienteSeleccionado: InternadoModel | null = null;
  gruposHistoria: GrupoHistoria[] = [];
  registroSeleccionado: RegistroHistoria | null = null;

  private historiaSubscription?: Subscription;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  get sinRegistrosHistoria(): boolean {
    return this.gruposHistoria.every(grupo => grupo.registros.length === 0);
  }

  ngOnInit(): void {
    this.cargarInternados();
  }

  ngOnDestroy(): void {
    this.historiaSubscription?.unsubscribe();
  }

  calcularEdad(fechaNacimiento: string | null): string {
    const nacimiento = this.obtenerPartesFecha(fechaNacimiento);
    if (!nacimiento) {
      return '-';
    }

    const hoy = this.obtenerFechaActual();
    const [anioNacimiento, mesNacimiento, diaNacimiento] = nacimiento;
    const [anioActual, mesActual, diaActual] = hoy;
    const diasEnMesActual = new Date(Date.UTC(anioActual, mesActual, 0)).getUTCDate();
    const diaAniversarioMes = Math.min(diaNacimiento, diasEnMesActual);
    let mesesTotales = (anioActual - anioNacimiento) * 12 + mesActual - mesNacimiento;

    if (diaActual < diaAniversarioMes) {
      mesesTotales--;
    }

    if (mesesTotales < 0) {
      return '-';
    }

    const anios = Math.floor(mesesTotales / 12);
    const meses = mesesTotales % 12;
    return `${anios} ${anios === 1 ? 'año' : 'años'} ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }

  calcularDiasInternacion(fechaInternacion: string | null): number | string {
    const internacion = this.obtenerPartesFecha(fechaInternacion);
    if (!internacion) {
      return '-';
    }

    const hoy = this.obtenerFechaActual();
    const dias = this.aDiasUTC(hoy) - this.aDiasUTC(internacion);
    return Math.max(0, dias);
  }

  abrirHistoria(paciente: InternadoModel): void {
    if (!paciente.HCL) {
      return;
    }

    this.historiaSubscription?.unsubscribe();
    this.pacienteSeleccionado = paciente;
    this.historiaAbierta = true;
    this.cargandoHistoria = true;
    this.errorHistoria = '';
    this.gruposHistoria = [];
    this.registroSeleccionado = null;

    const params = new HttpParams().set('hcl', paciente.HCL).set('tipo', 'completo');
    this.historiaSubscription = this.http
      .get<RespuestaHistoria>(`${environment.apiBaseUrl}/internados/verhcl`, { params })
      .subscribe({
        next: respuesta => {
          this.gruposHistoria = [
            { titulo: 'Evoluciones', registros: respuesta.evoluciones },
            { titulo: 'Informes de rayos', registros: respuesta.informesRayos },
            { titulo: 'Resultados de laboratorio', registros: respuesta.resultadosLaboratorio }
          ];
          this.registroSeleccionado =
            this.gruposHistoria.flatMap(grupo => grupo.registros)[0] ?? null;
          this.cargandoHistoria = false;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error al cargar la historia clínica:', error);
          this.errorHistoria = 'No se pudo cargar la historia clínica.';
          this.cargandoHistoria = false;
          this.cdr.detectChanges();
        }
      });
  }

  cerrarHistoria(): void {
    this.historiaSubscription?.unsubscribe();
    this.historiaAbierta = false;
    this.pacienteSeleccionado = null;
    this.cargandoHistoria = false;
  }

  seleccionarRegistro(registro: RegistroHistoria): void {
    this.registroSeleccionado = registro;
  }

  formatoPuertaOrden(registro: RegistroHistoria): string {
    const valores = [registro.puerta, registro.ord].filter(
      valor => valor !== null && valor !== ''
    );
    return valores.length > 0 ? valores.join(' - ') : '-';
  }

  private obtenerPartesFecha(fecha: string | null): [number, number, number] | null {
    const coincidencia = fecha?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!coincidencia) {
      return null;
    }

    const anio = Number(coincidencia[1]);
    const mes = Number(coincidencia[2]);
    const dia = Number(coincidencia[3]);
    const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));

    if (
      fechaUTC.getUTCFullYear() !== anio ||
      fechaUTC.getUTCMonth() !== mes - 1 ||
      fechaUTC.getUTCDate() !== dia
    ) {
      return null;
    }

    return [anio, mes, dia];
  }

  private obtenerFechaActual(): [number, number, number] {
    const hoy = new Date();
    return [hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate()];
  }

  private aDiasUTC([anio, mes, dia]: [number, number, number]): number {
    return Date.UTC(anio, mes - 1, dia) / 86_400_000;
  }

  private cargarInternados(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http.get<InternadoModel | InternadoModel[]>(`${environment.apiBaseUrl}/internados`).subscribe({
      next: respuesta => {
        this.internados = Array.isArray(respuesta) ? respuesta : [respuesta];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar los internados:', error);
        this.mensajeError = 'No se pudieron cargar los pacientes internados.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
