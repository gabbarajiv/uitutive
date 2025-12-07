import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiCallTrackerComponent } from './api-call-tracker.component';

describe('ApiCallTrackerComponent', () => {
    let component: ApiCallTrackerComponent;
    let fixture: ComponentFixture<ApiCallTrackerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ApiCallTrackerComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ApiCallTrackerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
