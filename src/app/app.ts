import { Component, signal } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, Footer, RouterOutlet, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('HPMMWebFront');
}
