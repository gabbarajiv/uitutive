import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService, Theme } from '../../../shared/services/theme.service';
import { AIService } from '../../../shared/services/ai.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatTooltipModule,
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
    currentTheme: Theme;
    availableThemes: Theme[] = [];
    apiKey: string = '';
    showApiKey: boolean = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;
    isSaving: boolean = false;
    hasUnsavedChanges: boolean = false;

    constructor(
        private themeService: ThemeService,
        private aiService: AIService,
        private cdr: ChangeDetectorRef
    ) {
        this.currentTheme = this.themeService.getCurrentTheme();
    }

    ngOnInit(): void {
        this.availableThemes = this.themeService.getAvailableThemes();
        this.loadApiKey();
    }

    /**
     * Change theme
     */
    changeTheme(theme: Theme): void {
        this.themeService.setTheme(theme);
        this.currentTheme = theme;
        this.markAsChanged();
    }

    /**
     * Load API key from storage (kept for reference, Ollama uses local API)
     */
    private loadApiKey(): void {
        // Ollama uses local API configuration from environment files
        // API Key management not needed for local Ollama instance
        this.apiKey = 'Ollama (Local API)';
    }

    /**
     * Save API key (not used with Ollama local instance)
     */
    saveApiKey(): void {
        if (!this.apiKey || this.apiKey.length === 0) {
            this.showErrorMessage('Please enter an API key');
            return;
        }

        this.isSaving = true;
        this.cdr.markForCheck();

        // Simulate API call
        setTimeout(() => {
            this.showSuccessMessage('Using Ollama local API - no API key needed!');
            this.isSaving = false;
            this.hasUnsavedChanges = false;
            this.cdr.markForCheck();
        }, 500);
    }

    /**
     * Toggle API key visibility
     */
    toggleApiKeyVisibility(): void {
        this.showApiKey = !this.showApiKey;
        this.cdr.markForCheck();
    }

    /**
     * Clear API key
     */
    clearApiKey(): void {
        if (confirm('Are you sure you want to clear the API key?')) {
            this.apiKey = '';
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('openai_api_key');
            }
            this.showSuccessMessage('API Key cleared!');
            this.hasUnsavedChanges = false;
            this.cdr.markForCheck();
        }
    }

    /**
     * Show success message
     */
    private showSuccessMessage(message: string): void {
        this.successMessage = message;
        this.errorMessage = null;
        this.cdr.markForCheck();
        setTimeout(() => {
            this.successMessage = null;
            this.cdr.markForCheck();
        }, 3000);
    }

    /**
     * Show error message
     */
    private showErrorMessage(message: string): void {
        this.errorMessage = message;
        this.successMessage = null;
        this.cdr.markForCheck();
        setTimeout(() => {
            this.errorMessage = null;
            this.cdr.markForCheck();
        }, 4000);
    }

    /**
     * Mark settings as changed
     */
    private markAsChanged(): void {
        this.hasUnsavedChanges = true;
        this.cdr.markForCheck();
    }

    /**
     * Reset all settings to default
     */
    resetToDefaults(): void {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            this.themeService.setTheme('light');
            this.currentTheme = 'light';
            this.clearApiKey();
            this.showSuccessMessage('Settings reset to defaults!');
            this.hasUnsavedChanges = false;
        }
    }

    /**
     * Export settings as JSON
     */
    exportSettings(): void {
        const settings = {
            theme: this.currentTheme,
            exportedAt: new Date().toISOString(),
        };
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `settings-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showSuccessMessage('Settings exported successfully!');
    }

    /**
     * Import settings from JSON
     */
    importSettings(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target?.result as string);
                if (settings.theme && this.availableThemes.includes(settings.theme)) {
                    this.themeService.setTheme(settings.theme);
                    this.currentTheme = settings.theme;
                    this.showSuccessMessage('Settings imported successfully!');
                    this.cdr.markForCheck();
                } else {
                    this.showErrorMessage('Invalid settings file');
                }
            } catch {
                this.showErrorMessage('Error importing settings file');
            }
        };
        reader.readAsText(file);
    }
}
