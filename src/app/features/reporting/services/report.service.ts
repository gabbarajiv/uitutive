import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import {
    ReportConfig,
    GeneratedReport,
    ReportTemplate,
    ReportContent,
    ReportSummary,
    ReportDetails,
    FieldStatistics,
    ScheduledReportExecution,
    ReportFormat,
    ReportExportOptions
} from '../models/report.model';
import { SubmissionRecord } from '../../../shared/models/submission.model';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private reportsSubject = new BehaviorSubject<ReportConfig[]>([]);
    reports$ = this.reportsSubject.asObservable();

    private generatedReportsSubject = new BehaviorSubject<GeneratedReport[]>([]);
    generatedReports$ = this.generatedReportsSubject.asObservable();

    private scheduledExecutionsSubject = new BehaviorSubject<ScheduledReportExecution[]>([]);
    scheduledExecutions$ = this.scheduledExecutionsSubject.asObservable();

    constructor() {
        this.loadReports();
    }

    // ===== Report Management =====

    /**
     * Create a new report configuration
     */
    createReportConfig(formId: string, config: Partial<ReportConfig>): Observable<ReportConfig> {
        const newConfig: ReportConfig = {
            id: uuidv4(),
            formId,
            name: config.name || 'Untitled Report',
            description: config.description,
            type: config.type || 'standard',
            template: config.template || this.getDefaultTemplate(),
            filters: config.filters,
            schedule: config.schedule,
            recipients: config.recipients,
            isActive: config.isActive !== false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const current = this.reportsSubject.value;
        this.reportsSubject.next([...current, newConfig]);
        this.saveReports();

        return of(newConfig);
    }

    /**
     * Update existing report configuration
     */
    updateReportConfig(id: string, updates: Partial<ReportConfig>): Observable<ReportConfig> {
        const current = this.reportsSubject.value;
        const index = current.findIndex(r => r.id === id);

        if (index !== -1) {
            const updated = { ...current[index], ...updates, updatedAt: new Date() };
            current[index] = updated;
            this.reportsSubject.next([...current]);
            this.saveReports();
            return of(updated);
        }

        return of();
    }

    /**
     * Delete report configuration
     */
    deleteReportConfig(id: string): Observable<boolean> {
        const current = this.reportsSubject.value;
        const filtered = current.filter(r => r.id !== id);
        this.reportsSubject.next(filtered);
        this.saveReports();
        return of(true);
    }

    /**
     * Get all report configurations
     */
    getReportConfigs(): Observable<ReportConfig[]> {
        return this.reports$;
    }

    /**
     * Get specific report configuration
     */
    getReportConfig(id: string): Observable<ReportConfig | undefined> {
        return this.reports$.pipe(
            map(reports => reports.find(r => r.id === id))
        );
    }

    /**
     * Get reports for a specific form
     */
    getReportsByForm(formId: string): Observable<ReportConfig[]> {
        return this.reports$.pipe(
            map(reports => reports.filter(r => r.formId === formId))
        );
    }

    // ===== Report Generation =====

    /**
     * Generate a report from configuration
     */
    generateReport(
        configId: string,
        submissions: SubmissionRecord[],
        format: ReportFormat = 'pdf'
    ): Observable<GeneratedReport> {
        const config = this.reportsSubject.value.find(r => r.id === configId);
        if (!config) {
            throw new Error('Report configuration not found');
        }

        const startTime = Date.now();

        // Generate content
        const content = this.generateReportContent(config, submissions);
        const generatedReport: GeneratedReport = {
            id: uuidv4(),
            configId,
            formId: config.formId,
            title: config.name,
            generatedAt: new Date(),
            content,
            format,
            fileSize: 0,
            fileUrl: `reports/${configId}/${uuidv4()}.${this.getFileExtension(format)}`,
            metadata: {
                pageCount: Math.ceil(submissions.length / 10),
                rowCount: submissions.length,
                submissionsIncluded: submissions.length,
                generationDuration: Date.now() - startTime,
                filterCount: config.filters?.length || 0,
                chartsCount: config.template.sections.filter(s => s.type === 'chart').length
            }
        };

        const current = this.generatedReportsSubject.value;
        this.generatedReportsSubject.next([...current, generatedReport]);

        return of(generatedReport);
    }

    /**
     * Generate report content
     */
    private generateReportContent(
        config: ReportConfig,
        submissions: SubmissionRecord[]
    ): ReportContent {
        const summary = this.generateReportSummary(submissions);
        const details = this.generateReportDetails(config, submissions);

        return {
            sections: config.template.sections.map(section => ({
                sectionId: section.id,
                type: section.type,
                title: section.title,
                data: this.generateSectionData(section, submissions),
                html: this.generateSectionHTML(section, submissions, config)
            })),
            summary,
            details
        };
    }

    /**
     * Generate report summary
     */
    private generateReportSummary(submissions: SubmissionRecord[]): ReportSummary {
        const statusBreakdown = {
            new: 0,
            reviewed: 0,
            archived: 0
        };

        submissions.forEach(sub => {
            const status = sub.status || 'new';
            if (status in statusBreakdown) {
                statusBreakdown[status as keyof typeof statusBreakdown]++;
            }
        });

        return {
            totalSubmissions: submissions.length,
            submissionsByStatus: statusBreakdown,
            avgCompletionRate: this.calculateCompletionRate(submissions),
            avgCompletionTime: this.calculateAvgCompletionTime(submissions),
            dateRange: {
                start: submissions.length > 0 ? new Date(submissions[0].submittedAt) : new Date(),
                end: submissions.length > 0 ? new Date(submissions[submissions.length - 1].submittedAt) : new Date()
            }
        };
    }

    /**
     * Generate report details
     */
    private generateReportDetails(
        config: ReportConfig,
        submissions: SubmissionRecord[]
    ): ReportDetails {
        const fieldBreakdown = this.generateFieldBreakdown(submissions);

        return {
            submissions: submissions.slice(0, 100), // Limit to 100 for performance
            fieldBreakdown,
            anomalies: this.detectAnomalies(submissions),
            insights: this.generateInsights(submissions)
        };
    }

    /**
     * Generate field breakdown statistics
     */
    private generateFieldBreakdown(submissions: SubmissionRecord[]): { [field: string]: FieldStatistics } {
        const breakdown: { [field: string]: FieldStatistics } = {};
        const fieldNames = new Set<string>();

        submissions.forEach(sub => {
            Object.keys(sub.data).forEach(field => fieldNames.add(field));
        });

        fieldNames.forEach(fieldName => {
            const values = submissions
                .map(sub => sub.data[fieldName])
                .filter(val => val !== null && val !== undefined);

            const uniqueValues = new Set(values);
            const valueFrequency = new Map<string, number>();
            values.forEach(val => {
                const key = String(val);
                valueFrequency.set(key, (valueFrequency.get(key) || 0) + 1);
            });

            const sorted = Array.from(valueFrequency.entries()).sort((a, b) => b[1] - a[1]);

            breakdown[fieldName] = {
                fieldName,
                fillRate: values.length / submissions.length,
                uniqueValues: uniqueValues.size,
                mostCommonValue: sorted[0]?.[0] || 'N/A',
                leastCommonValue: sorted[sorted.length - 1]?.[0] || 'N/A',
                dataType: this.inferDataType(values)
            };
        });

        return breakdown;
    }

    /**
     * Generate section data based on section type
     */
    private generateSectionData(section: any, submissions: SubmissionRecord[]): any {
        switch (section.type) {
            case 'chart':
                return this.generateChartData(section, submissions);
            case 'table':
                return this.generateTableData(section, submissions);
            case 'metric':
                return this.generateMetricData(section, submissions);
            default:
                return {};
        }
    }

    /**
     * Generate section HTML
     */
    private generateSectionHTML(
        section: any,
        submissions: SubmissionRecord[],
        config: ReportConfig
    ): string {
        const data = this.generateSectionData(section, submissions);

        switch (section.type) {
            case 'title':
                return `<h1 class="report-title">${section.content || config.name}</h1>`;
            case 'summary':
                return this.generateSummaryHTML(submissions);
            case 'chart':
                return `<div class="chart-container" id="chart-${section.id}"></div>`;
            case 'table':
                return this.generateTableHTML(data);
            case 'text':
                return `<div class="report-text">${section.content || ''}</div>`;
            case 'metric':
                return this.generateMetricHTML(data);
            case 'divider':
                return '<hr class="report-divider">';
            default:
                return '';
        }
    }

    /**
     * Generate summary HTML
     */
    private generateSummaryHTML(submissions: SubmissionRecord[]): string {
        const summary = this.generateReportSummary(submissions);
        return `
            <div class="report-summary">
                <div class="summary-item">
                    <span class="label">Total Submissions:</span>
                    <span class="value">${summary.totalSubmissions}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Completion Rate:</span>
                    <span class="value">${(summary.avgCompletionRate * 100).toFixed(1)}%</span>
                </div>
                <div class="summary-item">
                    <span class="label">Avg Completion Time:</span>
                    <span class="value">${summary.avgCompletionTime} minutes</span>
                </div>
            </div>
        `;
    }

    /**
     * Generate table HTML
     */
    private generateTableHTML(data: any): string {
        const rows = data.slice(0, 20);
        let html = '<table class="report-table"><thead><tr>';

        if (rows.length > 0) {
            Object.keys(rows[0]).forEach(key => {
                html += `<th>${key}</th>`;
            });
            html += '</tr></thead><tbody>';

            rows.forEach((row: any) => {
                html += '<tr>';
                Object.values(row).forEach(value => {
                    html += `<td>${value}</td>`;
                });
                html += '</tr>';
            });
        }

        html += '</tbody></table>';
        return html;
    }

    /**
     * Generate metric HTML
     */
    private generateMetricHTML(data: any): string {
        return `
            <div class="metric-display">
                <span class="metric-label">${data.label || 'Metric'}</span>
                <span class="metric-value">${data.value || 0}</span>
            </div>
        `;
    }

    /**
     * Generate chart data
     */
    private generateChartData(section: any, submissions: SubmissionRecord[]): any {
        // Placeholder for chart generation
        return { labels: [], datasets: [] };
    }

    /**
     * Generate table data
     */
    private generateTableData(section: any, submissions: SubmissionRecord[]): any {
        return submissions.map(sub => ({
            id: sub.id,
            status: sub.status || 'new',
            submitted: new Date(sub.submittedAt).toLocaleDateString()
        }));
    }

    /**
     * Generate metric data
     */
    private generateMetricData(section: any, submissions: SubmissionRecord[]): any {
        return {
            label: section.title,
            value: submissions.length
        };
    }

    // ===== Helper Methods =====

    /**
     * Export generated report
     */
    exportReport(reportId: string, options: ReportExportOptions): Observable<Blob> {
        const report = this.generatedReportsSubject.value.find(r => r.id === reportId);
        if (!report) {
            throw new Error('Report not found');
        }

        const content = this.formatReportForExport(report, options.format);
        const blob = new Blob([content], { type: this.getMimeType(options.format) });

        return of(blob);
    }

    /**
     * Format report for export
     */
    private formatReportForExport(report: GeneratedReport, format: ReportFormat): string {
        switch (format) {
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'csv':
                return this.convertReportToCSV(report);
            case 'pdf':
            case 'excel':
            default:
                return JSON.stringify(report);
        }
    }

    /**
     * Convert report to CSV
     */
    private convertReportToCSV(report: GeneratedReport): string {
        const headers = ['ID', 'Title', 'Generated At', 'Submissions', 'Duration'];
        const rows = [headers.join(',')];

        rows.push(
            [
                report.id,
                report.title,
                report.generatedAt.toISOString(),
                report.metadata.submissionsIncluded,
                report.metadata.generationDuration
            ].join(',')
        );

        return rows.join('\n');
    }

    /**
     * Schedule report execution
     */
    scheduleReportExecution(
        configId: string,
        recipients: string[]
    ): Observable<ScheduledReportExecution> {
        const execution: ScheduledReportExecution = {
            id: uuidv4(),
            reportConfigId: configId,
            scheduledFor: new Date(),
            status: 'pending',
            recipients
        };

        const current = this.scheduledExecutionsSubject.value;
        this.scheduledExecutionsSubject.next([...current, execution]);

        return of(execution);
    }

    /**
     * Get default template
     */
    private getDefaultTemplate(): ReportTemplate {
        return {
            name: 'Default Report Template',
            type: 'standard',
            sections: [
                { id: '1', type: 'title', content: 'Report', order: 1 },
                { id: '2', type: 'summary', order: 2 },
                { id: '3', type: 'table', order: 3 }
            ],
            includeCharts: true,
            includeSummary: true,
            includeDetails: true,
            includeMetadata: true
        };
    }

    /**
     * Detect anomalies
     */
    private detectAnomalies(submissions: SubmissionRecord[]): string[] {
        return [];
    }

    /**
     * Generate insights
     */
    private generateInsights(submissions: SubmissionRecord[]): string[] {
        const insights: string[] = [];

        if (submissions.length === 0) {
            insights.push('No submissions found');
        } else if (submissions.length < 5) {
            insights.push('Low submission volume - consider extending the date range');
        }

        return insights;
    }

    /**
     * Calculate completion rate
     */
    private calculateCompletionRate(submissions: SubmissionRecord[]): number {
        if (submissions.length === 0) return 0;

        let completed = 0;
        submissions.forEach(sub => {
            const values = Object.values(sub.data);
            const filledValues = values.filter(v => v !== null && v !== '');
            if (filledValues.length === values.length) {
                completed++;
            }
        });

        return completed / submissions.length;
    }

    /**
     * Calculate average completion time
     */
    private calculateAvgCompletionTime(submissions: SubmissionRecord[]): number {
        if (submissions.length === 0) return 0;

        let totalTime = 0;
        submissions.forEach(sub => {
            const createdAt = new Date(sub.submittedAt).getTime();
            const completedAt = new Date(sub.submittedAt).getTime();
            totalTime += (completedAt - createdAt);
        });

        return Math.round(totalTime / submissions.length / 1000 / 60);
    }

    /**
     * Infer data type
     */
    private inferDataType(values: any[]): string {
        if (values.length === 0) return 'text';

        const sample = values[0];
        if (typeof sample === 'number') return 'number';
        if (sample instanceof Date || !isNaN(Date.parse(String(sample)))) return 'date';
        return 'text';
    }

    /**
     * Get file extension
     */
    private getFileExtension(format: ReportFormat): string {
        const extensions: { [key in ReportFormat]: string } = {
            pdf: 'pdf',
            excel: 'xlsx',
            json: 'json',
            csv: 'csv'
        };
        return extensions[format];
    }

    /**
     * Get MIME type
     */
    private getMimeType(format: ReportFormat): string {
        const mimeTypes: { [key in ReportFormat]: string } = {
            pdf: 'application/pdf',
            excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            json: 'application/json',
            csv: 'text/csv'
        };
        return mimeTypes[format];
    }

    /**
     * Load reports from storage
     */
    private loadReports(): void {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('report_configs');
            if (stored) {
                try {
                    const reports = JSON.parse(stored);
                    this.reportsSubject.next(reports);
                } catch (e) {
                    console.error('Error loading reports from storage', e);
                }
            }
        }
    }

    /**
     * Save reports to storage
     */
    private saveReports(): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('report_configs', JSON.stringify(this.reportsSubject.value));
        }
    }
}

// Note: You'll need to install uuid package
// npm install uuid
// npm install --save-dev @types/uuid
