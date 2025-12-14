import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormConfig, FormSubmission, FormValidationError, FormState } from '../models/form.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class FormService {
    private apiUrl = `${environment.apiUrl}`;
    // Signals for optimal performance with zoneless change detection
    private formsSignal = signal<FormConfig[]>([]);
    private currentFormSignal = signal<FormConfig | null>(null);
    private formStateSignal = signal<FormState>({
        formConfig: null,
        formData: {},
        errors: [],
        touched: new Set(),
        isDirty: false,
        isSubmitting: false,
    });

    // Public readonly signals (best practice with zoneless)
    public readonly forms = this.formsSignal.asReadonly();
    public readonly currentForm = this.currentFormSignal.asReadonly();
    public readonly formState = this.formStateSignal.asReadonly();

    // Computed signals for derived state (auto-update when dependencies change)
    public readonly isFormValid = computed(() => this.formState().errors.length === 0);
    public readonly isFormDirty = computed(() => this.formState().isDirty);
    public readonly formFieldCount = computed(() => this.formState().formConfig?.fields.length ?? 0);

    // Observable versions for backward compatibility (can be removed once all components use signals)
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

    constructor(private http: HttpClient) {
        this.loadFormsFromStorage();

        // Sync signals to observables for backward compatibility
        effect(() => {
            this.formsSubject.next(this.formsSignal());
        });
        effect(() => {
            this.currentFormSubject.next(this.currentFormSignal());
        });
        effect(() => {
            this.formStateSubject.next(this.formStateSignal());
        });
    }

    /**
     * Create a new form
     */
    createForm(formConfig: FormConfig): void {
        const forms = [...this.formsSignal()];
        forms.push(formConfig);
        this.formsSignal.set(forms);
        this.saveFormsToStorage();
    }

    /**
     * Update existing form
     */
    updateForm(formConfig: FormConfig): void {
        const forms = this.formsSignal().map((form) => (form.id === formConfig.id ? formConfig : form));
        this.formsSignal.set(forms);
        if (this.currentFormSignal()?.id === formConfig.id) {
            this.currentFormSignal.set(formConfig);
        }
        this.saveFormsToStorage();
    }

    /**
     * Delete a form
     */
    deleteForm(formId: string): void {
        const forms = this.formsSignal().filter((form) => form.id !== formId);
        this.formsSignal.set(forms);
        if (this.currentFormSignal()?.id === formId) {
            this.currentFormSignal.set(null);
        }
        this.saveFormsToStorage();
    }

    /**
     * Get form by ID
     */
    getForm(formId: string): FormConfig | null {
        return this.formsSignal().find((form) => form.id === formId) || null;
    }

    /**
     * Set current form
     */
    setCurrentForm(formId: string): void {
        const form = this.getForm(formId);
        this.currentFormSignal.set(form);
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

        this.formStateSignal.set({
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
        const state = { ...this.formStateSignal() };
        state.formData[fieldName] = value;
        state.isDirty = true;
        state.touched.add(fieldName);
        this.formStateSignal.set(state);
    }

    /**
     * Mark field as touched
     */
    touchField(fieldName: string): void {
        const state = { ...this.formStateSignal() };
        state.touched.add(fieldName);
        this.formStateSignal.set(state);
    }

    /**
     * Validate form
     */
    validateForm(): FormValidationError[] {
        const state = this.formStateSignal();
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
        const newState = { ...this.formStateSignal() };
        newState.errors = errors;
        this.formStateSignal.set(newState);

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

            const state = this.formStateSignal();
            const currentForm = this.currentFormSignal();

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
        const currentForm = this.currentFormSignal();
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

    /**
     * Generate shareable link for a form
     */
    generateShareableLink(formId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forms/${formId}/generate-link`, {});
    }

    /**
     * Remove shareable link from a form
     */
    removeShareableLink(formId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/forms/${formId}/remove-link`);
    }

    /**
     * Toggle form public status
     */
    toggleFormPublic(formId: string, isPublic: boolean): Observable<any> {
        return this.http.post(`${this.apiUrl}/forms/${formId}/toggle-public`, { isPublic });
    }
}
