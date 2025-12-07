import { Request, Response, NextFunction } from 'express';
import { apiTrackingService } from '../services/api-tracking.service.js';
import { execSync } from 'child_process';

// Type to extend Express Response
declare global {
    namespace Express {
        interface Response {
            startTime?: number;
            requestBody?: string;
            sentStatus?: number;
        }
    }
}

/**
 * Get GPU usage information
 */
function getGpuInfo(): { gpu_used: boolean; gpu_type?: string; gpu_utilization?: string } {
    try {
        // Try to detect NVIDIA GPU
        const nvidiaInfo = execSync('nvidia-smi --query-gpu=name,utilization.gpu --format=csv,noheader', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
        }).trim();

        if (nvidiaInfo) {
            const [gpuName, utilization] = nvidiaInfo.split(',');
            return {
                gpu_used: true,
                gpu_type: `NVIDIA - ${gpuName.trim()}`,
                gpu_utilization: utilization.trim()
            };
        }
    } catch (e) {
        // NVIDIA GPU not available
    }

    try {
        // Try to detect AMD GPU
        const amdInfo = execSync('rocm-smi --showproductname --showuse', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
        }).trim();

        if (amdInfo) {
            return {
                gpu_used: true,
                gpu_type: 'AMD - ROCm',
                gpu_utilization: 'Detected'
            };
        }
    } catch (e) {
        // AMD GPU not available
    }

    // No GPU detected
    return {
        gpu_used: false
    };
}

/**
 * Middleware to track all API calls
 * Captures request/response data and logs to database
 */
export function apiTrackingMiddleware(req: Request, res: Response, next: NextFunction) {
    // Record start time
    const startTime = Date.now();
    res.startTime = startTime;

    // Capture request body for non-GET requests
    let requestBody = '';
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (req.body) {
            try {
                requestBody = JSON.stringify(req.body);
                // Limit request body size to prevent storage issues
                if (requestBody.length > 10000) {
                    requestBody = requestBody.substring(0, 10000) + '...';
                }
            } catch (e) {
                requestBody = '';
            }
        }
    }
    res.requestBody = requestBody;

    // Calculate request size
    const requestSize = JSON.stringify(req.headers).length + requestBody.length;

    // Intercept res.send and res.json
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody = '';
    let responseSize = 0;

    res.send = function (data: any) {
        responseBody = typeof data === 'string' ? data : JSON.stringify(data);
        responseSize = Buffer.byteLength(responseBody);
        return originalSend.call(this, data);
    };

    res.json = function (data: any) {
        responseBody = JSON.stringify(data);
        responseSize = Buffer.byteLength(responseBody);
        // Limit response body size to prevent storage issues
        if (responseBody.length > 10000) {
            responseBody = responseBody.substring(0, 10000) + '...';
        }
        return originalJson.call(this, data);
    };

    // Listen for response finish
    res.on('finish', async () => {
        try {
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Extract model from request if present
            let model: string | undefined;
            if (req.body?.model) {
                model = req.body.model;
            }

            // Determine service type
            let service: 'ollama' | 'internal' | 'external' = 'internal';
            if (req.path.includes('/ai/')) {
                service = 'ollama';
            }

            // Get user agent and IP
            const userAgent = req.get('user-agent');
            const ipAddress = req.ip;

            // Get GPU information
            const gpuInfo = getGpuInfo();

            // Log API tracking details to console
            console.log(`\n📊 API TRACKING - ${req.method} ${req.path}`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Service: ${service}`);
            if (model) console.log(`   Model: ${model}`);
            console.log(`   Response Time: ${responseTime}ms`);
            console.log(`   Request Size: ${requestSize} bytes`);
            console.log(`   Response Size: ${responseSize} bytes`);
            console.log(`   GPU Used: ${gpuInfo.gpu_used ? '✅ Yes' : '❌ No'}`);
            if (gpuInfo.gpu_type) console.log(`   GPU Type: ${gpuInfo.gpu_type}`);
            if (gpuInfo.gpu_utilization) console.log(`   GPU Utilization: ${gpuInfo.gpu_utilization}`);
            if (userAgent) console.log(`   User Agent: ${userAgent}`);
            if (ipAddress) console.log(`   IP Address: ${ipAddress}`);
            if (requestBody) console.log(`   Request Body: ${requestBody.substring(0, 200)}${requestBody.length > 200 ? '...' : ''}`);
            if (responseBody && res.statusCode >= 400) console.log(`   Error Response: ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`);

            // Log the API call
            await apiTrackingService.logApiCall({
                endpoint: `${req.method} ${req.path}`,
                method: req.method,
                model,
                service,
                status_code: res.statusCode,
                request_size: requestSize,
                response_size: responseSize,
                response_time_ms: responseTime,
                error_message: res.statusCode >= 400 ? responseBody : undefined,
                user_agent: userAgent,
                ip_address: ipAddress,
                request_body: requestBody || undefined,
                response_body: responseBody || undefined
            });
        } catch (error) {
            // Log error but don't fail the request
            console.error('Error tracking API call:', error);
        }
    });

    next();
}

export default apiTrackingMiddleware;
