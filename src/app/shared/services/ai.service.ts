import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormConfig, FormField, FieldType } from '../models/form.model';
import OpenAI from 'openai';

interface GeneratedFormResponse {
    formName: string;
    formTitle: string;
    formDescription: string;
    fields: Array<{
        name: string;
        label: string;
        type: FieldType;
        required: boolean;
        placeholder?: string;
        description?: string;
        options?: Array<{ label: string; value: string }>;
        validation?: string;
    }>;
}

@Injectable({
    providedIn: 'root',
})
export class AIService {
    private openai: OpenAI | null = null;

    constructor() {
        // Initialize OpenAI client - API key should come from environment
        const apiKey = this.getApiKey();
        if (apiKey) {
            this.openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true, // Only for development - move to backend in production
            });
        }
    }

    /**
     * Generate a form configuration from a text prompt using OpenAI
     */
    generateFormFromPrompt(prompt: string): Observable<FormConfig> {
        if (!this.openai) {
            return throwError(
                () => new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.')
            );
        }

        return from(this.callOpenAI(prompt)).pipe(
            map((response) => this.parseFormResponse(response)),
            catchError((error) => {
                console.error('Error generating form:', error);
                return throwError(() => new Error('Failed to generate form. Please try again.'));
            })
        );
    }

    /**
     * Call OpenAI API to generate form structure
     */
    private callOpenAI(prompt: string): Promise<GeneratedFormResponse> {
        if (!this.openai) {
            throw new Error('OpenAI not initialized');
        }

        const systemPrompt = `You are an expert form designer. Generate a JSON form configuration based on user requirements.
    
    Return a valid JSON object with this structure:
    {
      "formName": "unique-form-name",
      "formTitle": "Human Readable Form Title",
      "formDescription": "Brief description",
      "fields": [
        {
          "name": "field_name",
          "label": "Field Label",
          "type": "text|email|password|number|date|checkbox|radio|select|textarea|file",
          "required": true|false,
          "placeholder": "placeholder text",
          "description": "field help text",
          "options": [{"label": "Option 1", "value": "opt1"}],
          "validation": "description of validation rules"
        }
      ]
    }
    
    Make sure:
    - Field types are valid (text, email, password, number, date, checkbox, radio, select, textarea, file)
    - Field names are lowercase with underscores
    - Include at least 3-5 relevant fields
    - Add appropriate validations
    - Return only valid JSON, no markdown or extra text`;

        return this.openai.chat.completions
            .create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            })
            .then((response) => {
                const content = response.choices[0]?.message?.content;
                if (!content) {
                    throw new Error('No response from OpenAI');
                }

                // Extract JSON from response (in case there's surrounding text)
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Could not extract valid JSON from response');
                }

                return JSON.parse(jsonMatch[0]) as GeneratedFormResponse;
            });
    }

    /**
     * Parse OpenAI response into FormConfig
     */
    private parseFormResponse(response: GeneratedFormResponse): FormConfig {
        const fields: FormField[] = response.fields.map((field, index) => ({
            id: `field_${index}`,
            name: field.name,
            label: field.label,
            type: field.type,
            placeholder: field.placeholder,
            description: field.description,
            required: field.required,
            options: field.options,
            order: index,
            validations: this.parseValidations(field.validation),
        }));

        return {
            id: `form_${Date.now()}`,
            name: response.formName,
            title: response.formTitle,
            description: response.formDescription,
            fields: fields,
            createdAt: new Date(),
            template: false,
        };
    }

    /**
     * Parse validation string and convert to ValidationConfig
     */
    private parseValidations(validationString: string | undefined) {
        // This is a simple parser - can be extended based on needs
        const validations = [];

        if (validationString) {
            if (validationString.toLowerCase().includes('email')) {
                validations.push({ rule: 'email' as const, message: 'Please enter a valid email' });
            }
            if (validationString.toLowerCase().includes('min')) {
                validations.push({ rule: 'minLength' as const, value: 3, message: 'Minimum 3 characters required' });
            }
            if (validationString.toLowerCase().includes('max')) {
                validations.push({ rule: 'maxLength' as const, value: 50, message: 'Maximum 50 characters allowed' });
            }
        }

        return validations;
    }

    /**
     * Get API key from environment or localStorage
     */
    private getApiKey(): string | null {
        // In production, this should come from a secure backend
        // For development, you can store it in localStorage or use environment variables
        if (typeof window !== 'undefined') {
            return localStorage.getItem('openai_api_key') || '';
        }
        return null;
    }

    /**
     * Set API key (for development/testing)
     */
    setApiKey(apiKey: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('openai_api_key', apiKey);
            this.openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true,
            });
        }
    }

    /**
     * Check if API key is configured
     */
    isConfigured(): boolean {
        return !!this.openai;
    }
}
