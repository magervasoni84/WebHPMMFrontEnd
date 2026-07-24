import { Component } from '@angular/core';
import { QuiroMenu } from '../../../shared/quiro-menu/quiro-menu';

@Component({
  selector: 'app-nuevo-nacimiento',
  standalone: true,
  imports: [QuiroMenu],
  templateUrl: './nuevo-nacimiento.html',
  styleUrl: './nuevo-nacimiento.css'
})
export class NuevoNacimiento {}
