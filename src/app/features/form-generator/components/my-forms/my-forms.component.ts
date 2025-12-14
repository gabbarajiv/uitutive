import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FormService } from '../../../../shared/services/form.service';
import { FormConfig } from '../../../../shared/models/form.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
    selector: 'app-my-forms',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule,
        MatMenuModule,
        MatDividerModule,
        MatChipsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTooltipModule,
        PageHeaderComponent,
    ],
    templateUrl: './my-forms.component.html',
    styleUrl: './my-forms.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyFormsComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['name', 'description', 'fieldCount', 'createdAt', 'actions'];
    dataSource: FormConfig[] = [];
    isLoading = false;
    pageSize = 10;
    pageIndex = 0;
    totalCount = 0;
    sortField = 'name';
    sortOrder: 'asc' | 'desc' = 'asc';

    private destroy$ = new Subject<void>();

    constructor(
        private formService: FormService,
        private router: Router,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadForms();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Load all forms from the service
     */
    loadForms(): void {
        this.isLoading = true;
        this.cdr.markForCheck();

        this.formService.forms$
            .pipe(takeUntil(this.destroy$))
            .subscribe((forms) => {
                this.dataSource = this.sortAndPaginateForms(forms);
                this.totalCount = forms.length;
                this.isLoading = false;
                this.cdr.markForCheck();
            });
    }

    /**
     * Sort and paginate forms
     */
    private sortAndPaginateForms(forms: FormConfig[]): FormConfig[] {
        // Sort forms
        let sortedForms = [...forms].sort((a, b) => {
            let aVal: any = a[this.sortField as keyof FormConfig];
            let bVal: any = b[this.sortField as keyof FormConfig];

            // Handle date comparison
            if (this.sortField === 'createdAt' || this.sortField === 'updatedAt') {
                aVal = new Date(aVal as any).getTime();
                bVal = new Date(bVal as any).getTime();
            }

            if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        // Paginate
        const start = this.pageIndex * this.pageSize;
        return sortedForms.slice(start, start + this.pageSize);
    }

    /**
     * Handle page change event
     */
    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadForms();
    }

    /**
     * Handle sort change event
     */
    onSortChange(sort: Sort): void {
        if (sort.active) {
            this.sortField = sort.active;
            this.sortOrder = sort.direction as 'asc' | 'desc' || 'asc';
            this.pageIndex = 0;
            this.loadForms();
        }
    }

    /**
     * View form details (preview the form)
     */
    viewForm(form: FormConfig): void {
        this.formService.setCurrentForm(form.id);
        this.router.navigate(['/form-generator'], { queryParams: { formId: form.id, mode: 'view' } });
    }

    /**
     * Edit a form
     */
    editForm(form: FormConfig): void {
        this.formService.setCurrentForm(form.id);
        this.router.navigate(['/form-generator'], { queryParams: { formId: form.id, mode: 'edit' } });
    }

    /**
     * Delete a form
     */
    deleteForm(form: FormConfig): void {
        const confirmed = confirm(
            `Are you sure you want to delete the form "${form.name}"? This action cannot be undone.`
        );
        if (confirmed) {
            this.formService.deleteForm(form.id);
            this.snackBar.open('Form deleted successfully', 'Close', { duration: 3000 });
            this.loadForms();
        }
    }

    /**
     * Duplicate a form
     */
    duplicateForm(form: FormConfig): void {
        const duplicatedForm: FormConfig = {
            ...form,
            id: `${form.id}-copy-${Date.now()}`,
            name: `${form.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.formService.createForm(duplicatedForm);
        this.snackBar.open('Form duplicated successfully', 'Close', { duration: 3000 });
        this.loadForms();
    }

    /**
     * Export form as JSON
     */
    exportForm(form: FormConfig): void {
        const dataStr = JSON.stringify(form, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${form.name.replace(/\s+/g, '-')}-${form.id}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        this.snackBar.open('Form exported successfully', 'Close', { duration: 3000 });
    }

    /**
     * Get field count for a form
     */
    getFieldCount(form: FormConfig): number {
        return form.fields?.length || 0;
    }

    /**
     * Format date for display
     */
    formatDate(date: Date | string): string {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    /**
     * Create a new form (navigate to form generator)
     */
    createNewForm(): void {
        this.router.navigate(['/form-generator']);
    }

    /**
     * Generate shareable link for a form
     */
    generateShareableLink(form: FormConfig): void {
        this.isLoading = true;
        this.cdr.markForCheck();

        this.formService.generateShareableLink(form.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: any) => {
                    if (response.success && response.data) {
                        const shareableLink = response.data.shareableLink;
                        const publicUrl = `${window.location.origin}/submit/${shareableLink}`;

                        // Copy to clipboard
                        navigator.clipboard.writeText(publicUrl).then(() => {
                            this.snackBar.open('Public link copied to clipboard!', 'Close', { duration: 3000 });
                        }).catch(() => {
                            this.snackBar.open(`Public link: ${publicUrl}`, 'Copy', { duration: 5000 });
                        });

                        // Update the form in the list
                        const updatedForm = { ...form, shareableLink, isPublic: true };
                        const index = this.dataSource.findIndex(f => f.id === form.id);
                        if (index !== -1) {
                            this.dataSource[index] = updatedForm;
                            this.cdr.markForCheck();
                        }
                    } else {
                        console.warn('Unexpected response format:', response);
                        this.snackBar.open('Unexpected response from server', 'Close', { duration: 3000 });
                    }
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Failed to generate link:', error);
                    const errorMessage = error?.error?.error || error?.message || 'Failed to generate public link';
                    this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    /**
     * Remove shareable link for a form
     */
    removeShareableLink(form: FormConfig): void {
        const confirmed = confirm(
            'Are you sure you want to remove the public link? This will disable public access to this form.'
        );
        if (!confirmed) return;

        this.isLoading = true;
        this.cdr.markForCheck();

        this.formService.removeShareableLink(form.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.snackBar.open('Public link removed', 'Close', { duration: 3000 });

                    // Update the form in the list
                    const updatedForm = { ...form, shareableLink: undefined, isPublic: false };
                    const index = this.dataSource.findIndex(f => f.id === form.id);
                    if (index !== -1) {
                        this.dataSource[index] = updatedForm;
                        this.cdr.markForCheck();
                    }
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Failed to remove link:', error);
                    this.snackBar.open('Failed to remove public link', 'Close', { duration: 3000 });
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    /**
     * Copy public link to clipboard
     */
    copyPublicLink(form: FormConfig): void {
        if (!form.shareableLink) return;

        const publicUrl = `${window.location.origin}/submit/${form.shareableLink}`;
        navigator.clipboard.writeText(publicUrl).then(() => {
            this.snackBar.open('Public link copied to clipboard!', 'Close', { duration: 3000 });
        }).catch(() => {
            this.snackBar.open('Failed to copy link', 'Close', { duration: 3000 });
        });
    }

    /**
     * Check if form has a shareable link
     */
    hasShareableLink(form: FormConfig): boolean {
        return !!(form as any).shareableLink;
    }
}
