import { Router, Request, Response } from 'express';
import { formService } from '../services/form.service.js';

export const submissionsRouter = Router();

/**
 * Create a new submission
 * POST /api/submissions
 */
submissionsRouter.post('/', async (req: Request, res: Response) => {
    try {
        const { formId, data, userAgent, ipAddress } = req.body;

        if (!formId || !data) {
            return res.status(400).json({ error: 'formId and data are required' });
        }

        const submission = await formService.createSubmission(formId, data, userAgent, ipAddress);
        res.status(201).json(submission);
    } catch (error) {
        console.error('Error creating submission:', error);
        res.status(500).json({ error: 'Failed to create submission' });
    }
});

/**
 * Get all submissions for a form
 * GET /api/submissions?formId=xxx&limit=10&offset=0
 */
submissionsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const { formId, limit = '50', offset = '0' } = req.query;

        if (!formId) {
            return res.status(400).json({ error: 'formId is required' });
        }

        const limitNum = parseInt(limit as string) || 50;
        const offsetNum = parseInt(offset as string) || 0;

        const result = await formService.getSubmissions(formId as string, limitNum, offsetNum);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

/**
 * Get a single submission
 * GET /api/submissions/:submissionId
 */
submissionsRouter.get('/:submissionId', async (req: Request, res: Response) => {
    try {
        const { submissionId } = req.params;
        const submission = await formService.getSubmission(submissionId);

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.status(200).json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

/**
 * Update a submission
 * PATCH /api/submissions/:submissionId
 */
submissionsRouter.patch('/:submissionId', async (req: Request, res: Response) => {
    try {
        const { submissionId } = req.params;
        const updates = req.body;

        const submission = await formService.updateSubmission(submissionId, updates);
        res.status(200).json(submission);
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({ error: 'Failed to update submission' });
    }
});

/**
 * Delete a submission
 * DELETE /api/submissions/:submissionId
 */
submissionsRouter.delete('/:submissionId', async (req: Request, res: Response) => {
    try {
        const { submissionId } = req.params;
        await formService.deleteSubmission(submissionId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});