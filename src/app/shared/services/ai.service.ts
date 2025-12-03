import { Injectable } from '@angular/core';
import { Observable, from, throwError, timeout } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormConfig, FormField, FieldType } from '../models/form.model';
import { environment } from '../../../environments/environment';

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

interface OllamaRequest {
    model: string;
    messages: Array<{
        role: string;
        content: string;
    }>;
    temperature?: number;
    stream: boolean;
}

interface OllamaResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AIService {
    private ollamaApiUrl = environment.ollama.apiUrl;
    private ollamaModel = environment.ollama.model;
    private apiTimeout = environment.apiTimeout;

    constructor() {
        console.log(`Ollama AI Service initialized with API: ${this.ollamaApiUrl}`);
    }

    /**
     * Generate a form configuration from a text prompt using Ollama
     */
    generateFormFromPrompt(prompt: string): Observable<FormConfig> {
        return from(this.callOllama(prompt)).pipe(
            timeout(this.apiTimeout),
            map((response) => this.parseFormResponse(response)),
            catchError((error) => {
                console.error('Error generating form:', error);
                const errorMessage = error.name === 'TimeoutError'
                    ? 'Request timed out. Please check if Ollama is running.'
                    : 'Failed to generate form. Please try again.';
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    /**
     * Call Ollama API to generate form structure
     */
    private callOllama(prompt: string): Promise<GeneratedFormResponse> {
        const systemPrompt = `You are an expert form designer and UX specialist. Generate a JSON form configuration based on user requirements.

IMPORTANT: Analyze the user's request carefully and create fields that directly match what they described. Think about:
- What information needs to be collected?
- What field types best suit each piece of information?
- What validations and constraints apply?
- What helpful placeholders and descriptions would guide users?

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "formName": "unique-form-name-in-lowercase-with-underscores",
  "formTitle": "Human Readable Form Title",
  "formDescription": "Brief description of what this form does",
  "fields": [
    {
      "name": "field_name_lowercase",
      "label": "User Friendly Field Label",
      "type": "text|email|password|number|date|checkbox|radio|select|textarea|file",
      "required": true|false,
      "placeholder": "Helpful hint or example",
      "description": "Optional field help text or instructions",
      "options": [{"label": "Display Text", "value": "stored_value"}],
      "validation": "Specific validation rules like 'email format', 'min 8 chars', etc"
    }
  ]
}

CRITICAL RULES:
1. Field types MUST be: text, email, password, number, date, checkbox, radio, select, textarea, or file
2. Field names MUST be lowercase with underscores (no spaces or special characters)
3. Match the exact number and type of fields described by the user
4. Add helpful placeholder text that shows examples or expected format
5. Include relevant descriptions for complex fields
6. Set required: true for essential fields
7. Only include 'options' array for select/radio/checkbox types
8. Make field labels clear and user-friendly
9. Tailor validation rules to the specific field purpose
10. Return ONLY valid JSON - no explanations, no markdown code blocks

Example for a contact form:
{
  "formName": "contact_form",
  "formTitle": "Contact Us",
  "formDescription": "Send us a message and we'll get back to you soon",
  "fields": [
    {
      "name": "full_name",
      "label": "Full Name",
      "type": "text",
      "required": true,
      "placeholder": "John Doe",
      "description": "Your first and last name",
      "validation": "minimum 2 characters"
    },
    {
      "name": "email",
      "label": "Email Address",
      "type": "email",
      "required": true,
      "placeholder": "john@example.com",
      "description": "We'll use this to reply",
      "validation": "valid email format"
    },
    {
      "name": "message",
      "label": "Message",
      "type": "textarea",
      "required": true,
      "placeholder": "Tell us what you think...",
      "description": "Your message (minimum 10 characters)",
      "validation": "minimum 10 characters"
    }
  ]
}`;

        const fullPrompt = `${systemPrompt}\n\nGenerate form for: ${prompt}`;

        const ollamaRequest: OllamaRequest = {
            model: this.ollamaModel,
            messages: [
                {
                    role: 'user',
                    content: fullPrompt,
                },
            ],
            temperature: 0.5, // Lower temperature for more consistent JSON
            stream: false,
        };

        return fetch(`${this.ollamaApiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ollamaRequest),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
                }
                return response.json() as Promise<OllamaResponse>;
            })
            .then((data: OllamaResponse) => {
                const content = data.message.content.trim();
                if (!content) {
                    throw new Error('No response from Ollama');
                }

                // Extract JSON from response (in case there's surrounding text)
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Could not extract valid JSON from response');
                }

                try {
                    return JSON.parse(jsonMatch[0]) as GeneratedFormResponse;
                } catch (e) {
                    console.error('Failed to parse JSON:', jsonMatch[0]);
                    throw new Error('Invalid JSON format in response');
                }
            })
            .catch((error) => {
                if (error instanceof Error && error.message.includes('Failed to fetch')) {
                    throw new Error(
                        `Cannot connect to Ollama at ${this.ollamaApiUrl}. Make sure Ollama is running.`
                    );
                }
                throw error;
            });
    }

    /**
     * Parse Ollama response into FormConfig
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
     * Check if Ollama API is configured and accessible
     */
    isConfigured(): boolean {
        return !!this.ollamaApiUrl;
    }

    /**
     * Get current API configuration
     */
    getApiConfig() {
        return {
            apiUrl: this.ollamaApiUrl,
            model: this.ollamaModel,
            timeout: this.apiTimeout,
        };
    }
}
