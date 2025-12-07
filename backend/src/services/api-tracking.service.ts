import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database.js';
import { ApiCallRecord, ApiCallMetrics, ModelAnalytics } from '../models/types.js';

export class ApiTrackingService {
    /**
     * Log an API call
     */
    async logApiCall(params: {
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
    }): Promise<ApiCallRecord> {
        const db = getDatabase();
        const id = uuidv4();
        const timestamp = new Date();
        const created_at = new Date();

        try {
            await db.run(
                `INSERT INTO api_calls (
                    id, timestamp, endpoint, method, model, service, status_code,
                    request_size, response_size, response_time_ms, error_message,
                    user_agent, ip_address, request_body, response_body, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    timestamp.toISOString(),
                    params.endpoint,
                    params.method,
                    params.model || null,
                    params.service,
                    params.status_code,
                    params.request_size,
                    params.response_size,
                    params.response_time_ms,
                    params.error_message || null,
                    params.user_agent || null,
                    params.ip_address || null,
                    params.request_body || null,
                    params.response_body || null,
                    created_at.toISOString()
                ]
            );

            return {
                id,
                timestamp,
                endpoint: params.endpoint,
                method: params.method,
                model: params.model,
                service: params.service,
                status_code: params.status_code,
                request_size: params.request_size,
                response_size: params.response_size,
                response_time_ms: params.response_time_ms,
                error_message: params.error_message,
                user_agent: params.user_agent,
                ip_address: params.ip_address,
                request_body: params.request_body,
                response_body: params.response_body,
                created_at
            };
        } catch (error: any) {
            throw new Error(`Failed to log API call: ${error.message}`);
        }
    }

    /**
     * Get API calls with filters
     */
    async getApiCalls(
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
    ): Promise<{ calls: ApiCallRecord[]; total: number }> {
        const db = getDatabase();
        let query = 'SELECT * FROM api_calls WHERE 1=1';
        const params: any[] = [];

        if (filters?.model) {
            query += ' AND model = ?';
            params.push(filters.model);
        }

        if (filters?.service) {
            query += ' AND service = ?';
            params.push(filters.service);
        }

        if (filters?.endpoint) {
            query += ' AND endpoint LIKE ?';
            params.push(`%${filters.endpoint}%`);
        }

        if (filters?.status_code) {
            query += ' AND status_code = ?';
            params.push(filters.status_code);
        }

        if (filters?.startDate) {
            query += ' AND timestamp >= ?';
            params.push(filters.startDate.toISOString());
        }

        if (filters?.endDate) {
            query += ' AND timestamp <= ?';
            params.push(filters.endDate.toISOString());
        }

        try {
            // Get total count
            const countResult = await db.query(
                query.replace('SELECT *', 'SELECT COUNT(*) as count'),
                params
            );
            const total = countResult[0]?.count || 0;

            // Get paginated results
            const results = await db.query(
                `${query} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );

            const calls = results.map((row: any) => ({
                id: row.id,
                timestamp: new Date(row.timestamp),
                endpoint: row.endpoint,
                method: row.method,
                model: row.model,
                service: row.service,
                status_code: row.status_code,
                request_size: row.request_size,
                response_size: row.response_size,
                response_time_ms: row.response_time_ms,
                error_message: row.error_message,
                user_agent: row.user_agent,
                ip_address: row.ip_address,
                request_body: row.request_body,
                response_body: row.response_body,
                created_at: new Date(row.created_at)
            }));

            return { calls, total };
        } catch (error: any) {
            throw new Error(`Failed to get API calls: ${error.message}`);
        }
    }

