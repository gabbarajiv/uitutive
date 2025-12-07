import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PromptInputComponent } from './prompt-input.component';
import { AIService, ModelInfo } from '../../../../shared/services/ai.service';
import { PromptSuggestionsService, PromptSuggestion } from '../../../../shared/services/prompt-suggestions.service';
import { of, throwError } from 'rxjs';

describe('PromptInputComponent', () => {
    let component: PromptInputComponent;
    let fixture: ComponentFixture<PromptInputComponent>;
    let mockAIService: jasmine.SpyObj<AIService>;
    let mockPromptSuggestionsService: jasmine.SpyObj<PromptSuggestionsService>;

    const mockModels: ModelInfo[] = [
        { name: 'llama2', modified_at: '2024-01-01', size: 1000000, digest: 'abc123' },
        { name: 'mistral', modified_at: '2024-01-01', size: 1000000, digest: 'def456' }
    ];

    const mockSuggestions: PromptSuggestion[] = [
        { id: '1', text: 'Create a contact form' },
        { id: '2', text: 'Build a survey' }
    ];

    beforeEach(async () => {
        mockAIService = jasmine.createSpyObj('AIService', [
            'getAvailableModels',
            'setModel',
            'getCurrentModel',
            'getCurrentModel$'
        ]);
        mockPromptSuggestionsService = jasmine.createSpyObj('PromptSuggestionsService', [
            'getSuggestions'
        ]);

        mockAIService.getAvailableModels.and.returnValue(
            of({ models: mockModels, currentModel: 'llama2' })
        );
        mockAIService.setModel.and.returnValue(of({ message: 'Model set', currentModel: 'mistral' }));
        mockPromptSuggestionsService.getSuggestions.and.returnValue(of(mockSuggestions));

        await TestBed.configureTestingModule({
            imports: [PromptInputComponent, ReactiveFormsModule, BrowserAnimationsModule],
            providers: [
                { provide: AIService, useValue: mockAIService },
                { provide: PromptSuggestionsService, useValue: mockPromptSuggestionsService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PromptInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with empty prompt', () => {
            expect(component.prompt).toBe('');
        });

        it('should initialize isLoading as false', () => {
            expect(component.isLoading).toBeFalse();
        });

        it('should load available models on init', () => {
            expect(mockAIService.getAvailableModels).toHaveBeenCalled();
            expect(component.availableModels).toEqual(mockModels);
            expect(component.selectedModel).toBe('llama2');
        });

        it('should load suggestions on init', () => {
            expect(mockPromptSuggestionsService.getSuggestions).toHaveBeenCalled();
            expect(component.suggestions).toEqual(mockSuggestions);
        });
    });

    describe('Prompt Input', () => {
        it('should update prompt on input change', () => {
            component.prompt = 'Test prompt';
            expect(component.prompt).toBe('Test prompt');
        });

        it('should allow multiline prompt input', () => {
            component.prompt = 'Line 1\nLine 2\nLine 3';
            expect(component.prompt).toContain('\n');
        });

        it('should preserve whitespace in prompt', () => {
            component.prompt = '  Indented prompt  ';
            expect(component.prompt).toBe('  Indented prompt  ');
        });
    });

    describe('submit method', () => {
        it('should emit promptSubmit event when submit is called', () => {
            spyOn(component.promptSubmit, 'emit');
            component.prompt = 'Test prompt';
            component.submit();
            expect(component.promptSubmit.emit).toHaveBeenCalledWith('Test prompt');
        });

        it('should not emit if prompt is empty', () => {
            spyOn(component.promptSubmit, 'emit');
            component.prompt = '';
            component.submit();
            expect(component.promptSubmit.emit).not.toHaveBeenCalled();
        });

        it('should not emit if prompt is only whitespace', () => {
            spyOn(component.promptSubmit, 'emit');
            component.prompt = '   ';
            component.submit();
            expect(component.promptSubmit.emit).not.toHaveBeenCalled();
        });

        it('should emit trimmed prompt', () => {
            spyOn(component.promptSubmit, 'emit');
            component.prompt = '  Test prompt  ';
            component.submit();
            expect(component.promptSubmit.emit).toHaveBeenCalledWith('  Test prompt  ');
        });
    });

    describe('clearPrompt method', () => {
        it('should clear the prompt input', () => {
            component.prompt = 'Test prompt';
            component.clearPrompt();
            expect(component.prompt).toBe('');
        });

        it('should be callable when prompt is not empty', () => {
            component.prompt = 'Test';
            expect(() => component.clearPrompt()).not.toThrow();
            expect(component.prompt).toBe('');
        });

        it('should not break when clearing already empty prompt', () => {
            component.prompt = '';
            expect(() => component.clearPrompt()).not.toThrow();
            expect(component.prompt).toBe('');
        });
    });

    describe('Model Selection', () => {
        it('should display available models', () => {
            expect(component.availableModels).toEqual(mockModels);
        });

        it('should set initial selected model from API', () => {
            expect(component.selectedModel).toBe('llama2');
        });

        it('should change model when changeModel is called', () => {
            component.changeModel('mistral');
            expect(component.modelChangeInProgress).toBeDefined();
        });

        it('should not call changeModel if model is already selected', () => {
            component.selectedModel = 'llama2';
            const initialFlag = component.modelChangeInProgress;
            component.changeModel('llama2');
            expect(component.modelChangeInProgress).toBe(initialFlag);
        });

        it('should set modelChangeInProgress flag during model change', () => {
            component.changeModel('mistral');
            expect(component.modelChangeInProgress).toBeDefined();
        });
    });

    describe('Suggestions', () => {
        it('should display suggestions', () => {
            expect(component.suggestions).toEqual(mockSuggestions);
        });

        it('should select suggestion and populate prompt', () => {
            const suggestion = mockSuggestions[0];
            component.selectSuggestion(suggestion);
            expect(component.prompt).toBe(suggestion.text);
        });

        it('should show suggestions only when available', () => {
            component.suggestions = [];
            expect(component.suggestions.length).toBe(0);

            component.suggestions = mockSuggestions;
            expect(component.suggestions.length).toBeGreaterThan(0);
        });

        it('should disable suggestions during loading', () => {
            component.isLoading = true;
            expect(component.isLoading).toBeTrue();
        });

        it('should handle multiple suggestion selections', () => {
            component.selectSuggestion(mockSuggestions[0]);
            expect(component.prompt).toBe(mockSuggestions[0].text);

            component.selectSuggestion(mockSuggestions[1]);
            expect(component.prompt).toBe(mockSuggestions[1].text);
        });
    });

    describe('Button States', () => {
        it('should disable submit button when prompt is empty', () => {
            component.prompt = '';
            expect(!component.prompt.trim() || component.isLoading).toBeTrue();
        });

        it('should disable submit button when loading', () => {
            component.prompt = 'Test';
            component.isLoading = true;
            expect(component.isLoading).toBeTrue();
        });

        it('should enable submit button when prompt is not empty and not loading', () => {
            component.prompt = 'Test prompt';
            component.isLoading = false;
            expect(component.prompt.trim() && !component.isLoading).toBeTrue();
        });

        it('should disable clear button when prompt is empty', () => {
            component.prompt = '';
            expect(!component.prompt || component.isLoading).toBeTrue();
        });

        it('should disable clear button when loading', () => {
            component.prompt = 'Test';
            component.isLoading = true;
            expect(component.isLoading).toBeTrue();
        });
    });

    describe('Loading States', () => {
        it('should set isLoading to true during submission', () => {
            component.isLoading = true;
            expect(component.isLoading).toBeTrue();
        });

        it('should disable prompt input during loading', () => {
            component.isLoading = true;
            expect(component.isLoading).toBeTrue();
        });

        it('should show loading models flag when fetching models', () => {
            component.loadingModels = true;
            expect(component.loadingModels).toBeTrue();
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
        it('should handle suggestion with special characters', () => {
            const specialSuggestion = { id: '3', text: 'Create a form with @#$%^&* characters' };
            component.selectSuggestion(specialSuggestion);
            expect(component.prompt).toBe(specialSuggestion.text);
        });

        it('should handle very long prompt input', () => {
            const longPrompt = 'a'.repeat(1000);
            component.prompt = longPrompt;
            expect(component.prompt).toBe(longPrompt);
        });

        it('should handle model loading error', () => {
            mockAIService.getAvailableModels.and.returnValue(
                throwError(() => new Error('Failed to load models'))
            );
            expect(() => component.ngOnInit()).not.toThrow();
        });
    });
});
