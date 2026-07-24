import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsuarioModel } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  private hasPermission(user: UsuarioModel | null, requiredPermission?: string): boolean {
    if (!requiredPermission) return true;
    if (!user) return false;

    const obs = user.observacion || [];
    for (const entry of obs) {
      if (!entry) continue;
      const parts = entry
        .split(/[,;\s]+/)
        .map(p => p.trim().toUpperCase())
        .filter(Boolean);

      if (parts.includes(requiredPermission.toUpperCase())) {
        return true;
      }
    }
    return false;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredPermission = route.data?.['requiredPermission'] as string | undefined;
    const user = this.authService.getUserInfo();

    if (!this.hasPermission(user, requiredPermission)) {
      this.router.navigate(['/modulos']);
      return false;
    }

    return true;
  }
}
