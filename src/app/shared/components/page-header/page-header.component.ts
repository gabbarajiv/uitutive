import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [CommonModule, MatDividerModule, MatIconModule],
    templateUrl: './page-header.component.html',
    styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() icon: string = '';
}
