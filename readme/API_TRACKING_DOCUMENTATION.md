# API Call Tracking and Analytics System

## Overview

The API Call Tracking and Analytics System automatically captures, stores, and analyzes all API calls made within the application. This includes calls to backend services, Ollama AI models, and internal/external endpoints. The system provides real-time analytics data accessible through both the UI and REST API endpoints.

## Features

### 1. Automatic API Call Tracking
- **Request Capture**: Captures all HTTP requests including method, endpoint, headers
- **Response Tracking**: Records response status code, size, and timing
- **Request/Response Body**: Stores request and response payloads (with size limits for efficiency)
- **Metadata**: Tracks user agent, IP address, timestamp, and model information

### 2. Comprehensive Metrics
For each API call, the system tracks:
- **Response Time**: Milliseconds to complete the request
- **Status Code**: HTTP response status (200, 400, 500, etc.)
- **Request Size**: Bytes of request body
- **Response Size**: Bytes of response body
- **Service Type**: Categorized as 'ollama', 'internal', or 'external'
- **Model**: AI model used (if applicable)
- **Error Messages**: Capture error details for failed requests

### 3. Analytics & Reporting
The system provides aggregate metrics:
- **Total API Calls**: Complete count of all requests
- **Success Rate**: Percentage of successful requests (status 2xx)
- **Average Response Time**: Mean response time across all calls
- **Min/Max Response Time**: Performance benchmarks
- **Calls by Status Code**: Distribution of response codes
- **Model Analytics**: Per-model performance metrics
- **Endpoint Analytics**: Per-endpoint performance data

### 4. Data Retention Policy
- Automatic cleanup of records older than 30 days (configurable)
- Optimized database queries with strategic indexing
- Efficient storage with size-limited payloads

## Architecture

### Backend Components

#### 1. **API Tracking Middleware** (`backend/src/middleware/api-tracking.middleware.ts`)
- Intercepts all HTTP requests and responses
- Calculates metrics in real-time
- Logs data asynchronously to avoid blocking requests
- Integrated into server startup in `server.ts`

#### 2. **API Tracking Service** (`backend/src/services/api-tracking.service.ts`)
Main service providing:
```typescript
logApiCall(params) - Log a single API call
getApiCalls(limit, offset, filters) - Retrieve paginated API calls
getApiMetrics(filters) - Get aggregate metrics
getModelAnalytics() - Get analytics for all models
getModelAnalyticsByName(model) - Get analytics for specific model
getEndpointAnalytics(endpoint) - Get analytics for specific endpoint
clearOldRecords(daysToKeep) - Cleanup old records
```

#### 3. **Database Schema** (`backend/src/db/database.ts`)
`api_calls` table with fields:
```sql
- id (TEXT PRIMARY KEY)
- timestamp (DATETIME)
- endpoint (TEXT)
- method (TEXT)
- model (TEXT, nullable)
- service (TEXT: 'ollama'|'internal'|'external')
- status_code (INTEGER)
- request_size (INTEGER)
- response_size (INTEGER)
- response_time_ms (INTEGER)
- error_message (TEXT, nullable)
- user_agent (TEXT, nullable)
- ip_address (TEXT, nullable)
- request_body (TEXT, limited to 10KB)
- response_body (TEXT, limited to 10KB)
- created_at (DATETIME)
```

**Indexes**:
- `idx_api_calls_timestamp` - For time-range queries
- `idx_api_calls_model` - For model-specific analytics
- `idx_api_calls_service` - For service-type filtering
- `idx_api_calls_endpoint` - For endpoint analytics
- `idx_api_calls_status_code` - For status distribution
- `idx_api_calls_model_timestamp` - Composite for model time-range queries
- `idx_api_calls_endpoint_timestamp` - Composite for endpoint time-range queries

#### 4. **API Analytics Endpoints** (in `backend/src/routes/api.routes.ts`)

**GET /api/v1/analytics/summary**
- Returns overall API metrics
- Query params: `startDate`, `endDate`
- Response: `ApiCallMetrics` object

