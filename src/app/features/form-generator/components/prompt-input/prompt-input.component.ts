import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { AIService, ModelInfo } from '../../../../shared/services/ai.service';

@Component({
    selector: 'app-prompt-input',
    standalone: true,
    providers: [AIService],
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
    ],
    templateUrl: './prompt-input.component.html',
    styleUrl: './prompt-input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptInputComponent implements OnInit {
    @Input() isLoading = false;
    @Output() promptSubmit = new EventEmitter<string>();

    prompt = '';
    availableModels: ModelInfo[] = [];
    selectedModel: string = 'llama2';
    loadingModels: boolean = false;
    modelChangeInProgress: boolean = false;

    constructor(private aiService: AIService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadAvailableModels();
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

    clearPrompt(): void {
        this.prompt = '';
    }
}
