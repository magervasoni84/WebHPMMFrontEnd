import { Component, signal } from '@angular/core';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { IndexVisitas } from './pages/visitas/index-visitas/index-visitas';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, IndexVisitas],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('HPMMWebFront');
}
