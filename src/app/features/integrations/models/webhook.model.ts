/**
 * Webhook Models for Event Delivery
 */

export type WebhookEvent =
    | 'submission.created'
    | 'submission.updated'
    | 'submission.deleted'
    | 'form.published'
    | 'analytics.milestone'
    | 'report.generated';

export type WebhookDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying';

export interface WebhookConfig {
    id: string;
    formId: string;
    url: string;
    events: WebhookEvent[];
    secret?: string;
    headers?: { [key: string]: string };
    isActive: boolean;
    retryPolicy: RetryPolicy;
    createdAt: Date;
    updatedAt: Date;
}

export interface RetryPolicy {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
    maxDelayMs: number;
}

export interface WebhookDelivery {
    id: string;
    webhookId: string;
    event: WebhookEvent;
    payload: any;
    status: WebhookDeliveryStatus;
    httpStatus?: number;
    response?: string;
    error?: string;
    attemptCount: number;
    nextRetryAt?: Date;
    deliveredAt?: Date;
    createdAt: Date;
}

export interface WebhookPayload {
    id: string;
    event: WebhookEvent;
    timestamp: Date;
    formId: string;
    data: any;
    metadata?: {
        ip?: string;
        userAgent?: string;
        source?: string;
    };
}

export interface WebhookTestResult {
    success: boolean;
    statusCode?: number;
    response?: string;
    error?: string;
    duration: number;
}
