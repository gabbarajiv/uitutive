import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormConfig } from '../../../../shared/models/form.model';

@Component({
    selector: 'app-form-preview',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
    ],
    template: `
    <div class="form-preview">
      <div class="form-header">
        <h3>{{ formConfig.title }}</h3>
        <p *ngIf="formConfig.description" class="form-description">{{ formConfig.description }}</p>
      </div>

      <form [formGroup]="form" class="preview-form">
        <div *ngFor="let field of formConfig.fields" class="form-field-wrapper" [class.hidden]="field.hidden">
          <!-- Text Input -->
          <mat-form-field *ngIf="field.type === 'text'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput [formControlName]="field.name" [placeholder]="field.placeholder || ''" />
            <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
          </mat-form-field>

          <!-- Email Input -->
          <mat-form-field *ngIf="field.type === 'email'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput type="email" [formControlName]="field.name" [placeholder]="field.placeholder || ''" />
            <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
          </mat-form-field>

          <!-- Password Input -->
          <mat-form-field *ngIf="field.type === 'password'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput type="password" [formControlName]="field.name" [placeholder]="field.placeholder || ''" />
            <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
          </mat-form-field>

          <!-- Number Input -->
          <mat-form-field *ngIf="field.type === 'number'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput type="number" [formControlName]="field.name" [placeholder]="field.placeholder || ''" />
            <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
          </mat-form-field>

          <!-- Date Input -->
          <mat-form-field *ngIf="field.type === 'date'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput [matDatepicker]="picker" [formControlName]="field.name" />
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
          </mat-form-field>

          <!-- Textarea -->
          <mat-form-field *ngIf="field.type === 'textarea'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <textarea matInput [formControlName]="field.name" [rows]="field.rows || 4" [placeholder]="field.placeholder || ''"></textarea>
            <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
          </mat-form-field>

          <!-- Select -->
          <mat-form-field *ngIf="field.type === 'select'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <mat-select [formControlName]="field.name">
              <mat-option value="">-- Select --</mat-option>
              <mat-option *ngFor="let option of field.options" [value]="option.value">
                {{ option.label }}
              </mat-option>
            </mat-select>
            <mat-hint *ngIf="field.description">{{ field.description }}</mat-hint>
          </mat-form-field>

          <!-- Checkbox -->
          <div *ngIf="field.type === 'checkbox'" class="checkbox-wrapper">
            <mat-checkbox [formControlName]="field.name">
              {{ field.label }}
            </mat-checkbox>
            <p *ngIf="field.description" class="field-description">{{ field.description }}</p>
          </div>

          <!-- Radio -->
          <div *ngIf="field.type === 'radio'" class="radio-wrapper">
            <label>{{ field.label }}</label>
            <mat-radio-group [formControlName]="field.name">
              <mat-radio-button *ngFor="let option of field.options" [value]="option.value">
                {{ option.label }}
              </mat-radio-button>
            </mat-radio-group>
            <p *ngIf="field.description" class="field-description">{{ field.description }}</p>
          </div>

          <!-- File Input -->
          <div *ngIf="field.type === 'file'" class="file-input-wrapper">
            <label for="file_{{ field.id }}">{{ field.label }}</label>
            <input type="file" [id]="'file_' + field.id" [formControlName]="field.name" />
            <p *ngIf="field.description" class="field-description">{{ field.description }}</p>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" mat-raised-button color="primary">Submit</button>
          <button type="reset" mat-stroked-button>Reset</button>
        </div>
      </form>
    </div>
  `,
    styles: [
        `
      .form-preview {
        padding: 2rem;
        background: white;
        border-radius: 8px;

        .form-header {
          margin-bottom: 2rem;

          h3 {
            margin: 0 0 0.5rem 0;
            color: #1976d2;
            font-size: 1.5rem;
          }

          .form-description {
            margin: 0;
            color: #666;
            font-size: 0.95rem;
          }
        }

        .preview-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-field-wrapper {
          &.hidden {
            display: none;
          }
        }

        .full-width {
          width: 100%;
        }

        .checkbox-wrapper,
        .radio-wrapper,
        .file-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          label {
            font-weight: 500;
            color: #333;
          }

          .field-description {
            margin: 0;
            font-size: 0.85rem;
            color: #999;
          }
        }

        .radio-wrapper {
          mat-radio-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;

          button {
            flex: 1;
          }
        }
      }

      @media (max-width: 768px) {
        .form-preview {
          padding: 1rem;

          .form-actions {
            flex-direction: column;

            button {
              width: 100%;
            }
          }
        }
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPreviewComponent {
    @Input() formConfig!: FormConfig;

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({});
    }

    ngOnInit(): void {
        this.buildForm();
    }

    private buildForm(): void {
        const group: any = {};
        this.formConfig.fields.forEach((field) => {
            group[field.name] = ['', field.required ? [] : []];
        });
        this.form = this.fb.group(group);
    }
}