    /**
     * Get metrics for all API calls
     */
    async getApiMetrics(filters?: {
        model?: string;
        service?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<ApiCallMetrics> {
        const db = getDatabase();
        let query = 'SELECT * FROM api_calls WHERE 1=1';
        const params: any[] = [];

        if (filters?.model) {
            query += ' AND model = ?';
            params.push(filters.model);
        }

        if (filters?.service) {
            query += ' AND service = ?';
            params.push(filters.service);
        }

        if (filters?.startDate) {
            query += ' AND timestamp >= ?';
            params.push(filters.startDate.toISOString());
        }

        if (filters?.endDate) {
            query += ' AND timestamp <= ?';
            params.push(filters.endDate.toISOString());
        }

        try {
            const results = await db.query(query, params);

            if (results.length === 0) {
                return {
                    total_calls: 0,
                    successful_calls: 0,
                    failed_calls: 0,
                    average_response_time_ms: 0,
                    min_response_time_ms: 0,
                    max_response_time_ms: 0,
                    total_request_bytes: 0,
                    total_response_bytes: 0,
                    success_rate: 0,
                    calls_by_status: {}
                };
            }

            const responseTimes = results.map((r: any) => r.response_time_ms);
            const statusCodes = results.reduce((acc: any, r: any) => {
                acc[r.status_code] = (acc[r.status_code] || 0) + 1;
                return acc;
            }, {});

            const successfulCalls = Object.entries(statusCodes)
                .filter(([code]) => {
                    const codeNum = parseInt(code);
                    return codeNum >= 200 && codeNum < 300;
                })
                .reduce((sum, [, count]) => sum + (count as number), 0);

            return {
                total_calls: results.length,
                successful_calls: successfulCalls,
                failed_calls: results.length - successfulCalls,
                average_response_time_ms: responseTimes.reduce((a: number, b: number) => a + b, 0) / results.length,
                min_response_time_ms: Math.min(...responseTimes),
                max_response_time_ms: Math.max(...responseTimes),
                total_request_bytes: results.reduce((sum: number, r: any) => sum + r.request_size, 0),
                total_response_bytes: results.reduce((sum: number, r: any) => sum + r.response_size, 0),
                success_rate: (successfulCalls / results.length) * 100,
                calls_by_status: statusCodes
            };
        } catch (error: any) {
            throw new Error(`Failed to get API metrics: ${error.message}`);
        }
    }

    /**
     * Get analytics for all models
     */
    async getModelAnalytics(): Promise<ModelAnalytics[]> {
        const db = getDatabase();

        try {
            const results = await db.query(
                `SELECT model FROM api_calls WHERE model IS NOT NULL GROUP BY model`
            );

            const analytics: ModelAnalytics[] = [];

            for (const row of results) {
                const model = row.model;
                const metrics = await this.getApiMetrics({ model });

                // Get last call timestamp for this model
                const lastCallResult = await db.query(
                    `SELECT timestamp FROM api_calls WHERE model = ? ORDER BY timestamp DESC LIMIT 1`,
                    [model]
                );

                analytics.push({
                    model,
                    total_calls: metrics.total_calls,
                    successful_calls: metrics.successful_calls,
                    failed_calls: metrics.failed_calls,
                    average_response_time_ms: metrics.average_response_time_ms,
                    min_response_time_ms: metrics.min_response_time_ms,
                    max_response_time_ms: metrics.max_response_time_ms,
                    total_request_bytes: metrics.total_request_bytes,
                    total_response_bytes: metrics.total_response_bytes,
                    success_rate: metrics.success_rate,
                    last_call: lastCallResult[0] ? new Date(lastCallResult[0].timestamp) : new Date()
                });
            }

            return analytics;
        } catch (error: any) {
            throw new Error(`Failed to get model analytics: ${error.message}`);
        }
    }

    /**
     * Get analytics for a specific model
     */
    async getModelAnalyticsByName(model: string): Promise<ModelAnalytics | null> {
        const db = getDatabase();

        try {
            const result = await db.query(
                `SELECT COUNT(*) as count FROM api_calls WHERE model = ?`,
                [model]
            );

            if (!result[0] || result[0].count === 0) {
                return null;
            }

            const metrics = await this.getApiMetrics({ model });
            const lastCallResult = await db.query(
                `SELECT timestamp FROM api_calls WHERE model = ? ORDER BY timestamp DESC LIMIT 1`,
                [model]
            );

            return {
                model,
                total_calls: metrics.total_calls,
                successful_calls: metrics.successful_calls,
                failed_calls: metrics.failed_calls,
                average_response_time_ms: metrics.average_response_time_ms,
                min_response_time_ms: metrics.min_response_time_ms,
                max_response_time_ms: metrics.max_response_time_ms,
                total_request_bytes: metrics.total_request_bytes,
                total_response_bytes: metrics.total_response_bytes,
                success_rate: metrics.success_rate,
                last_call: lastCallResult[0] ? new Date(lastCallResult[0].timestamp) : new Date()
            };
        } catch (error: any) {
            throw new Error(`Failed to get model analytics: ${error.message}`);
        }
    }

    /**
     * Get analytics for a specific endpoint
     */
    async getEndpointAnalytics(endpoint: string): Promise<ApiCallMetrics> {
        const db = getDatabase();

        try {
            const results = await db.query(
                `SELECT * FROM api_calls WHERE endpoint LIKE ?`,
                [`%${endpoint}%`]
            );

            if (results.length === 0) {
                return {
                    total_calls: 0,
                    successful_calls: 0,
                    failed_calls: 0,
                    average_response_time_ms: 0,
                    min_response_time_ms: 0,
                    max_response_time_ms: 0,
                    total_request_bytes: 0,
                    total_response_bytes: 0,
                    success_rate: 0,
                    calls_by_status: {}
                };
            }

            const responseTimes = results.map((r: any) => r.response_time_ms);
            const statusCodes = results.reduce((acc: any, r: any) => {
                acc[r.status_code] = (acc[r.status_code] || 0) + 1;
                return acc;
            }, {});

            const successfulCalls = Object.entries(statusCodes)
                .filter(([code]) => {
                    const codeNum = parseInt(code);
                    return codeNum >= 200 && codeNum < 300;
                })
                .reduce((sum, [, count]) => sum + (count as number), 0);

            return {
                total_calls: results.length,
                successful_calls: successfulCalls,
                failed_calls: results.length - successfulCalls,
                average_response_time_ms: responseTimes.reduce((a: number, b: number) => a + b, 0) / results.length,
                min_response_time_ms: Math.min(...responseTimes),
                max_response_time_ms: Math.max(...responseTimes),
                total_request_bytes: results.reduce((sum: number, r: any) => sum + r.request_size, 0),
                total_response_bytes: results.reduce((sum: number, r: any) => sum + r.response_size, 0),
                success_rate: (successfulCalls / results.length) * 100,
                calls_by_status: statusCodes
            };
        } catch (error: any) {
            throw new Error(`Failed to get endpoint analytics: ${error.message}`);
        }
    }

    /**
     * Clear old API call records (retention policy)
     */
    async clearOldRecords(daysToKeep: number = 30): Promise<number> {
        const db = getDatabase();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        try {
            const result = await db.run(
                `DELETE FROM api_calls WHERE created_at < ?`,
                [cutoffDate]
            );

            return result.changes || 0;
        } catch (error: any) {
            throw new Error(`Failed to clear old records: ${error.message}`);
        }
    }
}

export const apiTrackingService = new ApiTrackingService();
