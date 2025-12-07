/**
 * Report Models for Report Builder and Generation
 */

export type ReportType = 'standard' | 'detailed' | 'summary' | 'custom';
export type ReportFormat = 'pdf' | 'excel' | 'json' | 'csv';
export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

export interface ReportConfig {
    id: string;
    formId: string;
    name: string;
    description?: string;
    type: ReportType;
    template: ReportTemplate;
    filters?: ReportFilter[];
    schedule?: ReportSchedule;
    recipients?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReportTemplate {
    sections: ReportSection[];
    branding?: BrandingConfig;
    pageLayout?: PageLayout;
    includeCharts: boolean;
    includeSummary: boolean;
    includeDetails: boolean;
    includeMetadata: boolean;
}

export interface ReportSection {
    id: string;
    type: 'title' | 'summary' | 'chart' | 'table' | 'text' | 'metric' | 'divider';
    title?: string;
    content?: string;
    chartType?: string;
    chartConfig?: any;
    tableConfig?: TableConfig;
    order: number;
}

export interface TableConfig {
    columns: TableColumn[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    pageSize?: number;
    showTotals: boolean;
}

export interface TableColumn {
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'status';
    width?: number;
    format?: string;
}

export interface ReportFilter {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    value: any;
}

export interface ReportSchedule {
    frequency: ReportFrequency;
    startDate: Date;
    endDate?: Date;
    time?: string; // HH:mm format
    daysOfWeek?: number[]; // 0-6, Monday-Sunday
    dayOfMonth?: number;
    timezone?: string;
}

export interface BrandingConfig {
    logoUrl?: string;
    companyName?: string;
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
    fonts?: {
        heading: string;
        body: string;
    };
}

export interface PageLayout {
    orientation: 'portrait' | 'landscape';
    size: 'letter' | 'a4' | 'legal';
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export interface GeneratedReport {
    id: string;
    configId: string;
    formId: string;
    title: string;
    generatedAt: Date;
    generatedBy?: string;
    content: ReportContent;
    format: ReportFormat;
    fileSize: number;
    fileUrl: string;
    metadata: ReportMetadata;
}

export interface ReportContent {
    sections: ReportSectionContent[];
    summary: ReportSummary;
    details: ReportDetails;
}

export interface ReportSectionContent {
    sectionId: string;
    type: string;
    title?: string;
    data: any;
    html?: string;
}

export interface ReportSummary {
    totalSubmissions: number;
    submissionsByStatus: { [key: string]: number };
    avgCompletionRate: number;
    avgCompletionTime: number;
    dateRange: {
        start: Date;
        end: Date;
    };
}

export interface ReportDetails {
    submissions: any[];
    fieldBreakdown: { [field: string]: FieldStatistics };
    anomalies: string[];
    insights: string[];
}

export interface FieldStatistics {
    fieldName: string;
    fillRate: number;
    uniqueValues: number;
    mostCommonValue: string;
    leastCommonValue: string;
    dataType: string;
}

export interface ReportMetadata {
    pageCount: number;
    rowCount: number;
    submissionsIncluded: number;
    generationDuration: number; // milliseconds
    filterCount: number;
    chartsCount: number;
}

export interface ReportTemplate {
    id?: string;
    name: string;
    description?: string;
    type: ReportType;
    sections: ReportSection[];
    branding?: BrandingConfig;
    isDefault?: boolean;
    createdAt?: Date;
}

export interface ReportExportOptions {
    format: ReportFormat;
    fileName: string;
    includeCharts: boolean;
    includeMetadata: boolean;
    compress: boolean;
}

export interface ScheduledReportExecution {
    id: string;
    reportConfigId: string;
    scheduledFor: Date;
    executedAt?: Date;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    error?: string;
    generatedReportId?: string;
    recipients: string[];
}
