/**
 * Submission Model
 * Defines the structure of form submissions and associated metadata
 */

export interface SubmissionRecord {
    id: string;                           // Unique submission ID (UUID)
    formId: string;                       // Reference to the form that was submitted
    data: Record<string, any>;            // Form response data (field values)
    submittedAt: Date;                    // Timestamp of submission
    status: 'new' | 'reviewed' | 'archived'; // Submission status
    notes?: string;                       // Internal notes or comments
    userAgent?: string;                   // Browser/device information
    ipAddress?: string;                   // IP address of submitter
    sessionId?: string;                   // Session identifier
    tags?: string[];                      // Categorization tags
    rating?: number;                      // User rating of submission (1-5)
}

export interface SubmissionMetadata {
    totalCount: number;
    newCount: number;
    reviewedCount: number;
    archivedCount: number;
    latestSubmission?: Date;
    oldestSubmission?: Date;
}

export interface SubmissionFilter {
    status?: 'new' | 'reviewed' | 'archived';
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
    searchTerm?: string;
}

export interface SubmissionSort {
    field: 'submittedAt' | 'status' | 'id';
    order: 'asc' | 'desc';
}

export interface PaginatedSubmissions {
    items: SubmissionRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
