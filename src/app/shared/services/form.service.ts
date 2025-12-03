import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormConfig, FormSubmission, FormValidationError, FormState } from '../models/form.model';

@Injectable({
    providedIn: 'root',
})
export class FormService {
    private formsSubject = new BehaviorSubject<FormConfig[]>([]);
    private currentFormSubject = new BehaviorSubject<FormConfig | null>(null);
    private formStateSubject = new BehaviorSubject<FormState>({
        formConfig: null,
        formData: {},
        errors: [],
        touched: new Set(),
        isDirty: false,
        isSubmitting: false,
    });

    public forms$ = this.formsSubject.asObservable();
    public currentForm$ = this.currentFormSubject.asObservable();
    public formState$ = this.formStateSubject.asObservable();

    private submissionsMap = new Map<string, FormSubmission[]>();

    constructor() {
        this.loadFormsFromStorage();
    }

    /**
     * Create a new form
     */
    createForm(formConfig: FormConfig): void {
        const forms = this.formsSubject.value;
        forms.push(formConfig);
        this.formsSubject.next([...forms]);
        this.saveFormsToStorage();
    }

    /**
     * Update existing form
     */
    updateForm(formConfig: FormConfig): void {
        const forms = this.formsSubject.value.map((form) => (form.id === formConfig.id ? formConfig : form));
        this.formsSubject.next(forms);
        if (this.currentFormSubject.value?.id === formConfig.id) {
            this.currentFormSubject.next(formConfig);
        }
        this.saveFormsToStorage();
    }

    /**
     * Delete a form
     */
    deleteForm(formId: string): void {
        const forms = this.formsSubject.value.filter((form) => form.id !== formId);
        this.formsSubject.next(forms);
        if (this.currentFormSubject.value?.id === formId) {
            this.currentFormSubject.next(null);
        }
        this.saveFormsToStorage();
    }

    /**
     * Get form by ID
     */
    getForm(formId: string): FormConfig | null {
        return this.formsSubject.value.find((form) => form.id === formId) || null;
    }

    /**
     * Set current form
     */
    setCurrentForm(formId: string): void {
        const form = this.getForm(formId);
        this.currentFormSubject.next(form);
        if (form) {
            this.initializeFormState(form);
        }
    }

    /**
     * Initialize form state with empty data
     */
    private initializeFormState(formConfig: FormConfig): void {
        const formData: Record<string, any> = {};
        formConfig.fields.forEach((field) => {
            formData[field.name] = field.value || '';
        });

        this.formStateSubject.next({
            formConfig,
            formData,
            errors: [],
            touched: new Set(),
            isDirty: false,
            isSubmitting: false,
        });
    }

    /**
     * Update form field value
     */
    updateFieldValue(fieldName: string, value: any): void {
        const state = this.formStateSubject.value;
        state.formData[fieldName] = value;
        state.isDirty = true;
        state.touched.add(fieldName);
        this.formStateSubject.next({ ...state });
    }

    /**
     * Mark field as touched
     */
    touchField(fieldName: string): void {
        const state = this.formStateSubject.value;
        state.touched.add(fieldName);
        this.formStateSubject.next({ ...state });
    }

    /**
     * Validate form
     */
    validateForm(): FormValidationError[] {
        const state = this.formStateSubject.value;
        const errors: FormValidationError[] = [];

        if (!state.formConfig) {
            return errors;
        }

        state.formConfig.fields.forEach((field) => {
            const value = state.formData[field.name];

            // Check required
            if (field.required && (!value || value === '')) {
                errors.push({
                    fieldId: field.id,
                    fieldName: field.name,
                    message: `${field.label} is required`,
                    rule: 'required',
                });
                return;
            }

            if (value && field.validations) {
                field.validations.forEach((validation) => {
                    if (validation.rule === 'email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: validation.message || 'Invalid email format',
                                rule: 'email',
                            });
                        }
                    } else if (validation.rule === 'minLength' && validation.value) {
                        if (value.length < validation.value) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: validation.message || `Minimum ${validation.value} characters required`,
                                rule: 'minLength',
                            });
                        }
                    } else if (validation.rule === 'maxLength' && validation.value) {
                        if (value.length > validation.value) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: validation.message || `Maximum ${validation.value} characters allowed`,
                                rule: 'maxLength',
                            });
                        }
                    } else if (validation.rule === 'pattern' && validation.value) {
                        const regex = new RegExp(validation.value);
                        if (!regex.test(value)) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: validation.message || 'Invalid format',
                                rule: 'pattern',
                            });
                        }
                    }
                });
            }
        });

        // Update errors in state
        const newState = this.formStateSubject.value;
        newState.errors = errors;
        this.formStateSubject.next({ ...newState });

        return errors;
    }

    /**
     * Submit form
     */
    submitForm(): Observable<FormSubmission | null> {
        return new Observable((observer) => {
            const errors = this.validateForm();

            if (errors.length > 0) {
                observer.error(new Error(`Form has ${errors.length} validation error(s)`));
                return;
            }

            const state = this.formStateSubject.value;
            const currentForm = this.currentFormSubject.value;

            if (!currentForm) {
                observer.error(new Error('No form loaded'));
                return;
            }

            const submission: FormSubmission = {
                id: `sub_${Date.now()}`,
                formId: currentForm.id,
                data: state.formData,
                submittedAt: new Date(),
            };

            // Store submission
            const submissions = this.submissionsMap.get(currentForm.id) || [];
            submissions.push(submission);
            this.submissionsMap.set(currentForm.id, submissions);

            // Reset form state
            this.initializeFormState(currentForm);

            observer.next(submission);
            observer.complete();
        });
    }

    /**
     * Get form submissions
     */
    getSubmissions(formId: string): FormSubmission[] {
        return this.submissionsMap.get(formId) || [];
    }

    /**
     * Reset form
     */
    resetForm(): void {
        const currentForm = this.currentFormSubject.value;
        if (currentForm) {
            this.initializeFormState(currentForm);
        }
    }

    /**
     * Save forms to localStorage
     */
    private saveFormsToStorage(): void {
        if (typeof localStorage !== 'undefined') {
            const forms = this.formsSubject.value;
            localStorage.setItem('forms', JSON.stringify(forms));
        }
    }

    /**
     * Load forms from localStorage
     */
    private loadFormsFromStorage(): void {
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('forms');
            if (stored) {
                try {
                    const forms = JSON.parse(stored);
                    this.formsSubject.next(forms);
                } catch (error) {
                    console.error('Error loading forms from storage:', error);
                }
            }
        }
    }
}
