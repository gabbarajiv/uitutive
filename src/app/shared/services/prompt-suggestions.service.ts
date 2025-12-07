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
        {
            id: '6',
            text: 'Design an event registration form with date, time, capacity, and dietary preferences'
        },
        {
            id: '7',
            text: 'Create a newsletter subscription form with email and interest categories'
        },
        {
            id: '8',
            text: 'Build a support ticket form with priority level, category, and detailed description'
        },
        {
            id: '9',
            text: 'Generate a booking form with date, time, services, and customer details'
        },
        {
            id: '10',
            text: 'Create a course enrollment form with student info, course selection, and payment method'
        },
        {
            id: '11',
            text: 'Design a property rental inquiry form with location, budget, and move-in date'
        },
        {
            id: '12',
            text: 'Build a vendor/supplier form with company details, products/services, and contact info'
        },
        {
            id: '13',
            text: 'Create a health/wellness form with medical history, goals, and preferred services'
        },
        {
            id: '14',
            text: 'Generate an employee onboarding form with personal info, role, and emergency contacts'
        },
        {
            id: '15',
            text: 'Build a membership form with membership tier, benefits selection, and billing info'
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
