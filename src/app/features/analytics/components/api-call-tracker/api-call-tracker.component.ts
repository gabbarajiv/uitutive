import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
    ApiCallRecord,
    ApiCallMetrics,
    ModelAnalytics
} from '../../models/api-tracking.model';
import { ApiTrackingService } from '../../services/api-tracking.service';

@Component({
    selector: 'app-api-call-tracker',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSelectModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatDividerModule
    ],
    templateUrl: './api-call-tracker.component.html',
    styleUrls: ['./api-call-tracker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiCallTrackerComponent implements OnInit, OnDestroy {
    // Data
    apiCalls: ApiCallRecord[] = [];
    modelAnalytics: ModelAnalytics[] = [];
    summaryMetrics: ApiCallMetrics | null = null;
    selectedModelAnalytics: ModelAnalytics | null = null;

    // Loading states
    isLoadingCalls = false;
    isLoadingModels = false;
    isSummaryLoading = false;
    isModelDetailLoading = false;

    // Pagination
    pageSize = 25;
    pageIndex = 0;
    totalCalls = 0;

    // Forms
    filterForm: FormGroup;

    // Table columns
    callsDisplayColumns: string[] = [
        'timestamp',
        'endpoint',
        'method',
        'model',
        'status_code',
        'response_time_ms',
        'request_size',
        'response_size'
    ];

    modelsDisplayColumns: string[] = [
        'model',
        'total_calls',
        'successful_calls',
        'failed_calls',
        'average_response_time_ms',
        'success_rate',
        'last_call'
    ];

    // Subjects
    private destroy$ = new Subject<void>();
    private filterChanged$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private apiTrackingService: ApiTrackingService
    ) {
        this.filterForm = this.fb.group({
            model: [''],
            service: [''],
            endpoint: [''],
            status_code: [''],
            startDate: [''],
            endDate: ['']
        });
    }

    ngOnInit(): void {
        this.loadInitialData();
        this.setupFilterListener();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadInitialData(): void {
        this.loadSummary();
        this.loadModelAnalytics();
        this.loadApiCalls();
    }

    private setupFilterListener(): void {
        this.filterChanged$
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.pageIndex = 0;
                this.loadApiCalls();
            });
    }

    private loadApiCalls(): void {
        this.isLoadingCalls = true;

        const filters = {
            model: this.filterForm.get('model')?.value || undefined,
            service: this.filterForm.get('service')?.value || undefined,
            endpoint: this.filterForm.get('endpoint')?.value || undefined,
            status_code: this.filterForm.get('status_code')?.value
                ? parseInt(this.filterForm.get('status_code')!.value)
                : undefined,
            startDate: this.filterForm.get('startDate')?.value
                ? new Date(this.filterForm.get('startDate')!.value)
                : undefined,
            endDate: this.filterForm.get('endDate')?.value
                ? new Date(this.filterForm.get('endDate')!.value)
                : undefined
        };

        this.apiTrackingService
            .getApiCalls(this.pageSize, this.pageIndex * this.pageSize, filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: result => {
                    this.apiCalls = result.calls;
                    this.totalCalls = result.total;
                    this.isLoadingCalls = false;
                },
                error: error => {
                    console.error('Error loading API calls:', error);
                    this.isLoadingCalls = false;
                }
            });
    }

    private loadSummary(): void {
        this.isSummaryLoading = true;

        const startDate = this.filterForm.get('startDate')?.value
            ? new Date(this.filterForm.get('startDate')!.value)
            : undefined;
        const endDate = this.filterForm.get('endDate')?.value
            ? new Date(this.filterForm.get('endDate')!.value)
            : undefined;

        this.apiTrackingService
            .getSummary(startDate, endDate)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: metrics => {
                    this.summaryMetrics = metrics;
                    this.isSummaryLoading = false;
                },
                error: error => {
                    console.error('Error loading summary:', error);
                    this.isSummaryLoading = false;
                }
            });
    }

    private loadModelAnalytics(): void {
        this.isLoadingModels = true;

        this.apiTrackingService
            .getModelAnalytics()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: analytics => {
                    this.modelAnalytics = analytics;
                    this.isLoadingModels = false;
                },
                error: error => {
                    console.error('Error loading model analytics:', error);
                    this.isLoadingModels = false;
                }
            });
    }

    onFilterChange(): void {
        this.filterChanged$.next();
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadApiCalls();
    }

    onModelSelect(model: ModelAnalytics): void {
        this.selectedModelAnalytics = model;
    }

    onRefresh(): void {
        this.loadInitialData();
    }

    onClearFilters(): void {
        this.filterForm.reset();
        this.pageIndex = 0;
        this.loadApiCalls();
    }

    formatDate(date: Date | string): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString();
    }

    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    getStatusClass(statusCode: number): string {
        if (statusCode >= 200 && statusCode < 300) {
            return 'success';
        } else if (statusCode >= 400 && statusCode < 500) {
            return 'warning';
        } else if (statusCode >= 500) {
            return 'error';
        }
        return 'info';
    }
}
