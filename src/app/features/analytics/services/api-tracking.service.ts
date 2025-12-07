import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    ApiCallRecord,
    ApiCallMetrics,
    ModelAnalytics,
    ApiAnalyticsResponse
} from '../models/api-tracking.model';

@Injectable({
    providedIn: 'root'
})
export class ApiTrackingService {
    private readonly API_BASE = 'http://localhost:3000/api/v1/analytics';

    constructor(private http: HttpClient) { }

    /**
     * Get all API calls with optional filters
     */
    getApiCalls(
        limit: number = 100,
        offset: number = 0,
        filters?: {
            model?: string;
            service?: string;
            endpoint?: string;
            status_code?: number;
            startDate?: Date;
            endDate?: Date;
        }
    ): Observable<{ calls: ApiCallRecord[]; total: number; pages: number }> {
        let params = new HttpParams();
        params = params.set('limit', limit.toString());
        params = params.set('offset', offset.toString());

        if (filters) {
            if (filters.model) {
                params = params.set('model', filters.model);
            }
            if (filters.service) {
                params = params.set('service', filters.service);
            }
            if (filters.endpoint) {
                params = params.set('endpoint', filters.endpoint);
            }
            if (filters.status_code) {
                params = params.set('status_code', filters.status_code.toString());
            }
            if (filters.startDate) {
                params = params.set('startDate', filters.startDate.toISOString());
            }
            if (filters.endDate) {
                params = params.set('endDate', filters.endDate.toISOString());
            }
        }

        return this.http
            .get<ApiAnalyticsResponse<ApiCallRecord[]>>(`${this.API_BASE}/api-calls`, { params })
            .pipe(
                map(response => ({
                    calls: response.data,
                    total: response.pagination?.total || 0,
                    pages: response.pagination?.pages || 0
                }))
            );
    }

    /**
     * Get overall API metrics
     */
    getSummary(
        startDate?: Date,
        endDate?: Date
    ): Observable<ApiCallMetrics> {
        let params = new HttpParams();

        if (startDate) {
            params = params.set('startDate', startDate.toISOString());
        }
        if (endDate) {
            params = params.set('endDate', endDate.toISOString());
        }

        return this.http
            .get<ApiAnalyticsResponse<ApiCallMetrics>>(`${this.API_BASE}/summary`, { params })
            .pipe(map(response => response.data));
    }

    /**
     * Get analytics for all models
     */
    getModelAnalytics(): Observable<ModelAnalytics[]> {
        return this.http
            .get<ApiAnalyticsResponse<ModelAnalytics[]>>(`${this.API_BASE}/models`)
            .pipe(map(response => response.data));
    }

    /**
     * Get analytics for a specific model
     */
    getModelAnalyticsByName(model: string): Observable<ModelAnalytics> {
        return this.http
            .get<ApiAnalyticsResponse<ModelAnalytics>>(`${this.API_BASE}/models/${model}`)
            .pipe(map(response => response.data));
    }

    /**
     * Get analytics for a specific endpoint
     */
    getEndpointAnalytics(endpoint: string): Observable<ApiCallMetrics> {
        return this.http
            .get<ApiAnalyticsResponse<ApiCallMetrics>>(`${this.API_BASE}/endpoints/${endpoint}`)
            .pipe(map(response => response.data));
    }

    /**
     * Clear old API call records
     */
    clearOldRecords(daysToKeep: number = 30): Observable<{ message: string; deletedCount: number }> {
        let params = new HttpParams().set('daysToKeep', daysToKeep.toString());

        return this.http
            .delete<any>(`${this.API_BASE}/cleanup`, { params })
            .pipe(
                map(response => ({
                    message: response.message,
                    deletedCount: response.deletedCount
                }))
            );
    }
}
