import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database.js';
import { Form, FormSubmission, ResponseTemplate } from '../models/types.js';

export class FormService {
    /**
     * Create a new form
     */
    async createForm(title: string, description: string, fields: any[]): Promise<Form> {
        const id = uuidv4();
        const db = getDatabase();

        const now = new Date();

        try {
            await db.run(
                `INSERT INTO forms (id, title, description, fields, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [id, title, description, JSON.stringify(fields), now, now]
            );

            return {
                id,
                title,
                description,
                fields,
                created_at: now,
                updated_at: now
            };
        } catch (error: any) {
            throw new Error(`Failed to create form: ${error.message}`);
        }
    }

    /**
     * Get form by ID
     */
    async getForm(formId: string): Promise<Form | null> {
        const db = getDatabase();

        try {
            const result = await db.query(
                `SELECT * FROM forms WHERE id = ?`,
                [formId]
            );

            if (!result || result.length === 0) {
                return null;
            }

            const row = result[0];
            return {
                id: row.id,
                title: row.title,
                description: row.description,
                fields: JSON.parse(row.fields),
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at)
            };
        } catch (error: any) {
            throw new Error(`Failed to get form: ${error.message}`);
        }
    }

    /**
     * Get all forms
     */
    async getAllForms(): Promise<Form[]> {
        const db = getDatabase();

        try {
            const results = await db.query(`SELECT * FROM forms ORDER BY created_at DESC`);

            return results.map((row: any) => ({
                id: row.id,
                title: row.title,
                description: row.description,
                fields: JSON.parse(row.fields),
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at)
            }));
        } catch (error: any) {
            throw new Error(`Failed to get forms: ${error.message}`);
        }
    }

    /**
     * Update form
     */
    async updateForm(formId: string, updates: Partial<Form>): Promise<Form> {
        const db = getDatabase();
        const now = new Date();

        try {
            let updateQuery = 'UPDATE forms SET updated_at = ?';
            const params: any[] = [now];

            if (updates.title !== undefined) {
                updateQuery += ', title = ?';
                params.push(updates.title);
            }
            if (updates.description !== undefined) {
                updateQuery += ', description = ?';
                params.push(updates.description);
            }
            if (updates.fields !== undefined) {
                updateQuery += ', fields = ?';
                params.push(JSON.stringify(updates.fields));
            }

            updateQuery += ' WHERE id = ?';
            params.push(formId);

            await db.run(updateQuery, params);

            const form = await this.getForm(formId);
            if (!form) {
                throw new Error('Form not found after update');
            }
            return form;
        } catch (error: any) {
            throw new Error(`Failed to update form: ${error.message}`);
        }
    }

    /**
     * Delete form
     */
    async deleteForm(formId: string): Promise<void> {
        const db = getDatabase();

        try {
            await db.run(`DELETE FROM forms WHERE id = ?`, [formId]);
        } catch (error: any) {
            throw new Error(`Failed to delete form: ${error.message}`);
        }
    }

    /**
     * Create form submission
     */
    async createSubmission(
        formId: string,
        data: any,
        userAgent?: string,
        ipAddress?: string
    ): Promise<FormSubmission> {
        const id = uuidv4();
        const db = getDatabase();
        const now = new Date();

        try {
            await db.run(
                `INSERT INTO submissions (id, form_id, data, status, user_agent, ip_address, submitted_at, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, formId, JSON.stringify(data), 'new', userAgent, ipAddress, now, now]
            );

            return {
                id,
                form_id: formId,
                data,
                status: 'new',
                user_agent: userAgent,
                ip_address: ipAddress,
                submitted_at: now,
                created_at: now
            };
        } catch (error: any) {
            throw new Error(`Failed to create submission: ${error.message}`);
        }
    }

    /**
     * Get form submissions
     */
    async getSubmissions(formId: string, limit: number = 50, offset: number = 0): Promise<{
        submissions: FormSubmission[];
        total: number;
    }> {
        const db = getDatabase();

        try {
            const countResult = await db.query(
                `SELECT COUNT(*) as count FROM submissions WHERE form_id = ?`,
                [formId]
            );
            const total = countResult[0].count || 0;

            const results = await db.query(
                `SELECT * FROM submissions WHERE form_id = ? ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
                [formId, limit, offset]
            );

            const submissions = results.map((row: any) => ({
                id: row.id,
                form_id: row.form_id,
                data: JSON.parse(row.data),
                status: row.status,
                user_agent: row.user_agent,
                ip_address: row.ip_address,
                submitted_at: new Date(row.submitted_at),
                created_at: new Date(row.created_at)
            }));

            return { submissions, total };
        } catch (error: any) {
            throw new Error(`Failed to get submissions: ${error.message}`);
        }
    }

    /**
     * Get single submission
     */
    async getSubmission(submissionId: string): Promise<FormSubmission | null> {
        const db = getDatabase();

        try {
            const result = await db.query(
                `SELECT * FROM submissions WHERE id = ?`,
                [submissionId]
            );

            if (!result || result.length === 0) {
                return null;
            }

            const row = result[0];
            return {
                id: row.id,
                form_id: row.form_id,
                data: JSON.parse(row.data),
                status: row.status,
                user_agent: row.user_agent,
                ip_address: row.ip_address,
                submitted_at: new Date(row.submitted_at),
                created_at: new Date(row.created_at)
            };
        } catch (error: any) {
            throw new Error(`Failed to get submission: ${error.message}`);
        }
    }

    /**
     * Update submission
     */
    async updateSubmission(
        submissionId: string,
        updates: Partial<FormSubmission>
    ): Promise<FormSubmission> {
        const db = getDatabase();

        try {
            let updateQuery = 'UPDATE submissions SET ';
            const params: any[] = [];
            const updateFields = [];

            if (updates.status !== undefined) {
                updateFields.push('status = ?');
                params.push(updates.status);
            }
            if (updates.data !== undefined) {
                updateFields.push('data = ?');
                params.push(JSON.stringify(updates.data));
            }

            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }

            updateQuery += updateFields.join(', ') + ' WHERE id = ?';
            params.push(submissionId);

            await db.run(updateQuery, params);

            const submission = await this.getSubmission(submissionId);
            if (!submission) {
                throw new Error('Submission not found after update');
            }
            return submission;
        } catch (error: any) {
            throw new Error(`Failed to update submission: ${error.message}`);
        }
    }

    /**
     * Delete submission
     */
    async deleteSubmission(submissionId: string): Promise<void> {
        const db = getDatabase();

        try {
            await db.run(`DELETE FROM submissions WHERE id = ?`, [submissionId]);
        } catch (error: any) {
            throw new Error(`Failed to delete submission: ${error.message}`);
        }
    }
}

export const formService = new FormService();
