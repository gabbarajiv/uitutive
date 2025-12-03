/**
 * Template Service
 * Manages response display templates and rendering
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TemplateRecord } from '../models/template.model';
import { SubmissionRecord } from '../models/submission.model';

@Injectable({
    providedIn: 'root'
})
export class TemplateService {
    private readonly API_URL = '/api/templates';
    private readonly LOCAL_STORAGE_KEY = 'templates';

    private templates$ = new BehaviorSubject<TemplateRecord[]>([]);

    constructor() {
        this.loadTemplatesFromStorage();
    }

    /**
     * Create a new template
     */
    createTemplate(template: Omit<TemplateRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<TemplateRecord> {
        const newTemplate: TemplateRecord = {
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            ...template
        };

        this.addTemplateLocal(newTemplate);
        return of(newTemplate);
    }

    /**
     * Get all templates
     */
    getTemplates(): Observable<TemplateRecord[]> {
        return this.templates$.asObservable();
    }

    /**
     * Get a specific template
     */
    getTemplate(id: string): Observable<TemplateRecord | undefined> {
        return this.templates$.pipe(
            map(templates => templates.find(t => t.id === id))
        );
    }

    /**
     * Get templates by form ID
     */
    getTemplatesByFormId(formId: string): Observable<TemplateRecord[]> {
        return this.templates$.pipe(
            map(templates => templates.filter(t => t.formId === formId))
        );
    }

    /**
     * Get default template for form
     */
    getDefaultTemplate(formId: string): Observable<TemplateRecord | undefined> {
        return this.templates$.pipe(
            map(templates =>
                templates.find(t => t.formId === formId && t.isDefault)
            )
        );
    }

    /**
     * Update a template
     */
    updateTemplate(id: string, updates: Partial<TemplateRecord>): Observable<TemplateRecord> {
        const templates = this.templates$.value;
        const index = templates.findIndex(t => t.id === id);

        if (index === -1) {
            throw new Error('Template not found');
        }

        const updated: TemplateRecord = {
            ...templates[index],
            ...updates,
            updatedAt: new Date(),
            version: templates[index].version + 1
        };

        const newTemplates = [...templates];
        newTemplates[index] = updated;
        this.templates$.next(newTemplates);
        this.saveToLocalStorage();

        return of(updated);
    }

    /**
     * Delete a template
     */
    deleteTemplate(id: string): Observable<void> {
        const templates = this.templates$.value.filter(t => t.id !== id);
        this.templates$.next(templates);
        this.saveToLocalStorage();
        return of(void 0);
    }

    /**
     * Set template as default for form
     */
    setAsDefault(id: string, formId: string): Observable<void> {
        const templates = this.templates$.value.map(t => ({
            ...t,
            isDefault: t.id === id && t.formId === formId
        }));
        this.templates$.next(templates);
        this.saveToLocalStorage();
        return of(void 0);
    }

    /**
     * Render template with submission data
     */
    renderTemplate(
        template: TemplateRecord,
        submission: SubmissionRecord
    ): string {
        switch (template.type) {
            case 'default':
                return this.renderDefaultTemplate(template, submission);
            case 'card':
                return this.renderCardTemplate(template, submission);
            case 'table':
                return this.renderTableTemplate(template, submission);
            case 'custom':
                return this.renderCustomTemplate(template, submission);
            default:
                return this.renderDefaultTemplate(template, submission);
        }
    }

    /**
     * Duplicate template
     */
    duplicateTemplate(id: string, newName: string): Observable<TemplateRecord> {
        const original = this.templates$.value.find(t => t.id === id);
        if (!original) {
            throw new Error('Template not found');
        }

        const duplicate: TemplateRecord = {
            ...original,
            id: this.generateId(),
            name: newName,
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
        };

        this.addTemplateLocal(duplicate);
        return of(duplicate);
    }

    // ============= Private Helper Methods =============

    private renderDefaultTemplate(template: TemplateRecord, submission: SubmissionRecord): string {
        const config = template.content as any;
        let html = '<div class="template-default">';

        if (config.showTimestamp) {
            html += `<div class="timestamp">${new Date(submission.submittedAt).toLocaleString()}</div>`;
        }

        if (config.showStatus) {
            html += `<div class="status">${submission.status}</div>`;
        }

        html += '<div class="fields">';
        Object.entries(submission.data).forEach(([key, value]) => {
            html += `
        <div class="field">
          <label>${this.formatFieldName(key)}</label>
          <value>${this.formatValue(value)}</value>
        </div>
      `;
        });
        html += '</div></div>';

        return html;
    }

    private renderCardTemplate(template: TemplateRecord, submission: SubmissionRecord): string {
        const config = template.content as any;
        const groupFields = config.groupFields || [];

        let html = `<div class="template-cards" style="display: grid; grid-template-columns: repeat(${config.cardsPerRow || 2}, 1fr); gap: 16px;">`;

        if (groupFields.length > 0) {
            groupFields.forEach((group: string) => {
                const value = submission.data[group];
                if (value !== null && value !== undefined) {
                    html += `
            <div class="card" style="border: 1px solid #ddd; padding: 16px; border-radius: 8px;">
              <h3>${this.formatFieldName(group)}</h3>
              <p>${this.formatValue(value)}</p>
            </div>
          `;
                }
            });
        } else {
            Object.entries(submission.data).forEach(([key, value]) => {
                html += `
          <div class="card" style="border: 1px solid #ddd; padding: 16px; border-radius: 8px;">
            <h3>${this.formatFieldName(key)}</h3>
            <p>${this.formatValue(value)}</p>
          </div>
        `;
            });
        }

        html += '</div>';
        return html;
    }

    private renderTableTemplate(template: TemplateRecord, submission: SubmissionRecord): string {
        const config = template.content as any;
        const columns = config.columns || [];

        let html = '<table style="width: 100%; border-collapse: collapse;"><tbody>';

        if (columns.length > 0) {
            columns.forEach((col: any) => {
                const value = submission.data[col.field];
                html += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: 600; width: 30%;">${col.header}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${this.formatValue(value)}</td>
          </tr>
        `;
            });
        } else {
            Object.entries(submission.data).forEach(([key, value]) => {
                html += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: 600; width: 30%;">${this.formatFieldName(key)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${this.formatValue(value)}</td>
          </tr>
        `;
            });
        }

        html += '</tbody></table>';
        return html;
    }

    private renderCustomTemplate(template: TemplateRecord, submission: SubmissionRecord): string {
        let html = template.content as string;

        // Replace placeholders with actual values
        Object.entries(submission.data).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            html = html.replace(new RegExp(placeholder, 'g'), this.formatValue(value));
        });

        return html;
    }

    private formatFieldName(name: string): string {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    private formatValue(value: any): string {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    private addTemplateLocal(template: TemplateRecord): void {
        const current = this.templates$.value;
        this.templates$.next([...current, template]);
        this.saveToLocalStorage();
    }

    private loadTemplatesFromStorage(): void {
        const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                const templates = JSON.parse(stored) as TemplateRecord[];
                templates.forEach(t => {
                    t.createdAt = new Date(t.createdAt);
                    t.updatedAt = new Date(t.updatedAt);
                });
                this.templates$.next(templates);
            } catch (error) {
                console.error('Failed to parse templates from storage', error);
            }
        }
    }

    private saveToLocalStorage(): void {
        localStorage.setItem(
            this.LOCAL_STORAGE_KEY,
            JSON.stringify(this.templates$.value)
        );
    }

    private generateId(): string {
        return 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
