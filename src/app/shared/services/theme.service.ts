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
                primary: '#6366f1',
                primaryLight: '#818cf8',
                primaryDark: '#4f46e5',
                secondary: '#ec4899',
                accent: '#10b981',
                background: '#f8fafc',
                surface: '#ffffff',
                text: '#0f172a',
                textSecondary: '#64748b',
                border: '#e2e8f0',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
            },
        },
        dark: {
            name: 'dark',
            colors: {
                primary: '#818cf8',
                primaryLight: '#a5b4fc',
                primaryDark: '#6366f1',
                secondary: '#ec4899',
                accent: '#10b981',
                background: '#0f172a',
                surface: '#1e293b',
                text: '#f1f5f9',
                textSecondary: '#cbd5e1',
                border: '#334155',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
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
