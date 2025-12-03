import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config.js';

export interface OllamaMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OllamaResponse {
    model: string;
    created_at: string;
    message: OllamaMessage;
    done: boolean;
}

export class OllamaService {
    private client: AxiosInstance;
    private model: string;

    constructor() {
        this.client = axios.create({
            baseURL: config.ollama.baseUrl,
            timeout: config.ollama.timeout
        });
        this.model = config.ollama.model;
    }

    /**
     * Generate text using Ollama
     */
    async generate(prompt: string, systemPrompt?: string): Promise<string> {
        try {
            const messages: OllamaMessage[] = [];

            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt
                });
            }

            messages.push({
                role: 'user',
                content: prompt
            });

            const response = await this.client.post('/api/chat', {
                model: this.model,
                messages: messages,
                stream: false
            });

            return response.data.message.content;
        } catch (error: any) {
            console.error('Ollama generation error:', error.message);
            throw new Error(`Failed to generate response from Ollama: ${error.message}`);
        }
    }

    /**
     * Generate form fields based on user description
     */
    async generateFormFields(description: string): Promise<any[]> {
        const systemPrompt = `You are a form generation expert. You generate JSON arrays of form field definitions based on user descriptions.
Each field should have: id, label, type (text, email, password, number, date, textarea, select, checkbox, radio, file), required (boolean), and optional placeholder/options.
Return ONLY valid JSON array, no additional text.`;

        try {
            const response = await this.generate(description, systemPrompt);

            // Extract JSON from response (in case there's extra text)
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error: any) {
            console.error('Form field generation error:', error.message);
            throw new Error(`Failed to generate form fields: ${error.message}`);
        }
    }

    /**
     * Generate form title and description
     */
    async generateFormMetadata(userInput: string): Promise<{ title: string; description: string }> {
        const systemPrompt = `You are a form title and description generator. Based on user input, generate a professional title and brief description for a form.
Return JSON with format: {"title": "...", "description": "..."}.
Return ONLY valid JSON, no additional text.`;

        try {
            const response = await this.generate(userInput, systemPrompt);

            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error: any) {
            console.error('Form metadata generation error:', error.message);
            throw new Error(`Failed to generate form metadata: ${error.message}`);
        }
    }

    /**
     * Validate form submission data against form schema
     */
    async validateSubmission(formSchema: any, submissionData: any): Promise<{ valid: boolean; errors: string[] }> {
        const systemPrompt = `You are a JSON schema validator. Validate the provided submission data against the form schema.
Return JSON with format: {"valid": boolean, "errors": ["error1", "error2"...]}.
Return ONLY valid JSON, no additional text.`;

        const prompt = `Form Schema: ${JSON.stringify(formSchema)}
Submission Data: ${JSON.stringify(submissionData)}

Validate the submission against the schema and return validation result as JSON.`;

        try {
            const response = await this.generate(prompt, systemPrompt);

            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error: any) {
            console.error('Validation error:', error.message);
            // Return valid by default if validation fails
            return { valid: true, errors: [] };
        }
    }

    /**
     * Generate insights/summary for form submissions
     */
    async generateInsights(submissions: any[]): Promise<string> {
        const systemPrompt = `You are a data analyst. Generate insightful summary of form submission patterns and notable trends.
Be concise and focus on actionable insights.`;

        const prompt = `Analyze these form submissions and provide insights: ${JSON.stringify(submissions.slice(0, 10))}`;

        try {
            return await this.generate(prompt, systemPrompt);
        } catch (error: any) {
            console.error('Insights generation error:', error.message);
            return 'Unable to generate insights at this time.';
        }
    }

    /**
     * Health check for Ollama service
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.client.get('/api/tags');
            return response.status === 200;
        } catch (error) {
            console.error('Ollama health check failed:', error);
            return false;
        }
    }
}

export const ollamaService = new OllamaService();
