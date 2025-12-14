import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-submission-success',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
    templateUrl: './submission-success.component.html',
    styleUrls: ['./submission-success.component.scss']
})
export class SubmissionSuccessComponent implements OnInit {
    formLink: string = '';

    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.formLink = params['link'];
        });
    }

    submitAnother(): void {
        if (this.formLink) {
            this.router.navigate(['/submit', this.formLink]);
        }
    }

    goHome(): void {
        this.router.navigate(['/']);
    }
}
