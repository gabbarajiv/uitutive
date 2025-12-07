export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
    required: boolean;
    placeholder?: string;
    options?: string[];
    validation?: string;
}

export interface Form {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    created_at: Date;
    updated_at: Date;
}

export interface FormSubmission {
    id: string;
    form_id: string;
    data: Record<string, any>;
    status: 'new' | 'reviewed' | 'archived';
    user_agent?: string;
    ip_address?: string;
    submitted_at: Date;
    created_at: Date;
}

export interface ResponseTemplate {
    id: string;
    form_id: string;
    name: string;
    type: 'default' | 'card' | 'table' | 'custom';
    content: string;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface AnalyticsRecord {
    id: string;
    form_id: string;
    metric_name: string;
    metric_value: number;
    recorded_at: Date;
}

export interface ApiCallRecord {
    id: string;
    timestamp: Date;
    endpoint: string;
    method: string;
    model?: string;
    service: 'ollama' | 'internal' | 'external';
    status_code: number;
    request_size: number;
    response_size: number;
    response_time_ms: number;
    error_message?: string;
    user_agent?: string;
    ip_address?: string;
    request_body?: string;
    response_body?: string;
    created_at: Date;
}

export interface ApiCallMetrics {
    total_calls: number;
    successful_calls: number;
    failed_calls: number;
    average_response_time_ms: number;
    min_response_time_ms: number;
    max_response_time_ms: number;
    total_request_bytes: number;
    total_response_bytes: number;
    success_rate: number;
    calls_by_status: Record<number, number>;
}

export interface ModelAnalytics {
    model: string;
    total_calls: number;
    successful_calls: number;
    failed_calls: number;
    average_response_time_ms: number;
    min_response_time_ms: number;
    max_response_time_ms: number;
    total_request_bytes: number;
    total_response_bytes: number;
    success_rate: number;
    last_call: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
