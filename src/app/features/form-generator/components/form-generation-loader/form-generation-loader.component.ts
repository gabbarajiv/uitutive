import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

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
            </div>
        </div>
    `,
    styleUrl: './form-generation-loader.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGenerationLoaderComponent {
    currentStep = 1;
    dotsCount = 3;
    dotsArray = Array(5).fill(0);

    constructor() {
        // Simulate progress through steps
        this.animateProgress();
    }

    private animateProgress(): void {
        const interval = setInterval(() => {
            if (this.dotsCount < 5) {
                this.dotsCount++;
            } else {
                this.dotsCount = 0;
            }

            // Change steps periodically
            if (Math.random() > 0.7 && this.currentStep < 3) {
                this.currentStep++;
            }
        }, 400);
    }
}
