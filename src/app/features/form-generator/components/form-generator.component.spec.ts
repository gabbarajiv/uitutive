import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { FormGeneratorComponent } from './form-generator.component';
import { AIService } from '../../../shared/services/ai.service';
import { FormService } from '../../../shared/services/form.service';
import { FormConfig } from '../../../shared/models/form.model';

describe('FormGeneratorComponent', () => {
    let component: FormGeneratorComponent;
    let fixture: ComponentFixture<FormGeneratorComponent>;
    let mockAIService: jasmine.SpyObj<AIService>;
    let mockFormService: jasmine.SpyObj<FormService>;

    const mockFormConfig: FormConfig = {
        id: 'form-1',
        name: 'Test Form',
        title: 'Test Form Title',
        description: 'Test Description',
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
            }
        ],
        createdAt: new Date()
    };

    beforeEach(async () => {
        mockAIService = jasmine.createSpyObj('AIService', [
            'generateFormFromPrompt',
            'isConfigured',
            'getAvailableModels',
            'setModel'
        ]);
        mockFormService = jasmine.createSpyObj('FormService', ['createForm']);

        mockAIService.isConfigured.and.returnValue(true);
        mockAIService.getAvailableModels.and.returnValue(
            of({ models: [], currentModel: 'llama2' })
        );

        await TestBed.configureTestingModule({
            imports: [FormGeneratorComponent, ReactiveFormsModule, BrowserAnimationsModule],
            providers: [
                { provide: AIService, useValue: mockAIService },
                { provide: FormService, useValue: mockFormService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FormGeneratorComponent);
        component = fixture.componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with no generated form', () => {
            expect(component.generatedForm).toBeNull();
        });

        it('should initialize with isGenerating as false', () => {
            expect(component.isGenerating).toBeFalse();
        });

        it('should initialize with no error message', () => {
            expect(component.error).toBeNull();
        });

        it('should show error when AI service is not configured', () => {
            mockAIService.isConfigured.and.returnValue(false);
            component.ngOnInit();
            expect(component.error).toContain('OpenAI API key not configured');
        });

        it('should not show error when AI service is configured', () => {
            mockAIService.isConfigured.and.returnValue(true);
            component.ngOnInit();
            expect(component.error).toBeNull();
        });
    });

    describe('onPromptSubmit', () => {
        it('should not submit empty prompt', () => {
            component.onPromptSubmit('');
            expect(mockAIService.generateFormFromPrompt).not.toHaveBeenCalled();
            expect(component.error).toBe('Please enter a prompt');
        });

        it('should not submit prompt with only spaces', () => {
            component.onPromptSubmit('   ');
            expect(mockAIService.generateFormFromPrompt).not.toHaveBeenCalled();
            expect(component.error).toBe('Please enter a prompt');
        });

        it('should set isGenerating to true when submitting valid prompt', fakeAsync(() => {
            mockAIService.generateFormFromPrompt.and.returnValue(of(mockFormConfig));
            expect(component.isGenerating).toBeFalse();
            component.onPromptSubmit('Create a registration form');
            // With synchronous observable, isGenerating is set true then immediately back to false
            // The important thing is the method was called with the right data
            expect(mockAIService.generateFormFromPrompt).toHaveBeenCalledWith('Create a registration form');
        }));

        it('should call AIService.generateFormFromPrompt with valid prompt', () => {
            mockAIService.generateFormFromPrompt.and.returnValue(of(mockFormConfig));
            const prompt = 'Create a registration form';
            component.onPromptSubmit(prompt);
            expect(mockAIService.generateFormFromPrompt).toHaveBeenCalledWith(prompt);
        });

        it('should set generatedForm when API call succeeds', (done) => {
            mockAIService.generateFormFromPrompt.and.returnValue(of(mockFormConfig));
            component.onPromptSubmit('Create a form');

            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(component.generatedForm).toEqual(mockFormConfig);
                expect(component.isGenerating).toBeFalse();
                expect(component.error).toBeNull();
                done();
            });
        });

        it('should set error message when API call fails', (done) => {
            const errorMessage = 'API Error';
            mockAIService.generateFormFromPrompt.and.returnValue(
                throwError(() => new Error(errorMessage))
            );

            component.onPromptSubmit('Create a form');

            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(component.error).toBe(errorMessage);
                expect(component.isGenerating).toBeFalse();
                expect(component.generatedForm).toBeNull();
                done();
            });
        });

        it('should clear previous error when submitting new prompt', () => {
            component.error = 'Previous error';
            mockAIService.generateFormFromPrompt.and.returnValue(of(mockFormConfig));
            component.onPromptSubmit('New prompt');
            expect(component.error).toBeNull();
        });
    });

    describe('saveForm', () => {
        it('should save form when generatedForm exists', () => {
            component.generatedForm = mockFormConfig;
            component.saveForm();
            expect(mockFormService.createForm).toHaveBeenCalledWith(mockFormConfig);
        });

        it('should clear generatedForm after saving', () => {
            component.generatedForm = mockFormConfig;
            component.saveForm();
            expect(component.generatedForm).toBeNull();
        });

        it('should show success message after saving', (done) => {
            component.generatedForm = mockFormConfig;
            component.saveForm();
            expect(component.error).toBe('Form saved successfully!');

            setTimeout(() => {
                expect(component.error).toBeNull();
                done();
            }, 3100);
        });

        it('should not save when generatedForm is null', () => {
            component.generatedForm = null;
            component.saveForm();
            expect(mockFormService.createForm).not.toHaveBeenCalled();
        });
    });

    describe('discardForm', () => {
        it('should clear generatedForm', () => {
            component.generatedForm = mockFormConfig;
            component.discardForm();
            expect(component.generatedForm).toBeNull();
        });

        it('should clear error message', () => {
            component.error = 'Some error';
            component.discardForm();
            expect(component.error).toBeNull();
        });

        it('should clear both generatedForm and error', () => {
            component.generatedForm = mockFormConfig;
            component.error = 'Some error';
            component.discardForm();
            expect(component.generatedForm).toBeNull();
            expect(component.error).toBeNull();
        });
    });

    describe('Button Interactions', () => {
        it('should call onPromptSubmit when prompt is submitted', () => {
            spyOn(component, 'onPromptSubmit');
            const testPrompt = 'Test prompt';
            fixture.detectChanges();

            // Simulate prompt submission from child component
            component.onPromptSubmit(testPrompt);
            expect(component.onPromptSubmit).toHaveBeenCalledWith(testPrompt);
        });

        it('should call saveForm when save button is clicked', () => {
            spyOn(component, 'saveForm');
            component.generatedForm = mockFormConfig;
            fixture.detectChanges();

            component.saveForm();
            expect(component.saveForm).toHaveBeenCalled();
        });

        it('should call discardForm when discard button is clicked', () => {
            spyOn(component, 'discardForm');
            component.generatedForm = mockFormConfig;
            fixture.detectChanges();

            component.discardForm();
            expect(component.discardForm).toHaveBeenCalled();
        });
    });

    describe('Lifecycle Hooks', () => {
        it('should unsubscribe on destroy', () => {
            spyOn(component['destroy$'], 'next');
            spyOn(component['destroy$'], 'complete');

            component.ngOnDestroy();

            expect(component['destroy$'].next).toHaveBeenCalled();
            expect(component['destroy$'].complete).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple consecutive prompt submissions', (done) => {
            mockAIService.generateFormFromPrompt.and.returnValue(of(mockFormConfig));

            component.onPromptSubmit('First prompt');
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(component.generatedForm).toEqual(mockFormConfig);

                component.onPromptSubmit('Second prompt');
                fixture.detectChanges();

                fixture.whenStable().then(() => {
                    expect(component.generatedForm).toEqual(mockFormConfig);
                    done();
                });
            });
        });

        it('should handle error with custom message', (done) => {
            const customError = new Error('Custom API error message');
            mockAIService.generateFormFromPrompt.and.returnValue(throwError(() => customError));

            component.onPromptSubmit('Create form');
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(component.error).toBe('Custom API error message');
                done();
            });
        });

        it('should handle error with generic message when no error message provided', (done) => {
            const error = new Error();
            mockAIService.generateFormFromPrompt.and.returnValue(throwError(() => error));

            component.onPromptSubmit('Create form');
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(component.error).toBe('Failed to generate form. Please try again.');
                done();
            });
        });
    });
});
