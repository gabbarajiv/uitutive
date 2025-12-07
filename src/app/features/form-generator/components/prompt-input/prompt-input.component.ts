import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AIService, ModelInfo } from '../../../../shared/services/ai.service';
import { PromptSuggestionsService, PromptSuggestion } from '../../../../shared/services/prompt-suggestions.service';

@Component({
    selector: 'app-prompt-input',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        MatSelectModule,
        MatChipsModule,
    ],
    templateUrl: './prompt-input.component.html',
    styleUrl: './prompt-input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptInputComponent implements OnInit, OnDestroy {
    @Input() isLoading = false;
    @Output() promptSubmit = new EventEmitter<string>();

    prompt = '';
    availableModels: ModelInfo[] = [];
    selectedModel: string = 'llama2';
    loadingModels: boolean = false;
    modelChangeInProgress: boolean = false;

    suggestions: PromptSuggestion[] = [];
    private destroy$ = new Subject<void>();

    constructor(
        private aiService: AIService,
        private promptSuggestionsService: PromptSuggestionsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadAvailableModels();
        this.promptSuggestionsService.getSuggestions()
            .pipe(takeUntil(this.destroy$))
            .subscribe(suggestions => {
                this.suggestions = suggestions;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
                this.selectedModel = data.currentModel;
                this.loadingModels = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                console.error('Error loading models:', error);
                this.loadingModels = false;
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Change the AI model
     */
    changeModel(model: string): void {
        if (model === this.selectedModel) return;

        this.modelChangeInProgress = true;
        this.cdr.markForCheck();

        this.aiService.setModel(model).subscribe({
            next: () => {
                this.selectedModel = model;
                this.modelChangeInProgress = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                console.error('Error changing model:', error);
                this.modelChangeInProgress = false;
                this.loadAvailableModels();
                this.cdr.markForCheck();
            }
        });
    }

    submit(): void {
        if (this.prompt.trim()) {
            this.promptSubmit.emit(this.prompt);
        }
    }

    /**
     * Select a suggestion and populate the prompt
     */
    selectSuggestion(suggestion: PromptSuggestion): void {
        this.prompt = suggestion.text;
        this.cdr.markForCheck();
    }

    clearPrompt(): void {
        this.prompt = '';
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
}
