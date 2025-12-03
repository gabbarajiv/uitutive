import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AIService } from '../../../shared/services/ai.service';
import { FormService } from '../../../shared/services/form.service';
import { FormConfig } from '../../../shared/models/form.model';
import { PromptInputComponent } from './prompt-input/prompt-input.component';
import { FormPreviewComponent } from './form-preview/form-preview.component';

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
        PromptInputComponent,
        FormPreviewComponent,
    ],
    template: `
    <div class="form-generator-container">
      <div class="header">
        <h1>AI Form Generator</h1>
        <p class="subtitle">Generate forms instantly using natural language prompts</p>
      </div>

      <!-- Prompt Input Section -->
      <app-prompt-input
        (promptSubmit)="onPromptSubmit($event)"
        [isLoading]="isGenerating"
      ></app-prompt-input>

      <!-- Error Message -->
      <div *ngIf="error" class="error-message" [class.success]="error.includes('successfully')">
        <mat-icon>{{ error.includes('successfully') ? 'check_circle' : 'error' }}</mat-icon>
        <span>{{ error }}</span>
      </div>

      <!-- Loading State -->
      <div *ngIf="isGenerating" class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Generating your form...</p>
      </div>

      <!-- Generated Form Preview -->
      <div *ngIf="generatedForm && !isGenerating" class="generated-form-section">
        <div class="section-header">
          <h2>Preview</h2>
          <div class="actions">
            <button mat-raised-button color="primary" (click)="saveForm()">
              <mat-icon>save</mat-icon>
              Save Form
            </button>
            <button mat-stroked-button (click)="discardForm()">
              <mat-icon>delete_outline</mat-icon>
              Discard
            </button>
          </div>
        </div>

        <app-form-preview [formConfig]="generatedForm"></app-form-preview>
      </div>

      <!-- Empty State -->
      <div *ngIf="!generatedForm && !isGenerating" class="empty-state">
        <mat-icon>description</mat-icon>
        <p>Enter a prompt above to generate a form</p>
      </div>
    </div>
  `,
    styles: [`
    .form-generator-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;

      .header {
        text-align: center;
        margin-bottom: 2rem;

        h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          color: #1976d2;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        margin: 1rem 0;
        background-color: #ffebee;
        border-left: 4px solid #d32f2f;
        border-radius: 4px;
        color: #d32f2f;

        &.success {
          background-color: #e8f5e9;
          border-left-color: #388e3c;
          color: #388e3c;

          mat-icon {
            color: #388e3c;
          }
        }

        mat-icon {
          color: #d32f2f;
        }
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;

        p {
          margin-top: 1rem;
          color: #666;
          font-size: 1.1rem;
        }
      }

      .generated-form-section {
        margin-top: 2rem;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;

          h2 {
            margin: 0;
            color: #333;
          }

          .actions {
            display: flex;
            gap: 1rem;

            button {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
          }
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
        color: #999;

        mat-icon {
          font-size: 4rem;
          width: 4rem;
          height: 4rem;
          margin-bottom: 1rem;
          color: #ddd;
        }

        p {
          font-size: 1.1rem;
          margin: 0;
        }
      }
    }

    @media (max-width: 768px) {
      .form-generator-container {
        padding: 1rem;

        .header h1 {
          font-size: 1.8rem;
        }

        .generated-form-section .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;

          .actions {
            width: 100%;

            button {
              flex: 1;
            }
          }
        }
      }
    }
  `],
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
