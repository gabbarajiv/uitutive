import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    ],
    template: `
    <mat-card class="prompt-input-card">
      <mat-card-content>
        <div class="input-group">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Enter your form description</mat-label>
            <textarea
              matInput
              [(ngModel)]="prompt"
              placeholder="e.g., Create a customer registration form with name, email, phone, and address fields"
              rows="4"
              [disabled]="isLoading"
            ></textarea>
            <mat-hint>Describe what form you want to generate</mat-hint>
          </mat-form-field>

          <div class="input-actions">
            <button
              mat-raised-button
              color="primary"
              (click)="submit()"
              [disabled]="!prompt.trim() || isLoading"
            >
              <mat-icon>auto_awesome</mat-icon>
              Generate Form
            </button>
            <button
              mat-icon-button
              (click)="clearPrompt()"
              [disabled]="!prompt || isLoading"
              matTooltip="Clear input"
            >
              <mat-icon>clear</mat-icon>
            </button>
          </div>

          <div class="prompt-examples">
            <strong>Examples:</strong>
            <ul>
              <li>Create a contact form with name, email, message, and phone number</li>
              <li>Generate a product feedback form with rating, comments, and email</li>
              <li>Build a job application form with skills, experience, and resume upload</li>
            </ul>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
    styles: [
        `
      .prompt-input-card {
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        mat-card-content {
          padding: 2rem;
        }
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .full-width {
        width: 100%;
      }

      .input-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;

        button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }

      .prompt-examples {
        padding: 1rem;
        background-color: #f5f5f5;
        border-radius: 4px;
        font-size: 0.9rem;

        strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }

        ul {
          margin: 0;
          padding-left: 1.5rem;
          list-style: disc;

          li {
            margin: 0.25rem 0;
            color: #666;
          }
        }
      }

      @media (max-width: 768px) {
        .input-actions {
          flex-direction: column;
          width: 100%;

          button {
            width: 100%;
            justify-content: center;
          }
        }
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptInputComponent {
    @Input() isLoading = false;
    @Output() promptSubmit = new EventEmitter<string>();

    prompt = '';

    submit(): void {
        if (this.prompt.trim()) {
            this.promptSubmit.emit(this.prompt);
        }
    }

    clearPrompt(): void {
        this.prompt = '';
    }
}
