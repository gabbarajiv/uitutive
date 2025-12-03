import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-prompt-input',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
    ],
    templateUrl: './prompt-input.component.html',
    styleUrl: './prompt-input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptInputComponent {
    @Input() isLoading = false;
    @Output() promptSubmit = new EventEmitter<string>();

    prompt = '';

    submit(): void {
        if (this.prompt.trim()) {
            this.promptSubmit.emit(this.prompt);
        }
    }

    clearPrompt(): void {
        this.prompt = '';
    }
}
