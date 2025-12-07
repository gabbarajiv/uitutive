/**
 * Chart Models for Advanced Analytics
 * Supports line charts, bar charts, pie charts, and heatmaps
 */

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'heatmap';
export type DataUnit = 'count' | 'percentage' | 'sum' | 'average' | 'min' | 'max';

export interface ChartConfig {
    id: string;
    name: string;
    description?: string;
    formId: string;
    type: ChartType;
    title: string;
    subtitle?: string;
    dataSource: DataSourceConfig;
    displayOptions: ChartDisplayOptions;
    filters?: ChartFilter[];
    refreshInterval?: number; // milliseconds
    createdAt: Date;
    updatedAt: Date;
}

export interface DataSourceConfig {
    type: 'field' | 'metric' | 'timeline' | 'comparison';
    fieldName?: string;
    metric?: string;
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    groupBy?: 'day' | 'week' | 'month' | 'year' | 'field' | 'status';
    aggregation?: DataUnit;
}

export interface ChartDisplayOptions {
    showLegend: boolean;
    showGrid: boolean;
    showTooltip: boolean;
    animated: boolean;
    responsive: boolean;
    height?: number;
    width?: number;
    colors?: string[];
    dateFormat?: string;
    numberFormat?: string;
}

export interface ChartFilter {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    value: any;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
    metadata?: ChartMetadata;
}

export interface ChartDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
    pointRadius?: number;
    pointBackgroundColor?: string;
}

export interface ChartMetadata {
    total: number;
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
    percentChange: number;
}

export interface LineChartConfig extends ChartConfig {
    type: 'line';
    dataSource: DataSourceConfig & {
        type: 'timeline' | 'metric';
        groupBy?: 'day' | 'week' | 'month' | 'year';
    };
}

export interface BarChartConfig extends ChartConfig {
    type: 'bar';
    dataSource: DataSourceConfig & {
        type: 'field' | 'metric';
        groupBy?: 'field' | 'status' | 'day' | 'week' | 'month' | 'year';
    };
}

export interface PieChartConfig extends ChartConfig {
    type: 'pie' | 'doughnut';
    dataSource: DataSourceConfig & {
        type: 'field' | 'metric';
        groupBy: 'field' | 'status';
    };
}

export interface ComparisonChartData {
    period1: ChartData;
    period2: ChartData;
    percentageChange: number;
    trend: 'up' | 'down' | 'stable';
}

export interface ChartExportOptions {
    format: 'png' | 'svg' | 'pdf' | 'json';
    width: number;
    height: number;
    includeMetadata: boolean;
    fileName: string;
}
