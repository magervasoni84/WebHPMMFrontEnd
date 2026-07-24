import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiro-menu',
  standalone: true,
  templateUrl: './quiro-menu.html',
  styleUrl: './quiro-menu.css'
})
export class QuiroMenu {
  constructor(private router: Router) {}

  goToNuevaCirugia(): void {
    this.router.navigate(['/quiro/nueva-cirugia']);
  }

  goToCirugia(): void {
    this.router.navigate(['/quiro/cirugia']);
  }

  goToNuevoNacimiento(): void {
    this.router.navigate(['/quiro/nuevo-nacimiento']);
  }

  goToNacimiento(): void {
    this.router.navigate(['/quiro/nacimiento']);
  }

  goToParteQuirurgico(): void {
    this.router.navigate(['/quiro/parte-quirurgico']);
  }

  goToEndoscopia(): void {
    this.router.navigate(['/quiro/endoscopia']);
  }

  goToTurnos(): void {
    this.router.navigate(['/quiro/turnos']);
  }

  goToVerHcl(): void {
    this.router.navigate(['/quiro/ver-hcl']);
  }
}
