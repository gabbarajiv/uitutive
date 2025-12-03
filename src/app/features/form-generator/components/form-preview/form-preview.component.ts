import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormConfig } from '../../../../shared/models/form.model';

@Component({
    selector: 'app-form-preview',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
    ],
    templateUrl: './form-preview.component.html',
    styleUrl: './form-preview.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPreviewComponent implements OnInit {
    @Input() formConfig!: FormConfig;

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({});
    }

    ngOnInit(): void {
        this.buildForm();
    }

    private buildForm(): void {
        const group: any = {};
        this.formConfig.fields.forEach((field) => {
            group[field.name] = ['', field.required ? [] : []];
        });
        this.form = this.fb.group(group);
    }
}
