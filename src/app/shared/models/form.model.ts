/**
 * Form Configuration Models
 * Defines the structure for dynamic forms
 */

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'file';
export type ValidationRule = 'required' | 'email' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';

/**
 * Validation configuration for a field
 */
export interface ValidationConfig {
    rule: ValidationRule;
    value?: any;
    message?: string;
    customFn?: (value: any) => boolean;
}

/**
 * Option for select/radio fields
 */
export interface FieldOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

/**
 * Individual form field configuration
 */
export interface FormField {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    value?: any;
    placeholder?: string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    validations?: ValidationConfig[];
    options?: FieldOption[]; // For select, radio, checkbox
    rows?: number; // For textarea
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    helpText?: string;
    order?: number;
    conditional?: {
        fieldId: string;
        operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
        value: any;
    };
}

/**
 * Complete form configuration
 */
export interface FormConfig {
    id: string;
    name: string;
    title: string;
    description?: string;
    fields: FormField[];
    submitButtonText?: string;
    cancelButtonText?: string;
    createdAt?: Date;
    updatedAt?: Date;
    tags?: string[];
    template?: boolean;
    shareableLink?: string;
    isPublic?: boolean;
}

/**
 * Form submission response
 */
export interface FormSubmission {
    id: string;
    formId: string;
    data: Record<string, any>;
    submittedAt: Date;
    userAgent?: string;
    ipAddress?: string;
}

/**
 * Form validation error
 */
export interface FormValidationError {
    fieldId: string;
    fieldName: string;
    message: string;
    rule: ValidationRule;
}

/**
 * Form state for managing current form
 */
export interface FormState {
    formConfig: FormConfig | null;
    formData: Record<string, any>;
    errors: FormValidationError[];
    touched: Set<string>;
    isDirty: boolean;
    isSubmitting: boolean;
}