**GET /api/v1/analytics/api-calls**
- Returns paginated API call records
- Query params: `limit`, `offset`, `model`, `service`, `endpoint`, `status_code`, `startDate`, `endDate`
- Response: Array of `ApiCallRecord` with pagination info

**GET /api/v1/analytics/models**
- Returns analytics for all models
- Response: Array of `ModelAnalytics` objects

**GET /api/v1/analytics/models/:model**
- Returns analytics for specific model
- Response: `ModelAnalytics` object

**GET /api/v1/analytics/endpoints/:endpoint**
- Returns analytics for specific endpoint
- Response: `ApiCallMetrics` object

**DELETE /api/v1/analytics/cleanup**
- Clears records older than specified days
- Query params: `daysToKeep` (default: 30)
- Response: `{ message: string, deletedCount: number }`

### Frontend Components

#### 1. **API Tracking Models** (`src/app/features/analytics/models/api-tracking.model.ts`)
TypeScript interfaces:
- `ApiCallRecord` - Single API call record
- `ApiCallMetrics` - Aggregate metrics
- `ModelAnalytics` - Model-specific analytics
- `ApiAnalyticsResponse<T>` - API response wrapper

#### 2. **API Tracking Service** (`src/app/features/analytics/services/api-tracking.service.ts`)
Angular service for API communication:
```typescript
getApiCalls(limit, offset, filters)
getSummary(startDate, endDate)
getModelAnalytics()
getModelAnalyticsByName(model)
getEndpointAnalytics(endpoint)
clearOldRecords(daysToKeep)
```

#### 3. **API Call Tracker Component** (`src/app/features/analytics/components/api-call-tracker/`)
Standalone Angular component displaying:
- **Summary Tab**: Overall metrics in a grid layout
- **Models Tab**: Table of model analytics with model detail view
- **API Calls Tab**: Paginated table of individual API calls with filters

**Features**:
- Real-time data loading
- Advanced filtering (by model, service, endpoint, date range)
- Pagination (configurable page sizes)
- Data formatting (bytes, dates, time intervals)
- Status code color coding (success, warning, error)
- Responsive design for mobile/tablet

## Integration Points

### How It Works

1. **Request Incoming**: All HTTP requests hit the server
2. **Middleware Intercepts**: `apiTrackingMiddleware` captures request data
3. **Request Processing**: Normal request processing continues
4. **Response Sent**: Response middleware captures response data
5. **Async Logging**: `apiTrackingService.logApiCall()` stores data asynchronously
6. **Analytics Available**: Data immediately available via analytics endpoints

### Example Flow

```
Client Request
    ↓
apiTrackingMiddleware captures request
    ↓
Express processes request normally
    ↓
Response sent to client
    ↓
Middleware logs to api_calls table
    ↓
Available in analytics UI
```

## Usage Guide

### Backend Usage

**In your routes or services**, you can manually log API calls to external services:

```typescript
import { apiTrackingService } from '../services/api-tracking.service.js';

// Log an API call
await apiTrackingService.logApiCall({
    endpoint: 'POST /api/v1/some-endpoint',
    method: 'POST',
    model: 'llama2',
    service: 'ollama',
    status_code: 200,
    request_size: 1024,
    response_size: 2048,
    response_time_ms: 450,
    user_agent: req.get('user-agent'),
    ip_address: req.ip
});

// Get metrics
const metrics = await apiTrackingService.getApiMetrics({
    model: 'llama2',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31')
});

// Get model analytics
const modelAnalytics = await apiTrackingService.getModelAnalyticsByName('llama2');
```

### Frontend Usage

**Display API call analytics in your Angular components:**

```typescript
import { ApiTrackingService } from '../services/api-tracking.service';

constructor(private apiTrackingService: ApiTrackingService) {}

ngOnInit() {
    // Get all model analytics
    this.apiTrackingService.getModelAnalytics().subscribe(
        analytics => this.displayModels(analytics)
    );
    
    // Get specific model analytics
    this.apiTrackingService.getModelAnalyticsByName('llama2').subscribe(
        analytics => this.displayModelDetail(analytics)
    );
    
    // Get summary metrics
    this.apiTrackingService.getSummary().subscribe(
        metrics => this.displaySummary(metrics)
    );
}
```

