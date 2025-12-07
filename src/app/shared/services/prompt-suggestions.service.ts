/**
 * Prompt Suggestions Service
 * Manages configurable prompt suggestions for the form generator
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PromptSuggestion {
    id: string;
    text: string;
}

@Injectable({
    providedIn: 'root'
})
export class PromptSuggestionsService {
    private readonly STORAGE_KEY = 'prompt_suggestions';

    // Default suggestions
    private readonly DEFAULT_SUGGESTIONS: PromptSuggestion[] = [
        {
            id: '1',
            text: 'Create a customer registration form with name, email, phone, and address fields'
        },
        {
            id: '2',
            text: 'Generate a product feedback form with rating, comments, and email'
        },
        {
            id: '3',
            text: 'Build a job application form with skills, experience, and resume upload'
        },
        {
            id: '4',
            text: 'Create a survey form with multiple choice questions and satisfaction ratings'
        },
        {
            id: '5',
            text: 'Generate a contact form with name, email, subject, and message fields'
        },
    ];

    private suggestionsSubject: BehaviorSubject<PromptSuggestion[]>;

    constructor() {
        this.suggestionsSubject = new BehaviorSubject<PromptSuggestion[]>(
            this.loadSuggestionsFromStorage()
        );
    }

    /**
     * Get suggestions as observable
     */
    getSuggestions(): Observable<PromptSuggestion[]> {
        return this.suggestionsSubject.asObservable();
    }

    /**
     * Get suggestions synchronously
     */
    getSuggestionsSync(): PromptSuggestion[] {
        return this.suggestionsSubject.value;
    }

    /**
     * Add a new suggestion
     */
    addSuggestion(text: string): void {
        const suggestions = this.suggestionsSubject.value;
        const newSuggestion: PromptSuggestion = {
            id: Date.now().toString(),
            text
        };
        suggestions.push(newSuggestion);
        this.suggestionsSubject.next([...suggestions]);
        this.saveSuggestionsToStorage(suggestions);
    }

    /**
     * Remove a suggestion by ID
     */
    removeSuggestion(id: string): void {
        const suggestions = this.suggestionsSubject.value.filter(s => s.id !== id);
        this.suggestionsSubject.next(suggestions);
        this.saveSuggestionsToStorage(suggestions);
    }

    /**
     * Update a suggestion
     */
    updateSuggestion(id: string, text: string): void {
        const suggestions = this.suggestionsSubject.value.map(s =>
            s.id === id ? { ...s, text } : s
        );
        this.suggestionsSubject.next(suggestions);
        this.saveSuggestionsToStorage(suggestions);
    }

    /**
     * Reset suggestions to defaults
     */
    resetToDefaults(): void {
        this.suggestionsSubject.next([...this.DEFAULT_SUGGESTIONS]);
        this.saveSuggestionsToStorage(this.DEFAULT_SUGGESTIONS);
    }

    /**
     * Replace all suggestions
     */
    setSuggestions(suggestions: PromptSuggestion[]): void {
        this.suggestionsSubject.next(suggestions);
        this.saveSuggestionsToStorage(suggestions);
    }

    /**
     * Get default suggestions
     */
    getDefaultSuggestions(): PromptSuggestion[] {
        return [...this.DEFAULT_SUGGESTIONS];
    }

    /**
     * Export suggestions as JSON
     */
    exportSuggestions(): string {
        return JSON.stringify(this.suggestionsSubject.value, null, 2);
    }

    /**
     * Import suggestions from JSON
     */
    importSuggestions(jsonString: string): void {
        try {
            const suggestions = JSON.parse(jsonString);
            if (Array.isArray(suggestions) && suggestions.every(s => s.id && s.text)) {
                this.setSuggestions(suggestions);
            } else {
                throw new Error('Invalid suggestions format');
            }
        } catch (error) {
            console.error('Error importing suggestions:', error);
            throw error;
        }
    }

    // ============= Private Helper Methods =============

    /**
     * Load suggestions from localStorage
     */
    private loadSuggestionsFromStorage(): PromptSuggestion[] {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                if (stored) {
                    const suggestions = JSON.parse(stored);
                    if (Array.isArray(suggestions) && suggestions.length > 0) {
                        return suggestions;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading suggestions from storage:', error);
        }
        return [...this.DEFAULT_SUGGESTIONS];
    }

    /**
     * Save suggestions to localStorage
     */
    private saveSuggestionsToStorage(suggestions: PromptSuggestion[]): void {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(suggestions));
            }
        } catch (error) {
            console.error('Error saving suggestions to storage:', error);
        }
    }
}
