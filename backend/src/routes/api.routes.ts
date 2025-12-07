import { Router, Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { formService } from '../services/form.service.js';
import { ollamaService } from '../services/ollama.service.js';
import { apiTrackingService } from '../services/api-tracking.service.js';

const router = Router();

// Health check
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
    const ollamaHealth = await ollamaService.healthCheck();
    res.json({
        success: true,
        status: 'ok',
        ollama: ollamaHealth ? 'connected' : 'disconnected'
    });
}));

// Forms endpoints
router.post('/forms', asyncHandler(async (req: Request, res: Response) => {
    const { title, description, fields } = req.body;

    if (!title || !fields) {
        throw new AppError(400, 'Title and fields are required');
    }

    const form = await formService.createForm(title, description || '', fields);
    res.status(201).json({
        success: true,
        data: form
    });
}));

router.get('/forms', asyncHandler(async (req: Request, res: Response) => {
    const forms = await formService.getAllForms();
    res.json({
        success: true,
        data: forms
    });
}));

router.get('/forms/:formId', asyncHandler(async (req: Request, res: Response) => {
    const { formId } = req.params;
    const form = await formService.getForm(formId);

    if (!form) {
        throw new AppError(404, 'Form not found');
    }

    res.json({
        success: true,
        data: form
    });
}));

router.patch('/forms/:formId', asyncHandler(async (req: Request, res: Response) => {
    const { formId } = req.params;
    const form = await formService.updateForm(formId, req.body);

    res.json({
        success: true,
        data: form
    });
}));

router.delete('/forms/:formId', asyncHandler(async (req: Request, res: Response) => {
    const { formId } = req.params;
    await formService.deleteForm(formId);

    res.json({
        success: true,
        message: 'Form deleted'
    });
}));

// Submissions endpoints
router.post('/forms/:formId/submissions', asyncHandler(async (req: Request, res: Response) => {
    const { formId } = req.params;
    const { data } = req.body;

    if (!data) {
        throw new AppError(400, 'Submission data is required');
    }

    const form = await formService.getForm(formId);
    if (!form) {
        throw new AppError(404, 'Form not found');
    }

    const userAgent = req.get('user-agent');
    const ipAddress = req.ip;

    const submission = await formService.createSubmission(formId, data, userAgent, ipAddress);

    res.status(201).json({
        success: true,
        data: submission
    });
}));

router.get('/forms/:formId/submissions', asyncHandler(async (req: Request, res: Response) => {
    const { formId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const { submissions, total } = await formService.getSubmissions(formId, limit, offset);

    res.json({
        success: true,
        data: submissions,
        pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit)
        }
    });
}));

router.get('/forms/:formId/submissions/:submissionId', asyncHandler(async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const submission = await formService.getSubmission(submissionId);

    if (!submission) {
        throw new AppError(404, 'Submission not found');
    }

    res.json({
        success: true,
        data: submission
    });
}));

router.patch('/forms/:formId/submissions/:submissionId', asyncHandler(async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const submission = await formService.updateSubmission(submissionId, req.body);

    res.json({
        success: true,
        data: submission
    });
}));

router.delete('/forms/:formId/submissions/:submissionId', asyncHandler(async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    await formService.deleteSubmission(submissionId);

    res.json({
        success: true,
        message: 'Submission deleted'
    });
}));

// AI endpoints
router.post('/ai/generate-form', asyncHandler(async (req: Request, res: Response) => {
    const { description, model } = req.body;

    if (!description) {
        throw new AppError(400, 'Description is required');
    }

    // Set model if provided
    if (model) {
        ollamaService.setModel(model);
    }

    const fields = await ollamaService.generateFormFields(description);

    res.json({
        success: true,
        data: { fields }
    });
}));

router.post('/ai/generate-metadata', asyncHandler(async (req: Request, res: Response) => {
    const { input } = req.body;

    if (!input) {
        throw new AppError(400, 'Input is required');
    }

    const metadata = await ollamaService.generateFormMetadata(input);

    res.json({
        success: true,
        data: metadata
    });
}));

// Model selection endpoints
router.get('/models', asyncHandler(async (req: Request, res: Response) => {
    const models = await ollamaService.getAvailableModels();
    const currentModel = ollamaService.getModel();

    res.json({
        success: true,
        data: {
            models,
            currentModel
        }
    });
}));

router.post('/models/select', asyncHandler(async (req: Request, res: Response) => {
    const { model } = req.body;

    if (!model) {
        throw new AppError(400, 'Model name is required');
    }

    ollamaService.setModel(model);

    res.json({
        success: true,
        message: `Model switched to ${model}`,
        currentModel: ollamaService.getModel()
    });
}));

/* ============================================================ */
/* ANALYTICS ENDPOINTS */
/* ============================================================ */

// Get all API calls with optional filters
router.get('/analytics/api-calls', asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const filters = {
        model: req.query.model as string | undefined,
        service: req.query.service as string | undefined,
        endpoint: req.query.endpoint as string | undefined,
        status_code: req.query.status_code ? parseInt(req.query.status_code as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
    };

    const { calls, total } = await apiTrackingService.getApiCalls(limit, offset, filters);

    res.json({
        success: true,
        data: calls,
        pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit)
        }
    });
}));

// Get overall API metrics
router.get('/analytics/summary', asyncHandler(async (req: Request, res: Response) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const metrics = await apiTrackingService.getApiMetrics({ startDate, endDate });

    res.json({
        success: true,
        data: metrics
    });
}));

// Get analytics for all models
router.get('/analytics/models', asyncHandler(async (req: Request, res: Response) => {
    const analytics = await apiTrackingService.getModelAnalytics();

    res.json({
        success: true,
        data: analytics
    });
}));

// Get analytics for a specific model
router.get('/analytics/models/:model', asyncHandler(async (req: Request, res: Response) => {
    const { model } = req.params;

    const analytics = await apiTrackingService.getModelAnalyticsByName(model);

    if (!analytics) {
        throw new AppError(404, 'No analytics found for this model');
    }

    res.json({
        success: true,
        data: analytics
    });
}));

// Get analytics for a specific endpoint
router.get('/analytics/endpoints/:endpoint', asyncHandler(async (req: Request, res: Response) => {
    const { endpoint } = req.params;

    const metrics = await apiTrackingService.getEndpointAnalytics(endpoint);

    res.json({
        success: true,
        data: metrics
    });
}));

// Clear old API call records (for data retention)
router.delete('/analytics/cleanup', asyncHandler(async (req: Request, res: Response) => {
    const daysToKeep = parseInt(req.query.daysToKeep as string) || 30;

    const deletedCount = await apiTrackingService.clearOldRecords(daysToKeep);

    res.json({
        success: true,
        message: `Deleted ${deletedCount} old API call records`,
        deletedCount
    });
}));

export default router;
