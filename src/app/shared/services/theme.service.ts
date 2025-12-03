import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface ThemeConfig {
    name: Theme;
    colors: {
        primary: string;
        primaryLight: string;
        primaryDark: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        success: string;
        warning: string;
        error: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private currentThemeSubject = new BehaviorSubject<Theme>('light');
    public currentTheme$ = this.currentThemeSubject.asObservable();

    private themes: Record<Theme, ThemeConfig> = {
        light: {
            name: 'light',
            colors: {
                primary: '#1976d2',
                primaryLight: '#42a5f5',
                primaryDark: '#1565c0',
                secondary: '#f50057',
                accent: '#667eea',
                background: '#f5f5f5',
                surface: '#ffffff',
                text: '#212121',
                textSecondary: '#666666',
                border: '#e0e0e0',
                success: '#388e3c',
                warning: '#fbc02d',
                error: '#d32f2f',
            },
        },
        dark: {
            name: 'dark',
            colors: {
                primary: '#42a5f5',
                primaryLight: '#64b5f6',
                primaryDark: '#1976d2',
                secondary: '#f50057',
                accent: '#667eea',
                background: '#121212',
                surface: '#1e1e1e',
                text: '#ffffff',
                textSecondary: '#b0b0b0',
                border: '#333333',
                success: '#66bb6a',
                warning: '#fdd835',
                error: '#ef5350',
            },
        },
    };

    constructor() {
        this.loadThemeFromStorage();
    }

    /**
     * Get all available themes
     */
    getAvailableThemes(): Theme[] {
        return Object.keys(this.themes) as Theme[];
    }

    /**
     * Get current theme
     */
    getCurrentTheme(): Theme {
        return this.currentThemeSubject.value;
    }

    /**
     * Set theme and apply to DOM
     */
    setTheme(theme: Theme): void {
        if (!(theme in this.themes)) {
            console.warn(`Theme "${theme}" not found, defaulting to light`);
            theme = 'light';
        }

        this.currentThemeSubject.next(theme);
        this.applyTheme(theme);
        this.saveThemeToStorage(theme);
    }

    /**
     * Apply theme to DOM using CSS custom properties
     */
    private applyTheme(theme: Theme): void {
        const themeConfig = this.themes[theme];
        const root = document.documentElement;

        // Set CSS custom properties
        Object.entries(themeConfig.colors).forEach(([key, value]) => {
            const cssVarName = `--color-${this.camelToKebab(key)}`;
            root.style.setProperty(cssVarName, value);
        });

        // Set theme attribute for body
        document.body.setAttribute('data-theme', theme);

        // Apply Material theme class
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
    }

    /**
     * Get theme configuration
     */
    getThemeConfig(theme?: Theme): ThemeConfig {
        const targetTheme = theme || this.getCurrentTheme();
        return this.themes[targetTheme];
    }

    /**
     * Save theme preference to localStorage
     */
    private saveThemeToStorage(theme: Theme): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('app_theme', theme);
        }
    }

    /**
     * Load theme preference from localStorage
     */
    private loadThemeFromStorage(): void {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('app_theme') as Theme | null;
            if (saved && saved in this.themes) {
                this.setTheme(saved);
            } else {
                // Default to light theme
                this.setTheme('light');
            }
        }
    }

    /**
     * Convert camelCase to kebab-case
     */
    private camelToKebab(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme(): void {
        const current = this.getCurrentTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}
