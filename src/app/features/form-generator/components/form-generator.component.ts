import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { FormGenerationLoaderComponent } from './form-generation-loader/form-generation-loader.component';

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
        FormGenerationLoaderComponent,
    ],
    templateUrl: './form-generator.component.html',
    styleUrl: './form-generator.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGeneratorComponent implements OnInit, OnDestroy {
    @ViewChild('previewSection') previewSection: ElementRef | null = null;

    generatedForm: FormConfig | null = null;
    isGenerating = false;
    error: string | null = null;
    isEditMode = false;
    editFormId: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private aiService: AIService,
        private formService: FormService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (!this.aiService.isConfigured()) {
            this.error = 'OpenAI API key not configured. Please configure it in settings.';
            this.cdr.markForCheck();
        }

        // Check for edit mode from query params
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                const formId = params['formId'];
                const mode = params['mode'];

                if (formId && (mode === 'edit' || mode === 'view')) {
                    this.isEditMode = mode === 'edit';
                    this.editFormId = formId;
                    const form = this.formService.getForm(formId);
                    if (form) {
                        this.generatedForm = { ...form };
                        this.cdr.markForCheck();
                    } else {
                        this.error = 'Form not found';
                        this.cdr.markForCheck();
                    }
                } else {
                    // Reset edit mode when navigating without params
                    this.isEditMode = false;
                    this.editFormId = null;
                }
            });
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
                    // Scroll to preview section after form is generated
                    setTimeout(() => this.scrollToPreview(), 100);
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
            if (this.isEditMode && this.editFormId) {
                // Update existing form
                this.generatedForm.updatedAt = new Date();
                this.formService.updateForm(this.generatedForm);
                this.error = 'Form updated successfully!';
            } else {
                // Create new form
                this.formService.createForm(this.generatedForm);
                this.error = 'Form saved successfully!';
            }
            this.cdr.markForCheck();
            setTimeout(() => {
                this.error = null;
                this.cdr.markForCheck();
                // Navigate back to forms list after save
                this.router.navigate(['/forms']);
            }, 1500);
        }
    }

    discardForm(): void {
        this.generatedForm = null;
        this.error = null;
        this.isEditMode = false;
        this.editFormId = null;
        // Clear query params
        this.router.navigate(['/form-generator']);
        this.cdr.markForCheck();
    }

    /**
     * Scroll to the generated form preview section
     */
    private scrollToPreview(): void {
        if (this.previewSection?.nativeElement) {
            this.previewSection.nativeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
