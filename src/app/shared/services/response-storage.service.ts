/**
 * Response Storage Service
 * Manages form submission persistence and retrieval
 * Handles both frontend (local storage) and backend (API) operations
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
    SubmissionRecord,
    SubmissionMetadata,
    SubmissionFilter,
    SubmissionSort,
    PaginatedSubmissions
} from '../models/submission.model';

@Injectable({
    providedIn: 'root'
})
export class ResponseStorageService {
    private readonly API_URL = '/api/submissions';
    private readonly LOCAL_STORAGE_KEY = 'submissions';
    private readonly METADATA_KEY = 'submissions_metadata';

    private submissions$ = new BehaviorSubject<SubmissionRecord[]>([]);
    private metadata$ = new BehaviorSubject<SubmissionMetadata>({
        totalCount: 0,
        newCount: 0,
        reviewedCount: 0,
        archivedCount: 0
    });

    constructor(private http: HttpClient) {
        this.loadSubmissionsFromStorage();
    }

    /**
     * Create and store a new submission
     */
    createSubmission(
        formId: string,
        data: Record<string, any>,
        metadata?: Partial<SubmissionRecord>
    ): Observable<SubmissionRecord> {
        const submission: SubmissionRecord = {
            id: this.generateUuid(),
            formId,
            data,
            submittedAt: new Date(),
            status: 'new',
            userAgent: navigator.userAgent,
            ...metadata
        };        // Try to save to backend first, fallback to local storage
        return this.http.post<SubmissionRecord>(`${this.API_URL}`, submission)
            .pipe(
                tap(result => this.addSubmissionLocal(result)),
                catchError(() => {
                    // Fallback: save to local storage
                    this.addSubmissionLocal(submission);
                    return of(submission);
                })
            );
    }

    /**
     * Retrieve all submissions with optional filtering and sorting
     */
    getSubmissions(
        filter?: SubmissionFilter,
        sort?: SubmissionSort,
        page: number = 1,
        pageSize: number = 10
    ): Observable<PaginatedSubmissions> {
        return this.http.get<PaginatedSubmissions>(`${this.API_URL}`, {
            params: this.buildQueryParams(filter, sort, page, pageSize)
        }).pipe(
            catchError(() => {
                // Fallback: retrieve from local storage
                return of(this.getPaginatedSubmissionsLocal(filter, sort, page, pageSize));
            })
        );
    }

    /**
     * Get a specific submission by ID
     */
    getSubmission(id: string): Observable<SubmissionRecord | undefined> {
        return this.http.get<SubmissionRecord>(`${this.API_URL}/${id}`)
            .pipe(
                catchError(() => {
                    // Fallback: get from local storage
                    const submission = this.submissions$.value.find(s => s.id === id);
                    return of(submission);
                })
            );
    }

    /**
     * Update a submission's data or metadata
     */
    updateSubmission(
        id: string,
        updates: Partial<SubmissionRecord>
    ): Observable<SubmissionRecord> {
        return this.http.patch<SubmissionRecord>(`${this.API_URL}/${id}`, updates)
            .pipe(
                tap(result => this.updateSubmissionLocal(result)),
                catchError(() => {
                    // Fallback: update local storage
                    const submission = this.submissions$.value.find(s => s.id === id);
                    if (submission) {
                        const updated = { ...submission, ...updates };
                        this.updateSubmissionLocal(updated);
                        return of(updated);
                    }
                    throw new Error('Submission not found');
                })
            );
    }

    /**
     * Delete a submission
     */
    deleteSubmission(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`)
            .pipe(
                tap(() => this.deleteSubmissionLocal(id)),
                catchError(() => {
                    // Fallback: delete from local storage
                    this.deleteSubmissionLocal(id);
                    return of(void 0);
                })
            );
    }

    /**
     * Bulk delete submissions
     */
    deleteSubmissions(ids: string[]): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/bulk/delete`, { ids })
            .pipe(
                tap(() => {
                    ids.forEach(id => this.deleteSubmissionLocal(id));
                }),
                catchError(() => {
                    // Fallback: delete from local storage
                    ids.forEach(id => this.deleteSubmissionLocal(id));
                    return of(void 0);
                })
            );
    }

    /**
     * Update submission status
     */
    updateStatus(
        id: string,
        status: 'new' | 'reviewed' | 'archived'
    ): Observable<SubmissionRecord> {
        return this.updateSubmission(id, { status });
    }

    /**
     * Get submission metadata
     */
    getMetadata(): Observable<SubmissionMetadata> {
        return this.metadata$.asObservable();
    }

    /**
     * Get submissions observable stream
     */
    getSubmissionsStream(): Observable<SubmissionRecord[]> {
        return this.submissions$.asObservable();
    }

    /**
     * Export submissions as JSON
     */
    exportAsJson(submissions: SubmissionRecord[]): string {
        return JSON.stringify(submissions, null, 2);
    }

    /**
     * Export submissions as CSV
     */
    exportAsCsv(submissions: SubmissionRecord[], fields?: string[]): string {
        if (submissions.length === 0) return '';

        // Use provided fields or extract from first submission
        const extractedFields = fields || (submissions.length > 0
            ? Object.keys(submissions[0].data)
            : []);

        // Build CSV header
        const headers = ['id', 'formId', 'submittedAt', 'status', ...extractedFields];
        const csvLines: string[] = [headers.join(',')];

        // Build CSV rows
        submissions.forEach(sub => {
            const values = [
                this.escapeCsvValue(sub.id),
                this.escapeCsvValue(sub.formId),
                this.escapeCsvValue(sub.submittedAt.toString()),
                this.escapeCsvValue(sub.status)
            ];

            extractedFields.forEach(field => {
                values.push(this.escapeCsvValue(sub.data[field]?.toString() || ''));
            });

            csvLines.push(values.join(','));
        });

        return csvLines.join('\n');
    }

    /**
     * Clear all submissions (local storage only)
     */
    clearAll(): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.LOCAL_STORAGE_KEY);
            localStorage.removeItem(this.METADATA_KEY);
        }
        this.submissions$.next([]);
        this.updateMetadata();
    }

    // ============= Private Helper Methods =============

    private addSubmissionLocal(submission: SubmissionRecord): void {
        const current = this.submissions$.value;
        this.submissions$.next([submission, ...current]);
        this.saveToLocalStorage();
        this.updateMetadata();
    }

    private updateSubmissionLocal(submission: SubmissionRecord): void {
        const current = this.submissions$.value.map(s =>
            s.id === submission.id ? submission : s
        );
        this.submissions$.next(current);
        this.saveToLocalStorage();
        this.updateMetadata();
    }

    private deleteSubmissionLocal(id: string): void {
        const current = this.submissions$.value.filter(s => s.id !== id);
        this.submissions$.next(current);
        this.saveToLocalStorage();
        this.updateMetadata();
    }

    private loadSubmissionsFromStorage(): void {
        if (typeof localStorage === 'undefined') return;

        const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                const submissions = JSON.parse(stored) as SubmissionRecord[];
                // Parse dates
                submissions.forEach(s => {
                    s.submittedAt = new Date(s.submittedAt);
                });
                this.submissions$.next(submissions);
                this.updateMetadata();
            } catch (error) {
                console.error('Failed to parse submissions from storage', error);
            }
        }
    }

    private saveToLocalStorage(): void {
        if (typeof localStorage === 'undefined') return;

        localStorage.setItem(
            this.LOCAL_STORAGE_KEY,
            JSON.stringify(this.submissions$.value)
        );
    }

    private updateMetadata(): void {
        const submissions = this.submissions$.value;
        const metadata: SubmissionMetadata = {
            totalCount: submissions.length,
            newCount: submissions.filter(s => s.status === 'new').length,
            reviewedCount: submissions.filter(s => s.status === 'reviewed').length,
            archivedCount: submissions.filter(s => s.status === 'archived').length,
            latestSubmission: submissions.length > 0
                ? new Date(Math.max(...submissions.map(s => s.submittedAt.getTime())))
                : undefined,
            oldestSubmission: submissions.length > 0
                ? new Date(Math.min(...submissions.map(s => s.submittedAt.getTime())))
                : undefined
        };
        this.metadata$.next(metadata);

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
        }
    }

    private getPaginatedSubmissionsLocal(
        filter?: SubmissionFilter,
        sort?: SubmissionSort,
        page: number = 1,
        pageSize: number = 10
    ): PaginatedSubmissions {
        let submissions = [...this.submissions$.value];

        // Apply filters
        if (filter) {
            submissions = this.applyFilters(submissions, filter);
        }

        // Apply sorting
        if (sort) {
            submissions = this.applySorting(submissions, sort);
        }

        // Apply pagination
        const total = submissions.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const items = submissions.slice(start, start + pageSize);

        return {
            items,
            total,
            page,
            pageSize,
            totalPages
        };
    }

    private applyFilters(
        submissions: SubmissionRecord[],
        filter: SubmissionFilter
    ): SubmissionRecord[] {
        return submissions.filter(sub => {
            if (filter.status && sub.status !== filter.status) return false;

            if (filter.dateFrom && sub.submittedAt < filter.dateFrom) return false;
            if (filter.dateTo && sub.submittedAt > filter.dateTo) return false;

            if (filter.tags && filter.tags.length > 0) {
                const hasTags = filter.tags.some(tag => sub.tags?.includes(tag));
                if (!hasTags) return false;
            }

            if (filter.searchTerm) {
                const term = filter.searchTerm.toLowerCase();
                const dataString = JSON.stringify(sub.data).toLowerCase();
                if (!dataString.includes(term)) return false;
            }

            return true;
        });
    }

    private applySorting(
        submissions: SubmissionRecord[],
        sort: SubmissionSort
    ): SubmissionRecord[] {
        return submissions.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sort.field === 'submittedAt') {
                aValue = a.submittedAt.getTime();
                bValue = b.submittedAt.getTime();
            } else if (sort.field === 'status') {
                aValue = a.status;
                bValue = b.status;
            } else {
                aValue = a.id;
                bValue = b.id;
            }

            if (sort.order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    private buildQueryParams(
        filter?: SubmissionFilter,
        sort?: SubmissionSort,
        page?: number,
        pageSize?: number
    ): Record<string, string> {
        const params: Record<string, string> = {};

        if (filter?.status) params['status'] = filter.status;
        if (filter?.dateFrom) params['dateFrom'] = filter.dateFrom.toISOString();
        if (filter?.dateTo) params['dateTo'] = filter.dateTo.toISOString();
        if (filter?.tags?.length) params['tags'] = filter.tags.join(',');
        if (filter?.searchTerm) params['search'] = filter.searchTerm;

        if (sort?.field) {
            params['sortBy'] = sort.field;
            params['sortOrder'] = sort.order;
        }

        if (page) params['page'] = page.toString();
        if (pageSize) params['pageSize'] = pageSize.toString();

        return params;
    }

    private escapeCsvValue(value: string): string {
        if (!value) return '""';
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    private generateUuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}