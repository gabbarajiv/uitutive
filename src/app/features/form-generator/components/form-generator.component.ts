import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AIService } from '../../../shared/services/ai.service';
import { FormService } from '../../../shared/services/form.service';
import { FormConfig } from '../../../shared/models/form.model';
import { PromptInputComponent } from './prompt-input/prompt-input.component';
import { FormPreviewComponent } from './form-preview/form-preview.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
    selector: 'app-form-generator',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatProgressBarModule,
        MatDividerModule,
        PromptInputComponent,
        FormPreviewComponent,
        PageHeaderComponent,
    ],
    templateUrl: './form-generator.component.html',
    styleUrl: './form-generator.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGeneratorComponent implements OnInit, OnDestroy {
    generatedForm: FormConfig | null = null;
    isGenerating = false;
    error: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private aiService: AIService,
        private formService: FormService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        if (!this.aiService.isConfigured()) {
            this.error = 'OpenAI API key not configured. Please configure it in settings.';
            this.cdr.markForCheck();
        }
    }

    onPromptSubmit(prompt: string): void {
        if (!prompt.trim()) {
            this.error = 'Please enter a prompt';
            this.cdr.markForCheck();
            return;
        }

        this.isGenerating = true;
        this.error = null;
        this.cdr.markForCheck();

        this.aiService
            .generateFormFromPrompt(prompt)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (form: FormConfig) => {
                    this.generatedForm = form;
                    this.isGenerating = false;
                    this.cdr.markForCheck();
                },
                error: (err: any) => {
                    this.error = err.message || 'Failed to generate form. Please try again.';
                    this.isGenerating = false;
                    this.cdr.markForCheck();
                },
            });
    }

    saveForm(): void {
        if (this.generatedForm) {
            this.formService.createForm(this.generatedForm);
            this.generatedForm = null;
            this.error = 'Form saved successfully!';
            this.cdr.markForCheck();
            setTimeout(() => {
                this.error = null;
                this.cdr.markForCheck();
            }, 3000);
        }
    }

    discardForm(): void {
        this.generatedForm = null;
        this.error = null;
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
