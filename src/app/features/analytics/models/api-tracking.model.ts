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

export interface ApiAnalyticsResponse<T> {
    success: boolean;
    data: T;
    pagination?: {
        total: number;
        limit: number;
        offset: number;
        pages: number;
    };
}
