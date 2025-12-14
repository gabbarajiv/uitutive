import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PublicFormService } from '../../services/public-form.service';
import { FormField } from '../../../../shared/models/form.model';

@Component({
    selector: 'app-form-submission',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatSelectModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatRadioModule
    ],
    templateUrl: './form-submission.component.html',
    styleUrls: ['./form-submission.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSubmissionComponent implements OnInit, OnDestroy {
    formLink: string = '';
    form!: FormGroup;
    formFields: FormField[] = [];
    isLoading = false;
    isSubmitting = false;
    formTitle = '';
    formDescription = '';

    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private publicFormService: PublicFormService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
            this.formLink = params['link'];
            if (this.formLink) {
                this.loadForm();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadForm(): void {
        this.isLoading = true;
        this.publicFormService
            .getFormByLink(this.formLink)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.formTitle = response.data.title;
                        this.formDescription = response.data.description || '';
                        this.formFields = response.data.fields || [];
                        this.buildForm();
                    }
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Failed to load form:', error);
                    this.snackBar.open(
                        'Form not found or is no longer public',
                        'Close',
                        { duration: 5000 }
                    );
                    this.isLoading = false;
                    this.router.navigate(['/']);
                }
            });
    }

    buildForm(): void {
        const formControls: any = {};

        this.formFields.forEach(field => {
            const validators = [];

            if (field.required) {
                validators.push(Validators.required);
            }

            if (field.type === 'email') {
                validators.push(Validators.email);
            }

            if (field.type === 'number') {
                validators.push(Validators.pattern(/^[0-9]*$/));
            }

            formControls[field.id] = ['', validators];
        });

        this.form = this.fb.group(formControls);
    }

    submitForm(): void {
        if (!this.form.valid) {
            this.snackBar.open('Please fill in all required fields', 'Close', { duration: 5000 });
            return;
        }

        this.isSubmitting = true;
        const formData = this.form.getRawValue();

        this.publicFormService
            .submitForm(this.formLink, formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.snackBar.open('Form submitted successfully!', 'Close', {
                            duration: 3000
                        });
                        this.router.navigate(['/submit', this.formLink, 'success']);
                    }
                    this.isSubmitting = false;
                },
                error: (error) => {
                    console.error('Failed to submit form:', error);
                    const errorMessage =
                        error.error?.error || 'Failed to submit form. Please try again.';
                    this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
                    this.isSubmitting = false;
                }
            });
    }

    getFieldLabel(field: FormField): string {
        return field.required ? `${field.label} *` : field.label;
    }

    isFieldRequired(field: FormField): boolean {
        return field.required ?? false;
    }

    isTextArea(field: FormField): boolean {
        return field.type === 'textarea';
    }

    isSelect(field: FormField): boolean {
        return field.type === 'select';
    }

    isCheckbox(field: FormField): boolean {
        return field.type === 'checkbox';
    }

    isRadio(field: FormField): boolean {
        return field.type === 'radio';
    }

    isDate(field: FormField): boolean {
        return field.type === 'date';
    }

    isFile(field: FormField): boolean {
        return field.type === 'file';
    }
}
