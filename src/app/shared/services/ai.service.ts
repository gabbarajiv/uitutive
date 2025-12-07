import { Injectable } from '@angular/core';
import { Observable, from, throwError, timeout, BehaviorSubject } from 'rxjs';
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

export interface ModelInfo {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
}

@Injectable({
    providedIn: 'root',
})
export class AIService {
    private backendApiUrl = 'http://localhost:3000/api/v1';
    private apiTimeout = environment.apiTimeout;
    private currentModel = new BehaviorSubject<string>('llama2');

    constructor() {
        console.log(`AI Service initialized with backend API: ${this.backendApiUrl}`);
        this.loadCurrentModel();
    }

    /**
     * Load the current model from backend
     */
    private loadCurrentModel(): void {
        this.getAvailableModels().subscribe({
            next: (data) => {
                if (data.currentModel) {
                    this.currentModel.next(data.currentModel);
                }
            },
            error: (error) => console.error('Failed to load current model:', error)
        });
    }

    /**
     * Get available models from backend
     */
    getAvailableModels(): Observable<{ models: ModelInfo[]; currentModel: string }> {
        return from(
            fetch(`${this.backendApiUrl}/models`).then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch models: ${response.status}`);
                }
                return response.json();
            })
        ).pipe(
            timeout(this.apiTimeout),
            map((data: any) => ({
                models: data.data?.models || [],
                currentModel: data.data?.currentModel || 'llama2'
            })),
            catchError((error) => {
                console.error('Error fetching models:', error);
                return throwError(() => new Error('Failed to fetch available models'));
            })
        );
    }

    /**
     * Set the model to use
     */
    setModel(modelName: string): Observable<{ message: string; currentModel: string }> {
        return from(
            fetch(`${this.backendApiUrl}/models/select`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ model: modelName }),
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to set model: ${response.status}`);
                }
                return response.json();
            })
        ).pipe(
            timeout(this.apiTimeout),
            map((data: any) => {
                this.currentModel.next(modelName);
                return {
                    message: data.data?.message || `Model set to ${modelName}`,
                    currentModel: modelName
                };
            }),
            catchError((error) => {
                console.error('Error setting model:', error);
                return throwError(() => new Error('Failed to set model'));
            })
        );
    }

    /**
     * Get the current model as observable
     */
    getCurrentModel$(): Observable<string> {
        return this.currentModel.asObservable();
    }

    /**
     * Get the current model value
     */
    getCurrentModel(): string {
        return this.currentModel.value;
    }

    /**
     * Generate a form configuration from a text prompt via backend
     */
    generateFormFromPrompt(prompt: string): Observable<FormConfig> {
        return from(this.callBackend(prompt)).pipe(
            timeout(this.apiTimeout),
            map((response) => this.parseFormResponse(response)),
            catchError((error) => {
                console.error('Error generating form:', error);
                const errorMessage = error.name === 'TimeoutError'
                    ? 'Request timed out. Please check if backend is running.'
                    : 'Failed to generate form. Please try again.';
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    /**
     * Call backend API to generate form structure
     */
    private callBackend(prompt: string): Promise<GeneratedFormResponse> {
        return fetch(`${this.backendApiUrl}/ai/generate-form`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description: prompt }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then((data: any) => {
                const fields = data.data?.fields;
                if (!fields || !Array.isArray(fields)) {
                    throw new Error('No valid fields in response');
                }

                // Convert backend field format to expected format
                return {
                    formName: `form_${Date.now()}`,
                    formTitle: 'Generated Form',
                    formDescription: prompt,
                    fields: fields.map((field: any) => ({
                        name: field.name || field.id,
                        label: field.label,
                        type: field.type,
                        required: field.required || false,
                        placeholder: field.placeholder,
                        description: field.description,
                        options: field.options,
                        validation: field.validation
                    }))
                } as GeneratedFormResponse;
            })
            .catch((error) => {
                if (error instanceof Error && error.message.includes('Failed to fetch')) {
                    throw new Error(
                        `Cannot connect to backend at ${this.backendApiUrl}. Make sure backend is running.`
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
     * Check if backend API is configured and accessible
     */
    isConfigured(): boolean {
        return !!this.backendApiUrl;
    }

    /**
     * Get current API configuration
     */
    getApiConfig() {
        return {
            apiUrl: this.backendApiUrl,
            timeout: this.apiTimeout,
        };
    }
}
