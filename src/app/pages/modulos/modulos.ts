import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UsuarioModel } from '../../models/usuario.model';

@Component({
  selector: 'app-modulos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modulos.html',
  styleUrl: './modulos.css',
})
export class Modulos implements OnInit, OnDestroy {
  currentUser: UsuarioModel | null = null;
  private sub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.getUserInfo();
    this.sub = this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }


//La seguridad de los modulos se da en el apartado observacion separado por ;

  hasAccessToVisitar(): boolean {
    if (!this.currentUser) return false;
    const obs = this.currentUser.observacion || [];

    for (const entry of obs) {
      if (!entry) continue;
      const parts = entry.split(/[,;\s]+/).map(p => p.trim().toUpperCase()).filter(Boolean);
      if (parts.includes('SG')) return true;
    }
    return false;
  }

  hasAccessToQuiro(): boolean {
    if (!this.currentUser) return false;
    const obs = this.currentUser.observacion || [];

    for (const entry of obs) {
      if (!entry) continue;
      const parts = entry.split(/[,;\s]+/).map(p => p.trim().toUpperCase()).filter(Boolean);
      if (parts.includes('QR')) return true;
    }
    return false;
  }

  hasAccessToCargarEstudios(): boolean {
    if (!this.currentUser) return false;
    const obs = this.currentUser.observacion || [];
    for (const entry of obs) {
      if (!entry) continue;
      const parts = entry.split(/[,;\s]+/).map(p => p.trim().toUpperCase()).filter(Boolean);
      if (parts.includes('CE')) return true;
    }
    return false;
  }

  hasAccessToVerHcl(): boolean {
    if (!this.currentUser) return false;
    const obs = this.currentUser.observacion || [];
    for (const entry of obs) {
      if (!entry) continue;
      const parts = entry.split(/[,;\s]+/).map(p => p.trim().toUpperCase()).filter(Boolean);
      if (parts.includes('VHCL')) return true;
    }
    return false;
  }


  goToVisitar() {
    if (this.hasAccessToVisitar()) {
      this.router.navigate(['/visitas']);
    }
  }

  goToQuiro() {
    if (this.hasAccessToQuiro()) {
      this.router.navigate(['/quiro']);
    }
  }

  goToCargarEstudios() {
    if (this.hasAccessToCargarEstudios()) {
      this.router.navigate(['/cargarestudios']);
    }
  }

  goToVerHcl() {
    if (this.hasAccessToVerHcl()) {
      this.router.navigate(['/verhcl']);
    }
  }

}
