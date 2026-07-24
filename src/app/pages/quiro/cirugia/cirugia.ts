import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { QuiroMenu } from '../../../shared/quiro-menu/quiro-menu';
import { environment } from '../../../../environments/environment';
import { QrCirugiaModel } from '../../../models/quiro/qrcirugia.model';

@Component({
  selector: 'app-cirugia',
  standalone: true,
  imports: [CommonModule, FormsModule, QuiroMenu],
  templateUrl: './cirugia.html',
  styleUrl: './cirugia.css'
})
export class Cirugia {
  hcl = '';
  fechaDesde = '';
  fechaHasta = '';

  loading = false;
  error = '';
  resultados: (QrCirugiaModel & { __raw?: any })[] = [];
  selectedCirugia: any | null = null;
  showDetalleModal = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  buscar(): void {
    this.loading = true;
    this.error = '';
    this.resultados = [];

    let params = new HttpParams();

    if (this.hcl.trim()) {
      params = params.set('hcl', this.hcl.trim());
    }

    if (this.fechaDesde) {
      params = params.set('fechaDesde', this.fechaDesde);
    }

    if (this.fechaHasta) {
      params = params.set('fechaHasta', this.fechaHasta);
    }

    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      this.error = 'El rango de fechas es inválido: fecha inicio no puede ser mayor a fecha final.';
      this.resultados = [];
      this.loading = false;
      return;
    }

    const endpoint = `${environment.apiBaseUrl}/quiro/cirugias`;
    const queryString = params.toString();
    const requestUrl = queryString ? `${endpoint}?${queryString}` : endpoint;

    console.log('[Cirugia] Buscando cirugías');
    console.log('[Cirugia] URL:', requestUrl);
    console.log('[Cirugia] Filtros:', {
      hcl: this.hcl?.trim() || null,
      fechaDesde: this.fechaDesde || null,
      fechaHasta: this.fechaHasta || null
    });

    this.http.get<any>(endpoint, { params }).subscribe({
      next: (data) => {
        console.log('[Cirugia] data cruda:', data);

        const rawList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.result)
                ? data.result
                : [];

        const normalized: (QrCirugiaModel & { __raw?: any })[] = rawList.map((item: any) => ({
          HCL: item?.HCL ?? item?.hcl ?? '',
          PAC: item?.PAC ?? item?.pac ?? '',
          FEC: item?.FEC ?? item?.fec ?? '',
          PQR1: item?.PQR1 ?? item?.pqr1 ?? '',
          OS: item?.OS ?? item?.os ?? '',
          CIR: item?.CIR ?? item?.cir ?? '',
          __raw: item
        }));

        this.resultados = [...normalized];
        this.loading = false;
        this.cdr.detectChanges();

        console.log('[Cirugia] Respuesta OK - total registros:', this.resultados.length);
        console.log('[Cirugia] Datos normalizados:', this.resultados);
      },
      error: (err) => {
        this.error = 'No se pudo obtener la información de cirugías.';
        this.resultados = [];
        this.loading = false;
        this.cdr.detectChanges();
        console.error('[Cirugia] Error en búsqueda:', err);
      }
    });
  }


  abrirDetalle(item: QrCirugiaModel & { __raw?: any }): void {
    this.selectedCirugia = item?.__raw ?? item;
    this.showDetalleModal = true;
  }

  cerrarDetalle(): void {
    this.showDetalleModal = false;
    this.selectedCirugia = null;
  }

  formatDetalleValor(key: string | number | symbol, value: any): string {
    if (value === null || value === undefined || value === '') return '-';

    const normalizedKey = String(key || '').toUpperCase();

    if (normalizedKey === 'FEC') return this.formatFecha(String(value));
    if (normalizedKey === 'HIN' || normalizedKey === 'HTE') return this.formatHora(String(value));

    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  getDetalleItem(raw: any, keys: string[], fallback = '-'): string {
    if (!raw) return fallback;

    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null && raw[key] !== '') {
        return this.formatDetalleValor(key, raw[key]);
      }
      const low = key.toLowerCase();
      if (raw[low] !== undefined && raw[low] !== null && raw[low] !== '') {
        return this.formatDetalleValor(low, raw[low]);
      }
    }

    return fallback;
  }

  getOtrosCampos(raw: any): Array<{ key: string; value: any }> {
    if (!raw || typeof raw !== 'object') return [];

    const mainKeys = new Set([
      'FEC', 'HIN', 'HTE', 'PAC', 'PQR1', 'PRA', 'CIR', 'AYU', 'INS', 'CIRCU', 'ANE',
      'OS', 'EDAD', 'HCL', 'TAN', 'UNS', 'APA'
    ]);

    return Object.keys(raw)
      .filter((k) => !mainKeys.has(k.toUpperCase()))
      .map((k) => ({ key: k, value: raw[k] }));
  }

  formatHora(value: string | null): string {
    if (!value) return '-';

    const hhmmMatch = value.match(/\b(\d{2}):(\d{2})/);
    if (hhmmMatch) {
      return `${hhmmMatch[1]}:${hhmmMatch[2]}`;
    }

    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }

    return value;
  }

  formatFecha(value: string | null): string {
    if (!value) return '';

    // Evitar corrimiento por zona horaria cuando viene ISO UTC (ej: 2026-07-09T00:00:00.000Z)
    // Mostramos únicamente la parte de fecha del string original.
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];
      return `${day}/${month}/${year}`;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-AR');
  }
}
