import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface EntregasResponse {
  filtros: {
    puerta: string;
    protocolo: number;
    paciente: number;
  };
  total: number;
  data: unknown[];
  pdf: {
    generado: boolean;
    mensaje: string;
    filtros: {
      puerta: string;
      protocolo: number;
      paciente: number;
    };
    totalRegistros: number;
  };
}

@Component({
  selector: 'app-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entregas.html',
  styleUrl: './entregas.css'
})
export class Entregas {
  private readonly http = inject(HttpClient);

  puerta: 'LBA' | 'LBG' = 'LBA';
  protocolo = '';
  paciente = '';
  cargando = false;
  mensajeError = '';
  resultado: EntregasResponse | null = null;
  mensajeResultado = '';

  soloNumeros(value: string): string {
    return value.replace(/\D/g, '');
  }

  protocoloInput(value: string): void {
    this.protocolo = this.soloNumeros(value);
  }

  pacienteInput(value: string): void {
    this.paciente = this.soloNumeros(value);
  }

  buscar(): void {
    this.mensajeError = '';
    this.mensajeResultado = '';
    this.resultado = null;

    if (!this.puerta || !this.protocolo || !this.paciente) {
      this.mensajeError = 'Completá todos los campos.';
      return;
    }

    this.cargando = true;

    const payload = {
      puerta: this.puerta,
      protocolo: Number(this.protocolo),
      paciente: Number(this.paciente)
    };

    const endpoint = `${environment.apiBaseUrl}/entregas`;

    this.http.post<EntregasResponse>(endpoint, payload).pipe(timeout(10000)).subscribe({
      next: (response) => {
        this.resultado = response;
        this.mensajeResultado =
          response?.pdf?.mensaje ||
          (response?.total > 0 ? 'Búsqueda realizada con resultados.' : 'Búsqueda realizada sin resultados.');
        this.cargando = false;
      },
      error: (error: { name?: string }) => {
        if (error?.name === 'TimeoutError') {
          this.mensajeError = 'La consulta tardó más de 10 segundos. Verificá la conexión e intentá nuevamente.';
        } else {
          this.mensajeError = 'Datos incorrectos o no se pudo consultar entregas.';
        }
        this.cargando = false;
      }
    });
  }
}
