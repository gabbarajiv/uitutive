import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

import {
    SubmissionRecord,
    SubmissionFilter,
    SubmissionSort,
    PaginatedSubmissions
} from '../../../../shared/models/submission.model';
import { ResponseStorageService } from '../../../../shared/services/response-storage.service';

@Component({
    selector: 'app-response-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatDialogModule,
        MatMenuModule,
        MatDividerModule,
        PageHeaderComponent
    ],
    templateUrl: './response-list.component.html',
    styleUrls: ['./response-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseListComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['select', 'id', 'status', 'submittedAt', 'actions'];

    filterForm!: FormGroup;
    submissions: SubmissionRecord[] = [];
    isLoading = false;
    pageSize = 10;
    pageIndex = 0;
    totalCount = 0;
    selectedRows = new Set<string>();

    currentSort: SubmissionSort = {
        field: 'submittedAt',
        order: 'desc'
    };

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private storageService: ResponseStorageService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadSubmissions();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.filterForm = this.fb.group({
            status: [''],
            searchTerm: [''],
            dateFrom: [null],
            dateTo: [null],
            tags: [[]]
        });
    }

    loadSubmissions(): void {
        this.isLoading = true;
        const filter = this.buildFilter();

        this.storageService
            .getSubmissions(filter, this.currentSort, this.pageIndex + 1, this.pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: PaginatedSubmissions) => {
                    this.submissions = response.items;
                    this.totalCount = response.total;
                    this.isLoading = false;
                },
                error: (error: any) => {
                    this.snackBar.open('Failed to load submissions', 'Close', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                    this.isLoading = false;
                }
            });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadSubmissions();
    }

    onSortChange(sort: Sort): void {
        if (sort.active && sort.direction) {
            this.currentSort = {
                field: sort.active as 'submittedAt' | 'status' | 'id',
                order: sort.direction as 'asc' | 'desc'
            };
            this.pageIndex = 0;
            this.loadSubmissions();
        }
    }

    onFilterChange(): void {
        this.pageIndex = 0;
        this.loadSubmissions();
    }

    toggleRowSelection(id: string): void {
        if (this.selectedRows.has(id)) {
            this.selectedRows.delete(id);
        } else {
            this.selectedRows.add(id);
        }
    }

    toggleSelectAll(): void {
        if (this.selectedRows.size === this.submissions.length) {
            this.selectedRows.clear();
        } else {
            this.submissions.forEach(sub => this.selectedRows.add(sub.id));
        }
    }

    isRowSelected(id: string): boolean {
        return this.selectedRows.has(id);
    }

    isAllSelected(): boolean {
        return this.selectedRows.size === this.submissions.length && this.submissions.length > 0;
    }

    viewSubmission(id: string): void {
        // TODO: Navigate to response detail view
        console.log('View submission:', id);
    }

    editSubmission(id: string): void {
        // TODO: Navigate to response editor
        console.log('Edit submission:', id);
    }

    deleteSubmission(id: string): void {
        if (confirm('Are you sure you want to delete this submission?')) {
            this.storageService
                .deleteSubmission(id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.snackBar.open('Submission deleted', 'Close', { duration: 2000 });
                        this.loadSubmissions();
                    },
                    error: () => {
                        this.snackBar.open('Failed to delete submission', 'Close', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
        }
    }

    bulkDelete(): void {
        if (this.selectedRows.size === 0) {
            this.snackBar.open('No submissions selected', 'Close', { duration: 2000 });
            return;
        }

        if (confirm(`Delete ${this.selectedRows.size} submissions?`)) {
            const ids = Array.from(this.selectedRows);
            this.storageService
                .deleteSubmissions(ids)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.snackBar.open(
                            `${ids.length} submissions deleted`,
                            'Close',
                            { duration: 2000 }
                        );
                        this.selectedRows.clear();
                        this.loadSubmissions();
                    },
                    error: () => {
                        this.snackBar.open('Failed to delete submissions', 'Close', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
        }
    }

    bulkUpdateStatus(status: 'new' | 'reviewed' | 'archived'): void {
        if (this.selectedRows.size === 0) {
            this.snackBar.open('No submissions selected', 'Close', { duration: 2000 });
            return;
        }

        const ids = Array.from(this.selectedRows);
        let completed = 0;
        let failed = 0;

        ids.forEach(id => {
            this.storageService
                .updateStatus(id, status)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        completed++;
                        if (completed + failed === ids.length) {
                            this.loadSubmissions();
                            this.selectedRows.clear();
                            this.snackBar.open(
                                `${completed} updated${failed > 0 ? `, ${failed} failed` : ''}`,
                                'Close',
                                { duration: 2000 }
                            );
                        }
                    },
                    error: () => {
                        failed++;
                    }
                });
        });
    }

    exportSelected(format: 'json' | 'csv'): void {
        if (this.selectedRows.size === 0) {
            this.snackBar.open('No submissions selected', 'Close', { duration: 2000 });
            return;
        }

        const selected = this.submissions.filter(s => this.selectedRows.has(s.id));
        const content =
            format === 'json'
                ? this.storageService.exportAsJson(selected)
                : this.storageService.exportAsCsv(selected);

        const blob = new Blob([content], {
            type: format === 'json' ? 'application/json' : 'text/csv'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `submissions.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.snackBar.open(`Exported ${selected.length} submissions`, 'Close', {
            duration: 2000
        });
    }

    clearFilters(): void {
        this.filterForm.reset();
        this.pageIndex = 0;
        this.loadSubmissions();
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'new':
                return 'primary';
            case 'reviewed':
                return 'accent';
            case 'archived':
                return 'warn';
            default:
                return '';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'new':
                return 'fiber_new';
            case 'reviewed':
                return 'check_circle';
            case 'archived':
                return 'archive';
            default:
                return 'info';
        }
    }

    private buildFilter(): SubmissionFilter | undefined {
        const formValue = this.filterForm.value;

        if (
            !formValue.status &&
            !formValue.searchTerm &&
            !formValue.dateFrom &&
            !formValue.dateTo &&
            (!formValue.tags || formValue.tags.length === 0)
        ) {
            return undefined;
        }

        const filter: SubmissionFilter = {};

        if (formValue.status) {
            filter.status = formValue.status;
        }
        if (formValue.searchTerm) {
            filter.searchTerm = formValue.searchTerm;
        }
        if (formValue.dateFrom) {
            filter.dateFrom = new Date(formValue.dateFrom);
        }
        if (formValue.dateTo) {
            filter.dateTo = new Date(formValue.dateTo);
        }
        if (formValue.tags?.length) {
            filter.tags = formValue.tags;
        }

        return Object.keys(filter).length > 0 ? filter : undefined;
    }
}
