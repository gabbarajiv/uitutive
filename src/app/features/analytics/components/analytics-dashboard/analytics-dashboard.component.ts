import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SubmissionRecord } from '../../../../shared/models/submission.model';
import { ResponseStorageService } from '../../../../shared/services/response-storage.service';
import {
    AnalyticsService,
    AnalyticsMetrics,
    FieldAnalytics,
    SubmissionTimeline
} from '../../../../shared/services/analytics.service';

@Component({
    selector: 'app-analytics-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatProgressBarModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatSelectModule,
        MatFormFieldModule,
        MatTableModule
    ],
    templateUrl: './analytics-dashboard.component.html',
    styleUrls: ['./analytics-dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
    isLoading = false;
    submissions: SubmissionRecord[] = [];
    metrics!: AnalyticsMetrics;
    timeline!: SubmissionTimeline;
    summaryStats: any;
    fieldAnalytics: Map<string, FieldAnalytics> = new Map();
    displayedColumns: string[] = ['fieldName', 'fillRate', 'filledCount', 'uniqueValues'];

    filterForm!: FormGroup;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private storageService: ResponseStorageService,
        private analyticsService: AnalyticsService,
        private snackBar: MatSnackBar
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.loadAnalytics();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.filterForm = this.fb.group({
            days: [30]
        });
    }

    loadAnalytics(): void {
        this.isLoading = true;
        this.storageService
            .getSubmissionsStream()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (submissions) => {
                    this.submissions = submissions;
                    this.calculateAnalytics();
                    this.isLoading = false;
                },
                error: () => {
                    this.snackBar.open('Failed to load analytics', 'Close', {
                        duration: 3000,
                        panelClass: ['error-snackbar']
                    });
                    this.isLoading = false;
                }
            });
    }

    private calculateAnalytics(): void {
        if (this.submissions.length === 0) {
            this.snackBar.open('No submissions found', 'Close', { duration: 2000 });
            return;
        }

        this.metrics = this.analyticsService.calculateMetrics(this.submissions);
        this.timeline = this.analyticsService.generateTimeline(this.submissions);
        this.summaryStats = this.analyticsService.getSummaryStats(this.submissions);

        // Calculate field analytics
        this.fieldAnalytics.clear();
        const fieldNames = new Set<string>();
        this.submissions.forEach(sub => {
            Object.keys(sub.data).forEach(key => fieldNames.add(key));
        });

        fieldNames.forEach(fieldName => {
            const analysis = this.analyticsService.analyzeField(
                this.submissions,
                fieldName
            );
            this.fieldAnalytics.set(fieldName, analysis);
        });
    }

    onFilterChange(): void {
        this.calculateAnalytics();
    }

    getStatusPercentage(status: 'new' | 'reviewed' | 'archived'): number {
        if (this.metrics.totalSubmissions === 0) return 0;

        switch (status) {
            case 'new':
                return (this.metrics.newSubmissions / this.metrics.totalSubmissions) * 100;
            case 'reviewed':
                return (
                    (this.metrics.reviewedSubmissions / this.metrics.totalSubmissions) * 100
                );
            case 'archived':
                return (
                    (this.metrics.archivedSubmissions / this.metrics.totalSubmissions) * 100
                );
        }
    }

    exportAnalytics(): void {
        const data = {
            exportDate: new Date().toISOString(),
            metrics: this.metrics,
            timeline: this.timeline,
            summaryStats: this.summaryStats,
            fieldAnalytics: Array.from(this.fieldAnalytics.entries()).map(([name, analysis]) => ({
                name,
                ...analysis
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_${new Date().getTime()}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.snackBar.open('Analytics exported', 'Close', { duration: 2000 });
    }

    getFieldAnalyticsArray(): FieldAnalytics[] {
        return Array.from(this.fieldAnalytics.values());
    }
}
