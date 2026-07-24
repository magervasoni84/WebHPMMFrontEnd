import { Component } from '@angular/core';
import { QuiroMenu } from '../../shared/quiro-menu/quiro-menu';

@Component({
  selector: 'app-quiro',
  standalone: true,
  imports: [QuiroMenu],
  templateUrl: './quiro.html',
  styleUrl: './quiro.css',
})
export class Quiro {}
