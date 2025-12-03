import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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

    constructor(
        private themeService: ThemeService,
        private aiService: AIService
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
    }

    /**
     * Load API key from storage
     */
    private loadApiKey(): void {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('openai_api_key') || '';
            this.apiKey = saved ? '••••••••' + saved.slice(-4) : '';
        }
    }

    /**
     * Save API key
     */
    saveApiKey(): void {
        if (this.apiKey && !this.apiKey.startsWith('••••••••')) {
            this.aiService.setApiKey(this.apiKey);
            this.showSuccessMessage('API Key saved successfully!');
            this.apiKey = '••••••••' + this.apiKey.slice(-4);
        }
    }

    /**
     * Toggle API key visibility
     */
    toggleApiKeyVisibility(): void {
        this.showApiKey = !this.showApiKey;
    }

    /**
     * Clear API key
     */
    clearApiKey(): void {
        this.apiKey = '';
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('openai_api_key');
        }
        this.showSuccessMessage('API Key cleared!');
    }

    /**
     * Show success message
     */
    private showSuccessMessage(message: string): void {
        this.successMessage = message;
        setTimeout(() => {
            this.successMessage = null;
        }, 3000);
    }

    /**
     * Reset all settings to default
     */
    resetToDefaults(): void {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            this.themeService.setTheme('light');
            this.currentTheme = 'light';
            this.clearApiKey();
            this.showSuccessMessage('Settings reset to defaults!');
        }
    }
}
