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
