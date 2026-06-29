import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioModel } from '../models/usuario.model';

export interface LoginResponse {
  success?: boolean;
  token?: string;
  user?: Partial<UsuarioModel>;
  usuario?: Array<Partial<UsuarioModel>>;
  recordset?: Array<Partial<UsuarioModel>>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<UsuarioModel | null>(this.getUserInfo());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('AuthService.login request', { username, password });
    return this.http.post<LoginResponse>(
      `${environment.apiBaseUrl}/auth/login`,
      { username, password },
      { observe: 'response' }
    ).pipe(
      map((httpResponse: HttpResponse<LoginResponse>) => {
        const response = httpResponse.body || {} as LoginResponse;
        const token = response.token || this.getTokenFromResponse(httpResponse) || undefined;

        console.log('AuthService.login response', httpResponse);

        const user = this.getUserFromResponse(response);
        if (!user) {
          console.error('AuthService.login invalid response', response);
          throw new Error('Invalid login response');
        }

        const normalizedUser = this.normalizeUser(user);
        this.storeSession(normalizedUser, token);
        console.log('AuthService.login stored user', normalizedUser, 'token', token);
        return response;
      }),
      catchError(error => {
        console.error('AuthService.login catchError', error);
        return throwError(() => error);
      })
    );
  }

  private getTokenFromResponse(httpResponse: HttpResponse<LoginResponse>): string | null {
    const headerNames = ['Authorization', 'authorization', 'x-access-token', 'x-access-token', 'token'];
    for (const headerName of headerNames) {
      const value = httpResponse.headers.get(headerName);
      if (value) {
        const token = this.extractBearerToken(value);
        if (token) {
          return token;
        }
      }
    }
    return null;
  }

  private extractBearerToken(value: string): string | null {
    const bearerMatch = value.match(/Bearer\s+(.+)/i);
    return bearerMatch ? bearerMatch[1].trim() : value.trim();
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getUserInfo();
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUserInfo(): UsuarioModel | null {
    const userStr = sessionStorage.getItem(this.USER_KEY);
    if (!userStr || userStr.trim() === '') {
      return null;
    }
    try {
      const parsedUser = JSON.parse(userStr);
      return new UsuarioModel(parsedUser);
    } catch (e) {
      return null;
    }
  }

  private getUserFromResponse(response: LoginResponse): UsuarioModel | null {
    if (response.user) {
      return new UsuarioModel(response.user);
    }
    if (response.usuario && response.usuario.length > 0) {
      return new UsuarioModel(response.usuario[0]);
    }
    if (response.recordset && response.recordset.length > 0) {
      return new UsuarioModel(response.recordset[0]);
    }
    return null;
  }

  private normalizeUser(user: Partial<UsuarioModel>): UsuarioModel {
    const normalized = new UsuarioModel(user);

    // Map backend fields OPE, NOM, PRF, OBS, MAI to the model structure
    if ((user as any).OPE && !normalized.operario) {
      normalized.operario = Number((user as any).OPE);
    }
    if ((user as any).NOM && !normalized.nombre) {
      normalized.nombre = String((user as any).NOM).trim();
    }
    if ((user as any).PRF && !normalized.profesional) {
      normalized.profesional = String((user as any).PRF).trim();
    }
    if ((user as any).OBS && !normalized.observacion) {
      const obsValue = (user as any).OBS;
      normalized.observacion = Array.isArray(obsValue) ? obsValue : (typeof obsValue === 'string' ? [obsValue.trim()] : []);
    }
    if ((user as any).MAI && !normalized.email) {
      normalized.email = String((user as any).MAI).trim();
    }

    // Set username for display
    if (!normalized.username) {
      normalized.username = normalized.nombre || normalized.email || String(normalized.operario || '');
    }

    return normalized;
  }

  private storeSession(user: UsuarioModel, token?: string): void {
    if (token) {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseJwt(token);
      if (!payload.exp) return false;
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (e) {
      return true;
    }
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}
