import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';
export type HeaderTheme = 'default' | 'christmas' | 'neon' | 'ocean' | 'sunset' | 'forest' | 'cyber' | 'minimal';

export interface HeaderThemeConfig {
    name: HeaderTheme;
    gradient?: string;
    icon?: string;
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
    effects?: {
        hasGlow?: boolean;
        hasPattern?: boolean;
        hasAnimation?: boolean;
    };
}

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
    private currentThemeSubject = new BehaviorSubject<Theme>('dark');
    public currentTheme$ = this.currentThemeSubject.asObservable();

    private currentHeaderThemeSubject = new BehaviorSubject<HeaderTheme>('default');
    public currentHeaderTheme$ = this.currentHeaderThemeSubject.asObservable();

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

    private headerThemes: Record<HeaderTheme, HeaderThemeConfig> = {
        default: {
            name: 'default',
            gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
            effects: { hasGlow: true, hasPattern: false, hasAnimation: false },
        },
        christmas: {
            name: 'christmas',
            gradient: 'linear-gradient(135deg, #dc2626 0%, #16a34a 50%, #dc2626 100%)',
            icon: 'celebration',
            effects: { hasGlow: true, hasPattern: true, hasAnimation: true },
        },
        neon: {
            name: 'neon',
            gradient: 'linear-gradient(135deg, #ff006e 0%, #00f5ff 100%)',
            effects: { hasGlow: true, hasPattern: true, hasAnimation: true },
        },
        ocean: {
            name: 'ocean',
            gradient: 'linear-gradient(135deg, #0369a1 0%, #06b6d4 100%)',
            effects: { hasGlow: true, hasPattern: false, hasAnimation: true },
        },
        sunset: {
            name: 'sunset',
            gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)',
            effects: { hasGlow: true, hasPattern: false, hasAnimation: true },
        },
        forest: {
            name: 'forest',
            gradient: 'linear-gradient(135deg, #15803d 0%, #059669 100%)',
            effects: { hasGlow: false, hasPattern: true, hasAnimation: false },
        },
        cyber: {
            name: 'cyber',
            gradient: 'linear-gradient(135deg, #1e1b4b 0%, #6d28d9 100%)',
            effects: { hasGlow: true, hasPattern: true, hasAnimation: true },
        },
        minimal: {
            name: 'minimal',
            gradient: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            effects: { hasGlow: false, hasPattern: false, hasAnimation: false },
        },
    };

    constructor() {
        this.loadThemeFromStorage();
        this.loadHeaderThemeFromStorage();
    }

    /**
     * Get all available themes
     */
    getAvailableThemes(): Theme[] {
        return Object.keys(this.themes) as Theme[];
    }

    /**
     * Get all available header themes
     */
    getAvailableHeaderThemes(): HeaderTheme[] {
        return Object.keys(this.headerThemes) as HeaderTheme[];
    }

    /**
     * Get current theme
     */
    getCurrentTheme(): Theme {
        return this.currentThemeSubject.value;
    }

    /**
     * Get current header theme
     */
    getCurrentHeaderTheme(): HeaderTheme {
        return this.currentHeaderThemeSubject.value;
    }

    /**
     * Set header theme
     */
    setHeaderTheme(theme: HeaderTheme): void {
        if (!(theme in this.headerThemes)) {
            console.warn(`Header theme "${theme}" not found, defaulting to default`);
            theme = 'default';
        }

        this.currentHeaderThemeSubject.next(theme);
        this.applyHeaderTheme(theme);
        this.saveHeaderThemeToStorage(theme);
    }

    /**
     * Apply header theme to DOM using CSS custom properties
     */
    private applyHeaderTheme(theme: HeaderTheme): void {
        const headerThemeConfig = this.headerThemes[theme];
        const root = document.documentElement;

        // Set header theme variables
        root.style.setProperty('--header-gradient', headerThemeConfig.gradient || 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)');
        root.style.setProperty('--header-has-glow', headerThemeConfig.effects?.hasGlow ? '1' : '0');
        root.style.setProperty('--header-has-pattern', headerThemeConfig.effects?.hasPattern ? '1' : '0');
        root.style.setProperty('--header-has-animation', headerThemeConfig.effects?.hasAnimation ? '1' : '0');

        // Add theme class to document for CSS styling
        document.documentElement.setAttribute('data-header-theme', theme);
    }

    /**
     * Get header theme configuration
     */
    getHeaderThemeConfig(theme?: HeaderTheme): HeaderThemeConfig {
        const targetTheme = theme || this.getCurrentHeaderTheme();
        return this.headerThemes[targetTheme];
    }

    /**
     * Save header theme preference to localStorage
     */
    private saveHeaderThemeToStorage(theme: HeaderTheme): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('app_header_theme', theme);
        }
    }

    /**
     * Load header theme preference from localStorage
     */
    private loadHeaderThemeFromStorage(): void {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('app_header_theme') as HeaderTheme | null;
            if (saved && saved in this.headerThemes) {
                this.setHeaderTheme(saved);
            } else {
                // Default to default header theme
                this.setHeaderTheme('default');
            }
        }
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
                // Default to dark theme
                this.setTheme('dark');
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
