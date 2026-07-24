import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterOutlet, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('HPMMWebFront');
  hideLayout = false;

  constructor(private readonly router: Router) {
    this.hideLayout = this.isEntregasRoute(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.hideLayout = this.isEntregasRoute(nav.urlAfterRedirects || nav.url);
      });
  }

  private isEntregasRoute(url: string): boolean {
    return url === '/entregas' || url.startsWith('/entregas?');
  }
}
