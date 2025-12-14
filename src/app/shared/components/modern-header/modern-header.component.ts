import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ThemeService, HeaderTheme } from '../../services/theme.service';

@Component({
    selector: 'app-modern-header',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
        MatTooltipModule,
        RouterLink,
    ],
    templateUrl: './modern-header.component.html',
    styleUrl: './modern-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModernHeaderComponent implements OnInit {
    @Output() menuToggle = new EventEmitter<void>();
    @Output() themeToggle = new EventEmitter<void>();

    isDarkTheme = signal(true);
    currentHeaderTheme = signal<HeaderTheme>('default');
    availableHeaderThemes = signal<HeaderTheme[]>([]);

    // Computed title based on theme
    headerTitle = computed(() => {
        const theme = this.currentHeaderTheme();
        return theme === 'christmas' ? '🎄 UItutive' : 'UItutive';
    });

    // Computed icon based on theme
    headerIcon = computed(() => {
        const theme = this.currentHeaderTheme();
        const iconMap: Record<HeaderTheme, string> = {
            default: 'auto_awesome',
            christmas: 'celebration',
            neon: 'flash_on',
            ocean: 'waves',
            sunset: 'wb_twilight',
            forest: 'eco',
            cyber: 'smart_toy',
            minimal: 'design_services',
        };
        return iconMap[theme] || 'auto_awesome';
    });

    constructor(private themeService: ThemeService) { }

    ngOnInit(): void {
        this.isDarkTheme.set(this.themeService.getCurrentTheme() === 'dark');
        this.currentHeaderTheme.set(this.themeService.getCurrentHeaderTheme());
        this.availableHeaderThemes.set(this.themeService.getAvailableHeaderThemes());

        // Subscribe to theme changes
        this.themeService.currentTheme$.subscribe((theme) => {
            this.isDarkTheme.set(theme === 'dark');
        });

        this.themeService.currentHeaderTheme$.subscribe((theme) => {
            this.currentHeaderTheme.set(theme);
        });
    }

    onMenuToggle(): void {
        this.menuToggle.emit();
    }

    onThemeToggle(): void {
        this.themeToggle.emit();
    }

    setHeaderTheme(theme: HeaderTheme): void {
        this.themeService.setHeaderTheme(theme);
    }

    getThemeLabel(theme: HeaderTheme): string {
        const labels: Record<HeaderTheme, string> = {
            default: 'Default',
            christmas: '🎄 Christmas',
            neon: '⚡ Neon',
            ocean: '🌊 Ocean',
            sunset: '🌅 Sunset',
            forest: '🌲 Forest',
            cyber: '🤖 Cyber',
            minimal: '✨ Minimal',
        };
        return labels[theme] || theme;
    }
}