## Data Visualization

### Summary Tab
Grid display of key metrics:
- Total Calls
- Successful Calls (green)
- Failed Calls (red)
- Success Rate (%)
- Average/Min/Max Response Times
- Total Request/Response Bytes
- Status Code Distribution (chips)

### Models Tab
Sortable table showing:
- Model name
- Total API calls
- Success/failure counts
- Average response time
- Success rate percentage
- Last call timestamp
- Click row to see detailed metrics

### API Calls Tab
Paginated table with advanced filtering:
- Timestamp
- Endpoint (monospace font for clarity)
- HTTP Method (color-coded chip)
- Model name
- Status code (color-coded: 2xx=green, 4xx=orange, 5xx=red)
- Response time
- Request/Response sizes (formatted as KB/MB)

**Filters**:
- Model name (text search)
- Service type (dropdown)
- Endpoint (text search)
- HTTP Status Code (number)
- Date range (date picker)

## Performance Considerations

### Query Optimization
- Strategic indexing on frequently queried columns
- Composite indexes for common filter combinations
- Date-based partitioning ready (can be added)

### Storage Efficiency
- Request/response bodies limited to 10KB each
- Error messages captured only for failed requests (4xx, 5xx)
- Automatic cleanup of records older than 30 days

### Async Processing
- API call logging happens asynchronously after response sent
- Doesn't block request-response cycle
- Error handling prevents tracking failures from affecting requests

### Database Considerations
**SQLite**: Good for development/small deployments
**PostgreSQL**: Recommended for production with higher volumes

## Configuration

### Enable/Disable Tracking
The middleware is active by default. To disable:

```typescript
// In server.ts, comment out:
// app.use(apiTrackingMiddleware);
```

### Adjust Data Retention
```typescript
// Keep records for 60 days instead of 30
await apiTrackingService.clearOldRecords(60);
```

### Query Limits
```typescript
// Increase page size for large result sets
const { calls, total } = await apiTrackingService.getApiCalls(
    1000,  // pageSize
    0,     // offset
    filters
);
```

## Security & Privacy

### Data Protection
- User agent and IP address captured for analytics
- Request/response bodies limited to prevent storage bloat
- Error messages sanitized (only for debugging)
- No sensitive authentication data in tracking

### Access Control
- All analytics endpoints require existing backend authentication
- Implement additional authorization if needed
- Consider audit logging for sensitive queries

## Troubleshooting

### No data appearing in analytics
1. Verify middleware is loaded: Check `server.ts` for `apiTrackingMiddleware`
2. Check API calls are being made
3. Verify database table exists: `SELECT * FROM api_calls LIMIT 1;`
4. Check for errors in server logs

### Slow analytics queries
1. Verify indexes exist on `api_calls` table
2. Check query filters (avoid full table scans)
3. Consider date range filtering for large datasets
4. Run cleanup to remove old records

### Large database size
1. Reduce data retention period: `clearOldRecords(7)` for weekly cleanup
2. Adjust request/response body size limits in middleware
3. Archive old data to separate table if needed

## Future Enhancements

- [ ] Real-time WebSocket updates for live analytics
- [ ] Advanced charting with Chart.js/D3.js
- [ ] Anomaly detection for performance degradation
- [ ] Alert system for SLA violations
- [ ] Export analytics to CSV/PDF
- [ ] Custom dashboard configuration
- [ ] Machine learning for performance predictions
- [ ] API versioning metrics
- [ ] Rate limiting analytics
- [ ] Cost tracking by model

## API Reference

See the comprehensive API endpoint documentation above or visit:
- `GET /api/v1/analytics/summary` - Overall metrics
- `GET /api/v1/analytics/api-calls` - Call records
- `GET /api/v1/analytics/models` - All models
- `GET /api/v1/analytics/models/:model` - Specific model
- `GET /api/v1/analytics/endpoints/:endpoint` - Endpoint metrics
- `DELETE /api/v1/analytics/cleanup` - Data retention
