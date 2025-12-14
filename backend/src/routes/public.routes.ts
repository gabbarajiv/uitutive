import { Router, Request, Response } from 'express';
import { formService } from '../services/form.service.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * GET /api/public/forms/:link
 * Get a public form by shareable link (no auth required)
 */
router.get('/forms/:link', async (req: Request, res: Response) => {
    try {
        const { link } = req.params;

        if (!link || typeof link !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid form link'
            });
        }

        const form = await formService.getFormByLink(link);

        if (!form) {
            return res.status(404).json({
                success: false,
                error: 'Form not found or is no longer public'
            });
        }

        return res.json({
            success: true,
            data: form
        });
    } catch (error: any) {
        console.error('Error fetching public form:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch form'
        });
    }
});

/**
 * POST /api/public/forms/:link/submit
 * Submit a public form (no auth required)
 */
router.post('/forms/:link/submit', async (req: Request, res: Response) => {
    try {
        const { link } = req.params;
        const { data } = req.body;

        if (!link || typeof link !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid form link'
            });
        }

        if (!data || typeof data !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid submission data'
            });
        }

        // Verify form exists and is public
        const form = await formService.getFormByLink(link);
        if (!form) {
            return res.status(404).json({
                success: false,
                error: 'Form not found or is no longer public'
            });
        }

        // Validate form data against form fields
        const requiredFields = form.fields?.filter(f => f.required) || [];
        const missingFields = requiredFields.filter(field => !data[field.id]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                missingFields: missingFields.map(f => f.label)
            });
        }

        // Get client IP
        const ipAddress =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.socket.remoteAddress ||
            'unknown';

        const userAgent = req.get('user-agent') || 'unknown';

        // Create submission
        const submission = await formService.createPublicSubmission(
            form.id,
            link,
            data,
            userAgent,
            ipAddress
        );

        return res.status(201).json({
            success: true,
            data: {
                id: submission.id,
                message: 'Form submitted successfully',
                timestamp: submission.submitted_at
            }
        });
    } catch (error: any) {
        console.error('Error submitting public form:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit form'
        });
    }
});

export const publicRoutes = router;
