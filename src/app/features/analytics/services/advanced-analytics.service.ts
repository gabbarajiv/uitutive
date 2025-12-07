import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SubmissionRecord } from '../../../shared/models/submission.model';
import {
    ChartConfig,
    ChartData,
    ChartDataset,
    ChartMetadata,
    ComparisonChartData,
    DataUnit,
    LineChartConfig,
    BarChartConfig,
    PieChartConfig,
    ChartFilter
} from '../models/chart.model';

export interface AdvancedMetrics {
    submissionTrend: number[];
    completionRate: number;
    averageCompletionTime: number;
    peakSubmissionTime: string;
    fieldAbandonmentRates: Map<string, number>;
    deviceBreakdown: Map<string, number>;
    statusDistribution: { [key: string]: number };
    anomalies: string[];
}

export interface InsightData {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation?: string;
    dataPoints?: number[];
}

@Injectable({
    providedIn: 'root'
})
export class AdvancedAnalyticsService {
    private chartsSubject = new BehaviorSubject<ChartConfig[]>([]);
    charts$ = this.chartsSubject.asObservable();

    constructor() { }

    /**
     * Generate line chart data for submission trends over time
     */
    generateLineChartData(
        submissions: SubmissionRecord[],
        groupBy: 'day' | 'week' | 'month' | 'year' = 'day'
    ): ChartData {
        const groupedData = this.groupSubmissionsByTime(submissions, groupBy);
        const labels = Array.from(groupedData.keys());
        const data = Array.from(groupedData.values());

        const metadata = this.calculateMetadata(data);

        return {
            labels,
            datasets: [
                {
                    label: 'Submissions',
                    data,
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#1976d2'
                }
            ],
            metadata
        };
    }

    /**
     * Generate bar chart data for field value distribution
     */
    generateBarChartData(
        submissions: SubmissionRecord[],
        fieldName: string
    ): ChartData {
        const fieldValues = new Map<string, number>();
        let totalCount = 0;

        submissions.forEach(sub => {
            const value = sub.data[fieldName];
            if (value !== undefined && value !== null) {
                const key = String(value);
                fieldValues.set(key, (fieldValues.get(key) || 0) + 1);
                totalCount++;
            }
        });

        const labels = Array.from(fieldValues.keys()).slice(0, 20); // Limit to top 20
        const data = labels.map(label => fieldValues.get(label) || 0);
        const metadata = this.calculateMetadata(data);

        return {
            labels,
            datasets: [
                {
                    label: `${fieldName} Distribution`,
                    data,
                    backgroundColor: this.generateGradientColors(labels.length),
                    borderColor: '#1976d2',
                    borderWidth: 1
                }
            ],
            metadata
        };
    }

    /**
     * Generate pie chart data for status breakdown
     */
    generatePieChartData(submissions: SubmissionRecord[]): ChartData {
        const statusCounts = {
            new: 0,
            reviewed: 0,
            archived: 0
        };

        submissions.forEach(sub => {
            if (sub.status) {
                statusCounts[sub.status as keyof typeof statusCounts]++;
            }
        });

        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);

