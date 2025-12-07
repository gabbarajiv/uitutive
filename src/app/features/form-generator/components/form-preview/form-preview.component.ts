import { Component, Input, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormConfig, FormField } from '../../../../shared/models/form.model';

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
        MatProgressSpinnerModule,
        MatDividerModule,
    ],
    templateUrl: './form-preview.component.html',
    styleUrl: './form-preview.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPreviewComponent implements OnInit, OnChanges {
    @Input() formConfig!: FormConfig;

    form: FormGroup;
    successMessage: string | null = null;
    isSubmitting = false;

    get hasErrors(): boolean {
        return this.form.invalid && this.form.touched;
    }

    constructor(
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private location: Location
    ) {
        this.form = this.fb.group({});
    }

    ngOnInit(): void {
        this.buildForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formConfig'] && !changes['formConfig'].firstChange) {
            this.buildForm();
            this.cdr.markForCheck();
        }
    }

    /**
     * Build form with validators based on field configuration
     */
    private buildForm(): void {
        const group: any = {};
        this.formConfig.fields.forEach((field) => {
            const validators = this.getValidators(field);
            group[field.name] = ['', validators];
        });
        this.form = this.fb.group(group);
    }

    /**
     * Get validators for a field based on configuration
     */
    private getValidators(field: FormField): any[] {
        const validators = [];

        if (field.required) {
            validators.push(Validators.required);
        }

        if (field.type === 'email') {
            validators.push(Validators.email);
        }

        if (field.minLength) {
            validators.push(Validators.minLength(field.minLength));
        }

        if (field.maxLength) {
            validators.push(Validators.maxLength(field.maxLength));
        }

        if (field.pattern) {
            validators.push(Validators.pattern(field.pattern));
        }

        return validators;
    }

    /**
     * Check if a field has an error
     */
    hasFieldError(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    /**
     * Get error message for a field
     */
    getFieldError(fieldName: string): string {
        const control = this.form.get(fieldName);
        if (!control || !control.errors) {
            return '';
        }

        const errors = control.errors;
        if (errors['required']) {
            return 'This field is required';
        }
        if (errors['email']) {
            return 'Please enter a valid email address';
        }
        if (errors['minlength']) {
            return `Minimum length is ${errors['minlength'].requiredLength}`;
        }
        if (errors['maxlength']) {
            return `Maximum length is ${errors['maxlength'].requiredLength}`;
        }
        if (errors['pattern']) {
            return 'Invalid format';
        }
        return 'Invalid value';
    }

    /**
     * Get all error messages
     */
    getErrorMessages(): string[] {
        const messages: string[] = [];
        Object.keys(this.form.controls).forEach((key) => {
            const control = this.form.get(key);
            if (control && control.invalid && (control.dirty || control.touched)) {
                const fieldLabel = this.formConfig.fields.find((f) => f.name === key)?.label || key;
                messages.push(`${fieldLabel}: ${this.getFieldError(key)}`);
            }
        });
        return messages;
    }

    /**
     * Handle form submission
     */
    onSubmit(): void {
        if (this.form.invalid) {
            this.markFormGroupTouched(this.form);
            return;
        }

        this.isSubmitting = true;
        this.cdr.markForCheck();

        // Simulate submission delay
        setTimeout(() => {
            const formData = this.form.getRawValue();
            console.log('Form submitted:', formData);
            this.successMessage = 'Form submitted successfully!';
            this.isSubmitting = false;
            this.cdr.markForCheck();

            // Hide success message after 3 seconds
            setTimeout(() => {
                this.successMessage = null;
                this.cdr.markForCheck();
            }, 3000);
        }, 500);
    }

    /**
     * Mark all form fields as touched for validation display
     */
    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            control?.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    /**
     * Navigate back to previous page
     */
    goBack(): void {
        this.location.back();
    }
}
