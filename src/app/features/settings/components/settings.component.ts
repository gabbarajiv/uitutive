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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ThemeService, Theme } from '../../../shared/services/theme.service';
import { AIService, ModelInfo } from '../../../shared/services/ai.service';
import { PromptSuggestionsService, PromptSuggestion } from '../../../shared/services/prompt-suggestions.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

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
        MatProgressSpinnerModule,
        MatChipsModule,
        MatDialogModule,
        PageHeaderComponent,
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

    // Model selection
    availableModels: ModelInfo[] = [];
    currentModel: string = 'llama2';
    loadingModels: boolean = false;
    modelChangeInProgress: boolean = false;

    // Prompt suggestions
    suggestions: PromptSuggestion[] = [];
    newSuggestion: string = '';
    editingSuggestionId: string | null = null;
    editingSuggestionText: string = '';

    constructor(
        private themeService: ThemeService,
        private aiService: AIService,
        private promptSuggestionsService: PromptSuggestionsService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog
    ) {
        this.currentTheme = this.themeService.getCurrentTheme();
    }

    ngOnInit(): void {
        this.availableThemes = this.themeService.getAvailableThemes();
        this.loadApiKey();
        this.loadAvailableModels();
        this.loadPromptSuggestions();
    }

    /**
     * Load available models from backend
     */
    private loadAvailableModels(): void {
        this.loadingModels = true;
        this.cdr.markForCheck();

        this.aiService.getAvailableModels().subscribe({
            next: (data) => {
                this.availableModels = data.models;
                this.currentModel = data.currentModel;
                this.loadingModels = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                console.error('Error loading models:', error);
                this.showErrorMessage('Failed to load available models');
                this.loadingModels = false;
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Change the AI model
     */
    changeModel(model: string): void {
        if (model === this.currentModel) return;

        this.modelChangeInProgress = true;
        this.cdr.markForCheck();

        this.aiService.setModel(model).subscribe({
            next: () => {
                this.currentModel = model;
                this.modelChangeInProgress = false;
                this.showSuccessMessage(`Model switched to ${model}`);
                this.markAsChanged();
                this.cdr.markForCheck();
            },
            error: (error) => {
                console.error('Error changing model:', error);
                this.showErrorMessage(`Failed to switch to model: ${model}`);
                this.modelChangeInProgress = false;
                this.loadAvailableModels(); // Reload to get correct current model
                this.cdr.markForCheck();
            }
        });
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
     * Compare function for mat-select to properly identify selected model
     */
    compareModels(m1: string, m2: string): boolean {
        // Extract base model name (before colon for versioned names like 'llama2:latest')
        const m1Base = m1?.split(':')[0]?.toLowerCase() || '';
        const m2Base = m2?.split(':')[0]?.toLowerCase() || '';
        return m1Base === m2Base || m1 === m2;
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

    // ============= Prompt Suggestions Management =============

    /**
     * Load prompt suggestions
     */
    private loadPromptSuggestions(): void {
        this.suggestions = this.promptSuggestionsService.getSuggestionsSync();
        this.cdr.markForCheck();
    }

    /**
     * Add a new prompt suggestion
     */
    addPromptSuggestion(): void {
        if (this.newSuggestion.trim()) {
            this.promptSuggestionsService.addSuggestion(this.newSuggestion);
            this.loadPromptSuggestions();
            this.newSuggestion = '';
            this.showSuccessMessage('Suggestion added!');
            this.markAsChanged();
        }
    }

    /**
     * Start editing a suggestion
     */
    startEditSuggestion(id: string, text: string): void {
        this.editingSuggestionId = id;
        this.editingSuggestionText = text;
        this.cdr.markForCheck();
    }

    /**
     * Save edited suggestion
     */
    saveEditSuggestion(): void {
        if (this.editingSuggestionId && this.editingSuggestionText.trim()) {
            this.promptSuggestionsService.updateSuggestion(this.editingSuggestionId, this.editingSuggestionText);
            this.loadPromptSuggestions();
            this.editingSuggestionId = null;
            this.editingSuggestionText = '';
            this.showSuccessMessage('Suggestion updated!');
            this.markAsChanged();
        }
    }

    /**
     * Cancel editing suggestion
     */
    cancelEditSuggestion(): void {
        this.editingSuggestionId = null;
        this.editingSuggestionText = '';
        this.cdr.markForCheck();
    }

    /**
     * Delete a suggestion
     */
    deletePromptSuggestion(id: string): void {
        if (confirm('Are you sure you want to delete this suggestion?')) {
            this.promptSuggestionsService.removeSuggestion(id);
            this.loadPromptSuggestions();
            this.showSuccessMessage('Suggestion deleted!');
            this.markAsChanged();
        }
    }

    /**
     * Reset suggestions to defaults
     */
    resetSuggestionsToDefaults(): void {
        if (confirm('Are you sure you want to reset all suggestions to defaults?')) {
            this.promptSuggestionsService.resetToDefaults();
            this.loadPromptSuggestions();
            this.showSuccessMessage('Suggestions reset to defaults!');
            this.markAsChanged();
        }
    }
}

