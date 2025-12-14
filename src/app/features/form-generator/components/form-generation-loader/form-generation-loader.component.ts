import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AIService } from '../../../../shared/services/ai.service';
import { ModelFactsService } from '../../../../shared/services/model-facts.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-form-generation-loader',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
    template: `
        <div class="loader-container">
            <div class="loader-content">
                <div class="spinner-wrapper">
                    <mat-spinner diameter="60" strokeWidth="4"></mat-spinner>
                </div>
                <h3 class="loader-title">Generating your form...</h3>
                <p class="loader-subtitle">AI is creating your form based on your prompt</p>
                
                <div class="loader-steps">
                    <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
                        <div class="step-number">
                            <span *ngIf="currentStep <= 1">1</span>
                            <mat-icon *ngIf="currentStep > 1">check</mat-icon>
                        </div>
                        <span class="step-label">Processing request</span>
                    </div>
                    
                    <div class="step-divider"></div>
                    
                    <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
                        <div class="step-number">
                            <span *ngIf="currentStep <= 2">2</span>
                            <mat-icon *ngIf="currentStep > 2">check</mat-icon>
                        </div>
                        <span class="step-label">Analyzing prompt</span>
                    </div>
                    
                    <div class="step-divider"></div>
                    
                    <div class="step" [class.active]="currentStep >= 3">
                        <div class="step-number">3</div>
                        <span class="step-label">Building form</span>
                    </div>
                </div>

                <div class="progress-dots">
                    <div class="dot" *ngFor="let dot of dotsArray; let i = index" [class.active]="i < dotsCount"></div>
                </div>

                <!-- Model Fact Section -->
                <div class="model-fact-section">
                    <div class="fact-container" [class.fade-out]="isFactChanging">
                        <div class="model-header">
                            <mat-icon class="model-icon">smart_toy</mat-icon>
                            <span class="model-name">{{ modelDisplayName }}</span>
                        </div>
                        <p class="model-fact">{{ currentFact }}</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrl: './form-generation-loader.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGenerationLoaderComponent implements OnInit, OnDestroy {
    currentStep = 1;
    dotsCount = 3;
    dotsArray = Array(5).fill(0);
    currentFact = '💡 AI models learn patterns from text to predict continuations.';
    modelDisplayName = 'AI Model';
    isFactChanging = false;

    private destroy$ = new Subject<void>();
    private progressInterval: any;
    private factInterval: any;
    private currentModelName = '';
    private factIndex = 0;

    constructor(
        private aiService: AIService,
        private modelFactsService: ModelFactsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Get current model and initialize facts
        this.aiService.getCurrentModel$()
            .pipe(takeUntil(this.destroy$))
            .subscribe((model: string) => {
                this.currentModelName = model;
                this.modelDisplayName = this.modelFactsService.getModelDisplayName(model);
                this.updateCurrentFact();
                this.cdr.markForCheck();
            });

        // Simulate progress through steps
        this.animateProgress();

        // Rotate facts every 4 seconds
        this.startFactRotation();
    }

    /**
     * Update the current displayed fact
     */
    private updateCurrentFact(): void {
        this.isFactChanging = true;
        this.cdr.markForCheck();
        setTimeout(() => {
            this.currentFact = this.modelFactsService.getFactByIndex(this.currentModelName, this.factIndex);
            this.factIndex++;
            this.isFactChanging = false;
            this.cdr.markForCheck();
        }, 300);
    }

    /**
     * Start rotating facts periodically
     */
    private startFactRotation(): void {
        this.factInterval = setInterval(() => {
            this.updateCurrentFact();
        }, 4000);
    }

    /**
     * Animate progress through steps
     */
    private animateProgress(): void {
        this.progressInterval = setInterval(() => {
            if (this.dotsCount < 5) {
                this.dotsCount++;
            } else {
                this.dotsCount = 0;
            }

            // Change steps periodically
            if (Math.random() > 0.7 && this.currentStep < 3) {
                this.currentStep++;
            }
            this.cdr.markForCheck();
        }, 400);
    }

    ngOnDestroy(): void {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        if (this.factInterval) {
            clearInterval(this.factInterval);
        }
        this.destroy$.next();
        this.destroy$.complete();
    }
}
