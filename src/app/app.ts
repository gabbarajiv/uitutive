import { Component, OnInit, Renderer2, HostBinding, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.dark-theme]': 'isDarkTheme'
  }
})
export class App implements OnInit {
  isDarkTheme = true;

  constructor(
    private themeService: ThemeService,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Apply dark theme immediately to document (browser only)
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setAttribute(document.documentElement, 'data-theme', 'dark');
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }

  ngOnInit(): void {
    // Initialize theme service (loads saved theme from localStorage, defaults to dark)
    this.isDarkTheme = this.themeService.getCurrentTheme() === 'dark';
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setAttribute(document.documentElement, 'data-theme', this.isDarkTheme ? 'dark' : 'light');
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkTheme = this.themeService.getCurrentTheme() === 'dark';
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setAttribute(document.documentElement, 'data-theme', this.isDarkTheme ? 'dark' : 'light');
    }
  }
}
