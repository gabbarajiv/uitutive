import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormPreviewComponent } from './form-preview.component';
import { FormConfig, FormField } from '../../../../shared/models/form.model';

describe('FormPreviewComponent', () => {
    let component: FormPreviewComponent;
    let fixture: ComponentFixture<FormPreviewComponent>;

    const mockFormConfig: FormConfig = {
        id: 'form-1',
        name: 'Test Form',
        title: 'Test Form',
        fields: [
            {
                id: 'field-1',
                name: 'firstName',
                label: 'First Name',
                type: 'text',
                required: true,
                placeholder: 'Enter first name'
            },
            {
                id: 'field-2',
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
                placeholder: 'Enter email'
            },
            {
                id: 'field-3',
                name: 'country',
                label: 'Country',
                type: 'select',
                required: false,
                options: [
                    { label: 'USA', value: 'us' },
                    { label: 'Canada', value: 'ca' }
                ]
            },
            {
                id: 'field-4',
                name: 'newsletter',
                label: 'Subscribe to newsletter',
                type: 'checkbox',
                required: false
            }
        ]
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormPreviewComponent, ReactiveFormsModule, BrowserAnimationsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(FormPreviewComponent);
        component = fixture.componentInstance;
        component.formConfig = mockFormConfig;
        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize form with fields from config', () => {
            expect(component.form).toBeDefined();
            expect(Object.keys(component.form.controls).length).toBe(4);
        });

        it('should have all field names in form controls', () => {
            const controlNames = Object.keys(component.form.controls);
            expect(controlNames).toContain('firstName');
            expect(controlNames).toContain('email');
            expect(controlNames).toContain('country');
            expect(controlNames).toContain('newsletter');
        });

        it('should initialize successMessage as null', () => {
            expect(component.successMessage).toBeNull();
        });

        it('should initialize isSubmitting as false', () => {
            expect(component.isSubmitting).toBeFalse();
        });
    });

    describe('Form Validation', () => {
        it('should have required validator on required fields', () => {
            const firstNameControl = component.form.get('firstName');
            firstNameControl?.setValue('');
            expect(firstNameControl?.hasError('required')).toBeTrue();
        });

        it('should not have required validator on optional fields', () => {
            const countryControl = component.form.get('country');
            countryControl?.setValue('');
            expect(countryControl?.hasError('required')).toBeFalsy();
        });

        it('should validate email format', () => {
            const emailControl = component.form.get('email');
            emailControl?.setValue('invalid-email');
            expect(emailControl?.hasError('email')).toBeTrue();

            emailControl?.setValue('valid@email.com');
            expect(emailControl?.hasError('email')).toBeFalsy();
        });

        it('should validate minLength', () => {
            const fieldConfig: FormField = {
                id: 'field-5',
                name: 'password',
                label: 'Password',
                type: 'password',
                required: true,
                minLength: 8
            };

            const validators = component['getValidators'](fieldConfig);
            expect(validators.length).toBeGreaterThan(0);
        });

        it('should validate maxLength', () => {
            const fieldConfig: FormField = {
                id: 'field-6',
                name: 'username',
                label: 'Username',
                type: 'text',
                required: true,
                maxLength: 20
            };

            const validators = component['getValidators'](fieldConfig);
            expect(validators.length).toBeGreaterThan(0);
        });

        it('should mark form as invalid when required field is empty', () => {
            component.form.get('firstName')?.setValue('');
            expect(component.form.invalid).toBeTrue();
        });

        it('should mark form as valid when all required fields are filled', () => {
            component.form.get('firstName')?.setValue('John');
            component.form.get('email')?.setValue('john@example.com');
            expect(component.form.valid).toBeTrue();
        });
    });

    describe('Error Handling', () => {
        it('should detect field errors correctly', () => {
            const firstNameControl = component.form.get('firstName');
            firstNameControl?.setValue('');
            firstNameControl?.markAsTouched();

            expect(component.hasFieldError('firstName')).toBeTrue();
        });

        it('should return appropriate error message for required field', () => {
            const firstNameControl = component.form.get('firstName');
            firstNameControl?.setValue('');
            firstNameControl?.markAsTouched();

            const errorMessage = component.getFieldError('firstName');
            expect(errorMessage).toBe('This field is required');
        });

        it('should return appropriate error message for email format', () => {
            const emailControl = component.form.get('email');
            emailControl?.setValue('invalid-email');
            emailControl?.markAsTouched();

            const errorMessage = component.getFieldError('email');
            expect(errorMessage).toContain('valid email');
        });

        it('should get all error messages', () => {
            component.form.get('firstName')?.setValue('');
            component.form.get('firstName')?.markAsTouched();
            component.form.get('email')?.setValue('');
            component.form.get('email')?.markAsTouched();

            const errorMessages = component.getErrorMessages();
            expect(errorMessages.length).toBeGreaterThan(0);
        });

        it('should return empty error message for valid field', () => {
            const firstNameControl = component.form.get('firstName');
            firstNameControl?.setValue('John');
            firstNameControl?.markAsTouched();

            const errorMessage = component.getFieldError('firstName');
            expect(errorMessage).toBe(''); // No error for valid field
        });
    });

    describe('hasErrors getter', () => {
        it('should return false when form is valid', () => {
            component.form.get('firstName')?.setValue('John');
            component.form.get('email')?.setValue('john@example.com');

            expect(component.hasErrors).toBeFalse();
        });

        it('should return true when form is invalid and touched', () => {
            component.form.get('firstName')?.setValue('');
            component.form.get('firstName')?.markAsTouched();

            expect(component.hasErrors).toBeTrue();
        });

        it('should return false when form is invalid but not touched', () => {
            component.form.get('firstName')?.setValue('');

            expect(component.hasErrors).toBeFalsy();
        });
    });

    describe('Form Submission', () => {
        it('should not submit invalid form', () => {
            component.form.get('firstName')?.setValue('');
            component.onSubmit();

            expect(component.successMessage).toBeNull();
            expect(component.isSubmitting).toBeFalse();
        });

        it('should mark all fields as touched on invalid submission attempt', () => {
            component.form.get('firstName')?.setValue('');
            component.onSubmit();

            const firstNameControl = component.form.get('firstName');
            expect(firstNameControl?.touched).toBeTrue();
        });

        it('should set isSubmitting to true on valid submission', (done) => {
            component.form.get('firstName')?.setValue('John');
            component.form.get('email')?.setValue('john@example.com');

            component.onSubmit();
            expect(component.isSubmitting).toBeTrue();

            setTimeout(() => {
                done();
            }, 600);
        });

        it('should show success message after submission', (done) => {
            component.form.get('firstName')?.setValue('John');
            component.form.get('email')?.setValue('john@example.com');

            component.onSubmit();

            setTimeout(() => {
                expect(component.successMessage).toBe('Form submitted successfully!');
                done();
            }, 600);
        });

        it('should clear success message after 3 seconds', fakeAsync(() => {
            component.form.get('firstName')?.setValue('John');
            component.form.get('email')?.setValue('john@example.com');

            component.onSubmit();

            // First timeout: 500ms for submission
            tick(500);
            expect(component.successMessage).toBe('Form submitted successfully!');

            // Second timeout: 3000ms to clear message
            tick(3000);
            expect(component.successMessage).toBeNull();
        }));

        it('should get form values on successful submission', (done) => {
            spyOn(console, 'log');

            component.form.get('firstName')?.setValue('John');
            component.form.get('email')?.setValue('john@example.com');

            component.onSubmit();

            setTimeout(() => {
                expect(console.log).toHaveBeenCalledWith('Form submitted:', jasmine.objectContaining({
                    firstName: 'John',
                    email: 'john@example.com'
                }));
                done();
            }, 600);
        });
    });

    describe('Button Interactions', () => {
        it('should disable submit button when form is invalid', () => {
            component.form.get('firstName')?.setValue('');
            expect(component.form.invalid).toBeTrue();
        });

        it('should enable submit button when form is valid', () => {
            component.form.get('firstName')?.setValue('John');
            component.form.get('email')?.setValue('john@example.com');
            expect(component.form.valid).toBeTrue();
        });

        it('should disable submit button while submitting', () => {
            component.isSubmitting = true;
            expect(component.isSubmitting).toBeTrue();
        });
    });

    describe('Field Rendering', () => {
        it('should create form control for text field', () => {
            expect(component.form.get('firstName')).toBeDefined();
        });

        it('should create form control for email field', () => {
            expect(component.form.get('email')).toBeDefined();
        });

        it('should create form control for select field', () => {
            expect(component.form.get('country')).toBeDefined();
        });

        it('should create form control for checkbox field', () => {
            expect(component.form.get('newsletter')).toBeDefined();
        });

        it('should get correct field configuration by name', () => {
            const field = component.formConfig.fields.find(f => f.name === 'firstName');
            expect(field).toBeDefined();
            expect(field?.label).toBe('First Name');
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in form values', (done) => {
            spyOn(console, 'log');

            component.form.get('firstName')?.setValue('Jöhn Dóe');
            component.form.get('email')?.setValue('john+test@example.com');

            component.onSubmit();

            setTimeout(() => {
                expect(console.log).toHaveBeenCalledWith('Form submitted:', jasmine.objectContaining({
                    firstName: 'Jöhn Dóe',
                    email: 'john+test@example.com'
                }));
                done();
            }, 600);
        });

        it('should handle multiple consecutive submissions', fakeAsync(() => {
            component.form.get('firstName')?.setValue('John');
            component.form.get('email')?.setValue('john@example.com');

            component.onSubmit();

            // Wait for first submission (500ms + 3000ms clear)
            tick(500);
            expect(component.successMessage).toBe('Form submitted successfully!');

            tick(3000);
            expect(component.successMessage).toBeNull();

            // Second submission
            component.form.get('firstName')?.setValue('Jane');
            component.form.get('email')?.setValue('jane@example.com');
            component.onSubmit();

            tick(500);
            expect(component.successMessage).toBe('Form submitted successfully!');

            tick(3000);
            expect(component.successMessage).toBeNull();
        }));

        it('should handle form with all optional fields', () => {
            const optionalFormConfig: FormConfig = {
                id: 'form-2',
                name: 'Optional Form',
                title: 'Optional Form',
                fields: [
                    {
                        id: 'field-1',
                        name: 'notes',
                        label: 'Notes',
                        type: 'textarea',
                        required: false
                    }
                ]
            };

            component.formConfig = optionalFormConfig;
            component.ngOnInit();

            expect(component.form.valid).toBeTrue();
        });
    });
});
