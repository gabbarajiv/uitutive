import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SubmissionRecord } from '../../../../shared/models/submission.model';
import { ResponseStorageService } from '../../../../shared/services/response-storage.service';

@Component({
    selector: 'app-response-detail',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatDividerModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule
    ],
    templateUrl: './response-detail.component.html',
    styleUrls: ['./response-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseDetailComponent implements OnInit, OnDestroy {
    submission!: SubmissionRecord;
    editForm!: FormGroup;
    isLoading = false;
    isEditing = false;
    isSaving = false;
    submissionId: string = '';

    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private storageService: ResponseStorageService,
        private snackBar: MatSnackBar
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadSubmission();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.editForm = this.fb.group({
            notes: ['', [Validators.maxLength(1000)]],
            status: [''],
            tags: ['']
        });
    }

    loadSubmission(): void {
        this.submissionId = this.route.snapshot.paramMap.get('id') || '';

        if (!this.submissionId) {
            this.snackBar.open('Invalid submission ID', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            this.router.navigate(['/responses']);
            return;
        }

        this.isLoading = true;
        this.storageService
            .getSubmission(this.submissionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    if (result) {
                        this.submission = result;
                        this.populateForm();
                    } else {
                        this.snackBar.open('Submission not found', 'Close', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                        this.router.navigate(['/responses']);
                    }
                    this.isLoading = false;
                },
                error: () => {
                    this.snackBar.open('Failed to load submission', 'Close', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                    this.isLoading = false;
                }
            });
    }

    private populateForm(): void {
        this.editForm.patchValue({
            notes: this.submission.notes || '',
            status: this.submission.status,
            tags: this.submission.tags ? this.submission.tags.join(', ') : ''
        });
    }

    startEdit(): void {
        this.isEditing = true;
    }

    cancelEdit(): void {
        this.isEditing = false;
        this.populateForm();
    }

    saveChanges(): void {
        if (!this.editForm.valid) return;

        this.isSaving = true;
        const formValue = this.editForm.value;
        const tags = formValue.tags
            ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '')
            : [];

        const updates = {
            notes: formValue.notes,
            status: formValue.status,
            tags
        };

        this.storageService
            .updateSubmission(this.submissionId, updates)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    this.submission = result;
                    this.isEditing = false;
                    this.isSaving = false;
                    this.snackBar.open('Submission updated', 'Close', { duration: 2000 });
                },
                error: () => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to update submission', 'Close', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
    }

    deleteSubmission(): void {
        if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            return;
        }

        this.isLoading = true;
        this.storageService
            .deleteSubmission(this.submissionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.snackBar.open('Submission deleted', 'Close', { duration: 2000 });
                    this.router.navigate(['/responses']);
                },
                error: () => {
                    this.isLoading = false;
                    this.snackBar.open('Failed to delete submission', 'Close', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                }
            });
    }

    goBack(): void {
        this.router.navigate(['/responses']);
    }

    copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text).then(() => {
            this.snackBar.open('Copied to clipboard', 'Close', { duration: 1000 });
        });
    }

    downloadAsJson(): void {
        const dataStr = JSON.stringify(this.submission, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `submission_${this.submission.id}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    getFieldValue(data: Record<string, any>, key: string): any {
        return data[key];
    }

    isComplexValue(value: any): boolean {
        return typeof value === 'object' && value !== null;
    }
}
