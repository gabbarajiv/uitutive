/**
 * Analytics Service
 * Provides metrics and analytics for form submissions
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubmissionRecord } from '../models/submission.model';

export interface AnalyticsMetrics {
    totalSubmissions: number;
    newSubmissions: number;
    reviewedSubmissions: number;
    archivedSubmissions: number;
    completionRate: number;
    avgTimeToCompletion?: number;
}

export interface FieldAnalytics {
    fieldName: string;
    filledCount: number;
    emptyCount: number;
    fillRate: number;
    uniqueValues: number;
    topValues: Array<{ value: string; count: number }>;
}

export interface TimelineData {
    date: string;
    count: number;
}

export interface SubmissionTimeline {
    dates: TimelineData[];
    totalPerDay: number;
}

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    calculateMetrics(submissions: SubmissionRecord[]): AnalyticsMetrics {
        const total = submissions.length;
        const newCount = submissions.filter(s => s.status === 'new').length;
        const reviewedCount = submissions.filter(s => s.status === 'reviewed').length;
        const archivedCount = submissions.filter(s => s.status === 'archived').length;

        return {
            totalSubmissions: total,
            newSubmissions: newCount,
            reviewedSubmissions: reviewedCount,
            archivedSubmissions: archivedCount,
            completionRate: total > 0 ? (reviewedCount / total) * 100 : 0
        };
    }

    analyzeField(
        submissions: SubmissionRecord[],
        fieldName: string
    ): FieldAnalytics {
        let filledCount = 0;
        const valueMap = new Map<string, number>();

        submissions.forEach(sub => {
            const value = sub.data[fieldName];
            if (value !== null && value !== undefined && value !== '') {
                filledCount++;
                const stringValue = String(value);
                valueMap.set(stringValue, (valueMap.get(stringValue) || 0) + 1);
            }
        });

        const emptyCount = submissions.length - filledCount;
        const fillRate =
            submissions.length > 0 ? (filledCount / submissions.length) * 100 : 0;

        const topValues = Array.from(valueMap.entries())
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            fieldName,
            filledCount,
            emptyCount,
            fillRate,
            uniqueValues: valueMap.size,
            topValues
        };
    }

    generateTimeline(submissions: SubmissionRecord[]): SubmissionTimeline {
        const dateMap = new Map<string, number>();

        submissions.forEach(sub => {
            const date = new Date(sub.submittedAt).toISOString().split('T')[0];
            dateMap.set(date, (dateMap.get(date) || 0) + 1);
        });

        const dates = Array.from(dateMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const totalPerDay =
            dates.length > 0
                ? dates.reduce((sum, d) => sum + d.count, 0) / dates.length
                : 0;

        return {
            dates,
            totalPerDay
        };
    }

    getSubmissionsByStatus(submissions: SubmissionRecord[]): {
        new: number;
        reviewed: number;
        archived: number;
    } {
        return {
            new: submissions.filter(s => s.status === 'new').length,
            reviewed: submissions.filter(s => s.status === 'reviewed').length,
            archived: submissions.filter(s => s.status === 'archived').length
        };
    }

    getCompletionTrend(
        submissions: SubmissionRecord[],
        days: number = 30
    ): { date: string; completionRate: number }[] {
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const dateMap = new Map<
            string,
            { total: number; completed: number }
        >();

        submissions.forEach(sub => {
            if (sub.submittedAt >= startDate) {
                const date = new Date(sub.submittedAt).toISOString().split('T')[0];
                const current = dateMap.get(date) || { total: 0, completed: 0 };
                current.total++;
                if (sub.status === 'reviewed' || sub.status === 'archived') {
                    current.completed++;
                }
                dateMap.set(date, current);
            }
        });

        return Array.from(dateMap.entries())
            .map(([date, data]) => ({
                date,
                completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    getMostCommonFieldValues(
        submissions: SubmissionRecord[],
        fieldName: string,
        limit: number = 5
    ): Array<{ value: string; count: number; percentage: number }> {
        const valueMap = new Map<string, number>();

        submissions.forEach(sub => {
            const value = sub.data[fieldName];
            if (value !== null && value !== undefined && value !== '') {
                const stringValue = String(value);
                valueMap.set(stringValue, (valueMap.get(stringValue) || 0) + 1);
            }
        });

        return Array.from(valueMap.entries())
            .map(([value, count]) => ({
                value,
                count,
                percentage: (count / submissions.length) * 100
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    getFieldCompletionRate(
        submissions: SubmissionRecord[],
        fieldName: string
    ): number {
        if (submissions.length === 0) return 0;

        const filledCount = submissions.filter(
            sub => sub.data[fieldName] !== null &&
                sub.data[fieldName] !== undefined &&
                sub.data[fieldName] !== ''
        ).length;

        return (filledCount / submissions.length) * 100;
    }

    getAllFieldsCompletionRate(
        submissions: SubmissionRecord[]
    ): Map<string, number> {
        const fieldRates = new Map<string, number>();

        if (submissions.length === 0) return fieldRates;

        // Get all unique field names
        const fieldNames = new Set<string>();
        submissions.forEach(sub => {
            Object.keys(sub.data).forEach(key => fieldNames.add(key));
        });

        fieldNames.forEach(fieldName => {
            const rate = this.getFieldCompletionRate(submissions, fieldName);
            fieldRates.set(fieldName, rate);
        });

        return fieldRates;
    }

    getSummaryStats(submissions: SubmissionRecord[]): {
        avgCompletionRate: number;
        totalFields: number;
        avgSubmissionsPerDay: number;
    } {
        const metrics = this.calculateMetrics(submissions);
        const completion = this.getAllFieldsCompletionRate(submissions);

        let avgCompletionRate = 0;
        if (completion.size > 0) {
            const sum = Array.from(completion.values()).reduce((a, b) => a + b, 0);
            avgCompletionRate = sum / completion.size;
        }

        let avgSubmissionsPerDay = 0;
        if (submissions.length > 0) {
            const dates = new Set(
                submissions.map(s =>
                    new Date(s.submittedAt).toISOString().split('T')[0]
                )
            );
            avgSubmissionsPerDay = submissions.length / Math.max(1, dates.size);
        }

        return {
            avgCompletionRate,
            totalFields: completion.size,
            avgSubmissionsPerDay
        };
    }
}