        return {
            labels,
            datasets: [
                {
                    label: 'Status Distribution',
                    data,
                    backgroundColor: ['#4caf50', '#2196f3', '#f44336'],
                    borderColor: '#fff',
                    borderWidth: 2
                }
            ]
        };
    }

    /**
     * Compare metrics between two time periods
     */
    compareMetrics(
        submissions: SubmissionRecord[],
        period1Start: Date,
        period1End: Date,
        period2Start: Date,
        period2End: Date
    ): ComparisonChartData {
        const period1Subs = this.filterByDateRange(submissions, period1Start, period1End);
        const period2Subs = this.filterByDateRange(submissions, period2Start, period2End);

        const period1Data = this.generateLineChartData(period1Subs);
        const period2Data = this.generateLineChartData(period2Subs);

        const period1Total = period1Subs.length;
        const period2Total = period2Subs.length;
        const percentageChange = ((period2Total - period1Total) / period1Total) * 100;
        const trend = percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'stable';

        return {
            period1: period1Data,
            period2: period2Data,
            percentageChange,
            trend
        };
    }

    /**
     * Detect anomalies in submission data
     */
    detectAnomalies(submissions: SubmissionRecord[]): string[] {
        const anomalies: string[] = [];
        const submissionCounts = this.groupSubmissionsByTime(submissions, 'day');
        const counts = Array.from(submissionCounts.values());

        if (counts.length === 0) return anomalies;

        const average = counts.reduce((a, b) => a + b, 0) / counts.length;
        const stdDev = Math.sqrt(
            counts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / counts.length
        );

        counts.forEach((count, index) => {
            if (Math.abs(count - average) > 2 * stdDev) {
                const date = Array.from(submissionCounts.keys())[index];
                anomalies.push(
                    `Unusual activity on ${date}: ${count} submissions (avg: ${average.toFixed(1)})`
                );
            }
        });

        return anomalies;
    }

    /**
     * Generate AI insights from submission data
     */
    generateInsights(submissions: SubmissionRecord[]): InsightData[] {
        const insights: InsightData[] = [];

        if (submissions.length === 0) {
            return insights;
        }

        // Insight 1: Completion rate
        const completionRate = this.calculateCompletionRate(submissions);
        if (completionRate < 0.7) {
            insights.push({
                title: 'Low Completion Rate',
                description: `Only ${(completionRate * 100).toFixed(1)}% of forms are completed. Consider simplifying the form or improving instructions.`,
                impact: 'high',
                recommendation: 'Review form fields and instructions for clarity'
            });
        }

        // Insight 2: Anomalies
        const anomalies = this.detectAnomalies(submissions);
        if (anomalies.length > 0) {
            insights.push({
                title: 'Unusual Submission Patterns',
                description: `Detected ${anomalies.length} anomalies in submission activity.`,
                impact: 'medium',
                dataPoints: [anomalies.length]
            });
        }

        // Insight 3: Peak times
        const peakTime = this.calculatePeakSubmissionTime(submissions);
        insights.push({
            title: 'Peak Submission Time',
            description: `Most submissions occur at ${peakTime}. Consider scheduling important updates or maintenance outside this window.`,
            impact: 'low'
        });

        // Insight 4: Field abandonment
        const abandonmentRates = this.calculateFieldAbandonment(submissions);
        const mostAbandoned = Array.from(abandonmentRates.entries())
            .sort((a, b) => b[1] - a[1])[0];

        if (mostAbandoned && mostAbandoned[1] > 0.3) {
            insights.push({
                title: 'High Field Abandonment',
                description: `Field "${mostAbandoned[0]}" has ${(mostAbandoned[1] * 100).toFixed(1)}% abandonment rate. This field may be confusing or optional.`,
                impact: 'medium',
                recommendation: `Review or reposition the "${mostAbandoned[0]}" field`
            });
        }

        return insights;
    }

    /**
     * Calculate advanced metrics
     */
    calculateAdvancedMetrics(submissions: SubmissionRecord[]): AdvancedMetrics {
        const submissionsByDay = this.groupSubmissionsByTime(submissions, 'day');
        const trend = Array.from(submissionsByDay.values());

        return {
            submissionTrend: trend,
            completionRate: this.calculateCompletionRate(submissions),
            averageCompletionTime: this.calculateAverageCompletionTime(submissions),
            peakSubmissionTime: this.calculatePeakSubmissionTime(submissions),
            fieldAbandonmentRates: this.calculateFieldAbandonment(submissions),
            deviceBreakdown: this.calculateDeviceBreakdown(submissions),
            statusDistribution: this.calculateStatusDistribution(submissions),
            anomalies: this.detectAnomalies(submissions)
        };
    }

    /**
     * Export chart as different formats
     */
    exportChartData(chartData: ChartData, format: 'json' | 'csv'): string {
        if (format === 'json') {
            return JSON.stringify(chartData, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(chartData);
        }
        return '';
    }

    // ===== Private Helper Methods =====

    private groupSubmissionsByTime(
        submissions: SubmissionRecord[],
        groupBy: 'day' | 'week' | 'month' | 'year'
    ): Map<string, number> {
        const grouped = new Map<string, number>();

        submissions.forEach(sub => {
            const date = new Date(sub.submittedAt);
            let key = '';

            switch (groupBy) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                case 'month':
                    key = date.toISOString().slice(0, 7);
                    break;
                case 'year':
                    key = String(date.getFullYear());
                    break;
            }

            grouped.set(key, (grouped.get(key) || 0) + 1);
        });

        return grouped;
    }

    private filterByDateRange(
        submissions: SubmissionRecord[],
        startDate: Date,
        endDate: Date
    ): SubmissionRecord[] {
        return submissions.filter(sub => {
            const date = new Date(sub.submittedAt);
            return date >= startDate && date <= endDate;
        });
    }

    private calculateMetadata(data: number[]): ChartMetadata {
        if (data.length === 0) {
            return {
                total: 0,
                average: 0,
                min: 0,
                max: 0,
                standardDeviation: 0,
                percentChange: 0
            };
        }

        const total = data.reduce((a, b) => a + b, 0);
        const average = total / data.length;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const variance = data.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / data.length;
        const standardDeviation = Math.sqrt(variance);
        const percentChange = ((data[data.length - 1] - data[0]) / (data[0] || 1)) * 100;

        return {
            total,
            average,
            min,
            max,
            standardDeviation,
            percentChange
        };
    }

    private generateGradientColors(count: number): string[] {
        const colors = [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
            '#4BC0C0',
            '#FF6384'
        ];

        const result: string[] = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    private calculateCompletionRate(submissions: SubmissionRecord[]): number {
        if (submissions.length === 0) return 0;

        let completed = 0;
        submissions.forEach(sub => {
            const dataKeys = Object.keys(sub.data);
            const filledKeys = dataKeys.filter(key => sub.data[key] !== null && sub.data[key] !== '');
            if (filledKeys.length === dataKeys.length) {
                completed++;
            }
        });

        return completed / submissions.length;
    }

    private calculateAverageCompletionTime(submissions: SubmissionRecord[]): number {
        if (submissions.length === 0) return 0;

        const totalTime = submissions.reduce((sum, sub) => {
            const createdAt = new Date(sub.submittedAt).getTime();
            const completedAt = new Date(sub.submittedAt).getTime();
            return sum + (completedAt - createdAt);
        }, 0);

        return Math.round(totalTime / submissions.length / 1000 / 60); // Convert to minutes
    }

    private calculatePeakSubmissionTime(submissions: SubmissionRecord[]): string {
        const hourCounts = new Map<number, number>();

        submissions.forEach(sub => {
            const hour = new Date(sub.submittedAt).getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        if (hourCounts.size === 0) return '12:00 PM';

        const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
        return `${peakHour}:00`;
    }

    private calculateFieldAbandonment(submissions: SubmissionRecord[]): Map<string, number> {
        const fieldAbandonment = new Map<string, number>();
        const fieldCounts = new Map<string, number>();

        // Count occurrences of each field
        submissions.forEach(sub => {
            Object.keys(sub.data).forEach(fieldName => {
                fieldCounts.set(fieldName, (fieldCounts.get(fieldName) || 0) + 1);
            });
        });

        // Calculate abandonment (missing values)
        fieldCounts.forEach((count, fieldName) => {
            const missingCount = submissions.length - count;
            fieldAbandonment.set(fieldName, missingCount / submissions.length);
        });

        return fieldAbandonment;
    }

    private calculateDeviceBreakdown(submissions: SubmissionRecord[]): Map<string, number> {
        const deviceCounts = new Map<string, number>();

        submissions.forEach(sub => {
            const userAgent = sub.userAgent || 'Unknown';
            const device = this.extractDeviceFromUserAgent(userAgent);
            deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
        });

        return deviceCounts;
    }

    private calculateStatusDistribution(submissions: SubmissionRecord[]): { [key: string]: number } {
        const distribution = {
            new: 0,
            reviewed: 0,
            archived: 0
        };

        submissions.forEach(sub => {
            const status = sub.status || 'new';
            if (status in distribution) {
                distribution[status as keyof typeof distribution]++;
            }
        });

        return distribution;
    }

    private extractDeviceFromUserAgent(userAgent: string): string {
        if (userAgent.includes('Mobile')) return 'Mobile';
        if (userAgent.includes('Tablet')) return 'Tablet';
        return 'Desktop';
    }

    private convertToCSV(chartData: ChartData): string {
        const headers = ['Label', ...chartData.datasets.map(ds => ds.label)];
        const rows: string[] = [headers.join(',')];

        for (let i = 0; i < chartData.labels.length; i++) {
            const row = [
                chartData.labels[i],
                ...chartData.datasets.map(ds => ds.data[i])
            ];
            rows.push(row.join(','));
        }

        return rows.join('\n');
    }
}
