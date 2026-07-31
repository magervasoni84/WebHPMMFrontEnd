import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { race, throwError, timer } from 'rxjs';
import { finalize, mapTo, mergeMap, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface EntregasResponse {
  estado?: string;
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
    fileName?: string;
    downloadPath?: string;
    filtros?: {
      puerta: string;
      protocolo: number;
      paciente: number;
    };
    totalRegistros?: number;
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

  private construirUrlDescarga(downloadPath: string): string {
    const ruta = downloadPath.trim();

    if (/^https?:\/\//i.test(ruta)) {
      return ruta;
    }

    if (ruta.startsWith('/')) {
      if (ruta.startsWith('/api/') || ruta.startsWith('/storage/')) {
        return ruta;
      }

      const base = environment.apiBaseUrl.replace(/\/+$/, '');
      if (base.startsWith('/')) {
        return `${base}${ruta}`;
      }

      return `${window.location.origin}${base ? `/${base}` : ''}${ruta}`;
    }

    const base = environment.apiBaseUrl.replace(/\/+$/, '');
    const pathNormalizado = `/${ruta.replace(/^\/+/, '')}`;

    if (base.startsWith('/')) {
      return `${base}${pathNormalizado}`;
    }

    if (/^https?:\/\//i.test(base)) {
      return `${base}${pathNormalizado}`;
    }

    return `${window.location.origin}${base ? `/${base}` : ''}${pathNormalizado}`;
  }

  descargarPdf(): void {
    const downloadPath = this.resultado?.pdf?.downloadPath;
    const fileName = this.resultado?.pdf?.fileName || 'entrega.pdf';

    if (!downloadPath) {
      alert('No se recibió la ruta de descarga del PDF.');
      return;
    }

    const url = this.construirUrlDescarga(downloadPath);

    this.http.get(url, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body ?? new Blob([], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          alert('No se encontró el archivo PDF en el servidor. Verificá que el backend haya generado el archivo y que la ruta sea correcta.');
        } else {
          alert('No se pudo descargar el PDF. Intentá nuevamente.');
        }
      }
    });
  }

  private resetearPantallaLuegoDeDescarga(): void {
    this.cargando = false;
    this.limpiarFormulario();
    window.location.reload();
  }

  private intentarDescargaAutomatica(): void {
    const downloadPath = this.resultado?.pdf?.downloadPath;
    const fileName = this.resultado?.pdf?.fileName || 'entrega.pdf';

    if (!downloadPath) {
      alert('PDF generado correctamente. No se recibió ruta de descarga automática.');
      this.resetearPantallaLuegoDeDescarga();
      return;
    }

    const url = this.construirUrlDescarga(downloadPath);
    this.http.get(url, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body ?? new Blob([], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

        alert('PDF generado y descargado correctamente.');
        this.resetearPantallaLuegoDeDescarga();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          alert('No se encontró el archivo PDF para descarga automática.');
        } else {
          alert('No se pudo descargar automáticamente el PDF.');
        }
        this.resetearPantallaLuegoDeDescarga();
      }
    });
  }

  soloNumeros(value: string): string {
    return value.replace(/\D/g, '');
  }

  protocoloInput(value: string): void {
    this.protocolo = this.soloNumeros(value);
  }

  pacienteInput(value: string): void {
    this.paciente = this.soloNumeros(value);
  }

  private limpiarFormulario(): void {
    this.protocolo = '';
    this.paciente = '';
    this.resultado = null;
    this.mensajeResultado = '';
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

    console.log('[Entregas] Iniciando búsqueda', { endpoint, payload, timeoutMs: 10000 });

    const http$ = this.http.post<EntregasResponse>(endpoint, payload).pipe(
      tap((response) => console.log('[Entregas] HTTP respondió antes del timeout', response))
    );

    const timeout$ = timer(10000).pipe(
      tap(() => console.log('[Entregas] Timer de 10s disparado')),
      mapTo(null),
      mergeMap(() => throwError(() => new Error('Timeout')))
    );

    race(http$, timeout$).pipe(
      finalize(() => {
        this.cargando = false;
        console.log('[Entregas] finalize ejecutado. cargando=false');
      })
    ).subscribe({
      next: (response) => {
        console.log('[Entregas] next ejecutado', response);

        if (response?.estado === 'ERROR') {
          alert('Datos erroneos');
          this.limpiarFormulario();
          return;
        }

        if (response?.estado === 'NO VERIFICADO') {
          alert('Nos encontramos trabajando.');
          this.limpiarFormulario();
          return;
        }

        this.resultado = response;
        this.mensajeResultado =
          response?.pdf?.mensaje ||
          (response?.total > 0 ? 'Búsqueda realizada con resultados.' : 'Búsqueda realizada sin resultados.');

        if (response?.estado === 'OK' && response?.pdf?.generado) {
          this.intentarDescargaAutomatica();
        }
      },
      error: (err: unknown) => {
        console.log('[Entregas] error ejecutado', err);
        const error = err as HttpErrorResponse | { message?: string };

        if (error instanceof HttpErrorResponse && error.status === 500) {
          alert('Error en la generación del PDF. Se restablecerá la página.');
          this.resetearPantallaLuegoDeDescarga();
          return;
        }

        if (error?.message === 'Timeout') {
          this.mensajeError = 'La consulta tardó más de 10 segundos. Verificá la conexión e intentá nuevamente.';
          console.log('[Entregas] Detectado timeout por mensaje');
        } else {
          this.mensajeError = 'Datos incorrectos o no se pudo consultar entregas.';
          console.log('[Entregas] Error no-timeout');
        }
      }
    });
  }
}
