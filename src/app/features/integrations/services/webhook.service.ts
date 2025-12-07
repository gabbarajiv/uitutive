import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import {
    WebhookConfig,
    WebhookDelivery,
    WebhookPayload,
    WebhookTestResult,
    WebhookEvent,
    RetryPolicy
} from '../models/webhook.model';

@Injectable({
    providedIn: 'root'
})
export class WebhookService {
    private webhooksSubject = new BehaviorSubject<WebhookConfig[]>([]);
    webhooks$ = this.webhooksSubject.asObservable();

    private deliveriesSubject = new BehaviorSubject<WebhookDelivery[]>([]);
    deliveries$ = this.deliveriesSubject.asObservable();

    private readonly DEFAULT_RETRY_POLICY: RetryPolicy = {
        maxRetries: 5,
        backoffMultiplier: 2,
        initialDelayMs: 1000,
        maxDelayMs: 60000
    };

    constructor(private http: HttpClient) {
        this.loadWebhooks();
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // ===== Webhook Management =====

    /**
     * Create a new webhook
     */
    createWebhook(formId: string, webhook: Partial<WebhookConfig>): Observable<WebhookConfig> {
        const newWebhook: WebhookConfig = {
            id: this.generateId(),
            formId,
            url: webhook.url || '',
            events: webhook.events || [],
            secret: webhook.secret || this.generateSecret(),
            headers: webhook.headers,
            isActive: webhook.isActive !== false,
            retryPolicy: webhook.retryPolicy || this.DEFAULT_RETRY_POLICY,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const current = this.webhooksSubject.value;
        this.webhooksSubject.next([...current, newWebhook]);
        this.saveWebhooks();

        return of(newWebhook);
    }

    /**
     * Update webhook
     */
    updateWebhook(id: string, updates: Partial<WebhookConfig>): Observable<WebhookConfig> {
        const current = this.webhooksSubject.value;
        const index = current.findIndex(w => w.id === id);

        if (index !== -1) {
            const updated = { ...current[index], ...updates, updatedAt: new Date() };
            current[index] = updated;
            this.webhooksSubject.next([...current]);
            this.saveWebhooks();
            return of(updated);
        }

        return throwError(() => new Error('Webhook not found'));
    }

    /**
     * Delete webhook
     */
    deleteWebhook(id: string): Observable<boolean> {
        const current = this.webhooksSubject.value;
        const filtered = current.filter(w => w.id !== id);
        this.webhooksSubject.next(filtered);
        this.saveWebhooks();
        return of(true);
    }

    /**
     * Get all webhooks
     */
    getWebhooks(): Observable<WebhookConfig[]> {
        return this.webhooks$;
    }

    /**
     * Get webhooks for a specific form
     */
    getWebhooksByForm(formId: string): Observable<WebhookConfig[]> {
        return this.webhooks$.pipe(
            map(webhooks => webhooks.filter(w => w.formId === formId && w.isActive))
        );
    }

    /**
     * Get webhooks for a specific event
     */
    getWebhooksByEvent(formId: string, event: WebhookEvent): Observable<WebhookConfig[]> {
        return this.webhooks$.pipe(
            map(webhooks =>
                webhooks.filter(w => w.formId === formId && w.events.includes(event) && w.isActive)
            )
        );
    }

    // ===== Webhook Delivery =====

    /**
     * Trigger webhook delivery
     */
    triggerWebhook(
        formId: string,
        event: WebhookEvent,
        data: any
    ): Observable<WebhookDelivery[]> {
        return this.getWebhooksByEvent(formId, event).pipe(
            map(webhooks => {
                const deliveries: WebhookDelivery[] = [];

                webhooks.forEach(webhook => {
                    const delivery = this.createDelivery(webhook, event, data);
                    deliveries.push(delivery);
                    this.sendWebhook(webhook, delivery);
                });

                const current = this.deliveriesSubject.value;
                this.deliveriesSubject.next([...current, ...deliveries]);

                return deliveries;
            })
        );
    }

    /**
     * Send webhook
     */
    private sendWebhook(webhook: WebhookConfig, delivery: WebhookDelivery): void {
        const payload = this.createPayload(webhook.formId, delivery.event, delivery.payload);
        const headers = this.buildHeaders(webhook, payload);

        this.http.post(webhook.url, payload, { headers }).subscribe({
            next: (response: any) => {
                this.updateDelivery(delivery.id, {
                    status: 'delivered',
                    httpStatus: 200,
                    response: JSON.stringify(response),
                    deliveredAt: new Date(),
                    attemptCount: delivery.attemptCount + 1
                });
            },
            error: (error: any) => {
                this.retryWebhook(webhook, delivery, error);
            }
        });
    }

    /**
     * Retry webhook delivery
     */
    private retryWebhook(webhook: WebhookConfig, delivery: WebhookDelivery, error: any): void {
        if (delivery.attemptCount >= webhook.retryPolicy.maxRetries) {
            this.updateDelivery(delivery.id, {
                status: 'failed',
                error: error.message,
                httpStatus: error.status
            });
            return;
        }

        const delay = Math.min(
            webhook.retryPolicy.initialDelayMs * Math.pow(webhook.retryPolicy.backoffMultiplier, delivery.attemptCount),
            webhook.retryPolicy.maxDelayMs
        );

        this.updateDelivery(delivery.id, {
            status: 'retrying',
            nextRetryAt: new Date(Date.now() + delay),
            attemptCount: delivery.attemptCount + 1,
            error: error.message
        });

        setTimeout(() => {
            this.sendWebhook(webhook, { ...delivery, attemptCount: delivery.attemptCount + 1 });
        }, delay);
    }

    /**
     * Update delivery status
     */
    private updateDelivery(id: string, updates: Partial<WebhookDelivery>): void {
        const current = this.deliveriesSubject.value;
        const index = current.findIndex(d => d.id === id);

        if (index !== -1) {
            current[index] = { ...current[index], ...updates };
            this.deliveriesSubject.next([...current]);
        }
    }

    /**
     * Test webhook
     */
    testWebhook(webhook: WebhookConfig): Observable<WebhookTestResult> {
        const startTime = Date.now();
        const testPayload: WebhookPayload = {
            id: this.generateId(),
            event: 'submission.created',
            timestamp: new Date(),
            formId: webhook.formId,
            data: { test: true },
            metadata: { source: 'webhook-test' }
        };

        const headers = this.buildHeaders(webhook, testPayload);

        return this.http.post(webhook.url, testPayload, { headers }).pipe(
            map(response => ({
                success: true,
                statusCode: 200,
                response: JSON.stringify(response),
                duration: Date.now() - startTime
            })),
            catchError(error => {
                return of({
                    success: false,
                    statusCode: error.status,
                    error: error.message || 'Webhook delivery failed',
                    duration: Date.now() - startTime
                });
            })
        );
    }

    /**
     * Get delivery logs
     */
    getDeliveryLogs(webhookId: string): Observable<WebhookDelivery[]> {
        return this.deliveries$.pipe(
            map(deliveries => deliveries.filter(d => d.webhookId === webhookId))
        );
    }

    /**
     * Retry manual delivery
     */
    retryManualDelivery(deliveryId: string): Observable<WebhookDelivery> {
        const current = this.deliveriesSubject.value;
        const delivery = current.find(d => d.id === deliveryId);

        if (!delivery) {
            return throwError(() => new Error('Delivery not found'));
        }

        const webhooks = this.webhooksSubject.value;
        const webhook = webhooks.find(w => w.id === delivery.webhookId);

        if (!webhook) {
            return throwError(() => new Error('Webhook not found'));
        }

        this.sendWebhook(webhook, { ...delivery, attemptCount: 0 });
        return of(delivery);
    }

    // ===== Helper Methods =====

    /**
     * Create delivery record
     */
    private createDelivery(webhook: WebhookConfig, event: WebhookEvent, data: any): WebhookDelivery {
        return {
            id: this.generateId(),
            webhookId: webhook.id,
            event,
            payload: data,
            status: 'pending',
            attemptCount: 0,
            createdAt: new Date()
        };
    }

    /**
     * Create webhook payload
     */
    private createPayload(formId: string, event: WebhookEvent, data: any): WebhookPayload {
        return {
            id: this.generateId(),
            event,
            timestamp: new Date(),
            formId,
            data,
            metadata: {
                source: 'submission'
            }
        };
    }

    /**
     * Build request headers
     */
    private buildHeaders(webhook: WebhookConfig, payload: WebhookPayload): any {
        const headers: any = {
            'Content-Type': 'application/json'
        };

        if (webhook.secret) {
            const signature = this.generateSignature(JSON.stringify(payload), webhook.secret);
            headers['X-Webhook-Signature'] = `sha256=${signature}`;
        }

        if (webhook.headers) {
            Object.assign(headers, webhook.headers);
        }

        return headers;
    }

    /**
     * Generate webhook signature
     */
    private generateSignature(payload: string, secret: string): string {
        // In a real implementation, use HMAC-SHA256
        // For now, return a simple hash
        return btoa(`${payload}:${secret}`);
    }

    /**
     * Generate secret
     */
    private generateSecret(): string {
        return btoa(Math.random().toString()).substring(0, 32);
    }

    /**
     * Load webhooks from storage
     */
    private loadWebhooks(): void {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('webhooks');
            if (stored) {
                try {
                    const webhooks = JSON.parse(stored);
                    this.webhooksSubject.next(webhooks);
                } catch (e) {
                    console.error('Error loading webhooks from storage', e);
                }
            }
        }
    }

    /**
     * Save webhooks to storage
     */
    private saveWebhooks(): void {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('webhooks', JSON.stringify(this.webhooksSubject.value));
        }
    }
}
