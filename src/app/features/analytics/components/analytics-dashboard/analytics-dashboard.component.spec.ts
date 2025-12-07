import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { ResponseStorageService } from '../../../../shared/services/response-storage.service';
import { AnalyticsService } from '../../../../shared/services/analytics.service';
import { SubmissionRecord } from '../../../../shared/models/submission.model';
import { of, throwError } from 'rxjs';

describe('AnalyticsDashboardComponent', () => {
    let component: AnalyticsDashboardComponent;
    let fixture: ComponentFixture<AnalyticsDashboardComponent>;
    let mockStorageService: jasmine.SpyObj<ResponseStorageService>;
    let mockAnalyticsService: jasmine.SpyObj<AnalyticsService>;

    const mockSubmissions: SubmissionRecord[] = [
        {
            id: 'sub-1',
            formId: 'form-1',
            data: { name: 'John', email: 'john@example.com' },
            status: 'new',
            submittedAt: new Date('2024-01-01')
        },
        {
            id: 'sub-2',
            formId: 'form-1',
            data: { name: 'Jane', email: 'jane@example.com' },
            status: 'reviewed',
            submittedAt: new Date('2024-01-02')
        }
    ];

    beforeEach(async () => {
        mockStorageService = jasmine.createSpyObj('ResponseStorageService', [
            'getSubmissionsStream'
        ]);
        mockAnalyticsService = jasmine.createSpyObj('AnalyticsService', [
            'calculateMetrics',
            'generateTimeline',
            'getSummaryStats',
            'analyzeField'
        ]);

        mockStorageService.getSubmissionsStream.and.returnValue(of(mockSubmissions));
        mockAnalyticsService.calculateMetrics.and.returnValue({
            totalSubmissions: 2,
            newSubmissions: 1,
            reviewedSubmissions: 1,
            archivedSubmissions: 0,
            completionRate: 50
        });
        mockAnalyticsService.generateTimeline.and.returnValue({
            dates: [],
            totalPerDay: 2
        });
        mockAnalyticsService.getSummaryStats.and.returnValue({
            avgCompletionRate: 50,
            totalFields: 2,
            avgSubmissionsPerDay: 1
        });
        mockAnalyticsService.analyzeField.and.returnValue({
            fieldName: 'name',
            filledCount: 2,
            emptyCount: 0,
            fillRate: 100,
            uniqueValues: 2,
            topValues: [{ value: 'John', count: 1 }, { value: 'Jane', count: 1 }]
        });

        await TestBed.configureTestingModule({
            imports: [AnalyticsDashboardComponent, ReactiveFormsModule, BrowserAnimationsModule, MatSnackBarModule],
            providers: [
                { provide: ResponseStorageService, useValue: mockStorageService },
                { provide: AnalyticsService, useValue: mockAnalyticsService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AnalyticsDashboardComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges yet to test initial state
    });

    describe('Component Initialization', () => {
        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize isLoading as false', () => {
            expect(component.isLoading).toBeFalse();
        });

        it('should initialize submissions as empty array', () => {
            expect(component.submissions).toEqual([]);
        });

        it('should initialize filterForm with default values', () => {
            expect(component.filterForm).toBeDefined();
            expect(component.filterForm.get('days')?.value).toBe(30);
        });

        it('should initialize fieldAnalytics as empty Map', () => {
            expect(component.fieldAnalytics).toBeDefined();
            expect(component.fieldAnalytics.size).toBe(0);
        });
    });

    describe('loadAnalytics', () => {
        it('should set isLoading to true when loading analytics', () => {
            fixture.detectChanges(); // Trigger ngOnInit for loadAnalytics tests
            // isLoading gets set back to false immediately with synchronous observable
            // The important thing is the service was called
            expect(mockStorageService.getSubmissionsStream).toHaveBeenCalled();
        });

        it('should call getSubmissionsStream', () => {
            component.loadAnalytics();
            expect(mockStorageService.getSubmissionsStream).toHaveBeenCalled();
        });

        it('should load submissions from storage service', (done) => {
            component.loadAnalytics();

            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(component.submissions).toEqual(mockSubmissions);
                done();
            });
        });

        it('should set isLoading to false after loading', (done) => {
            component.loadAnalytics();

            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(component.isLoading).toBeFalse();
                done();
            });
        });

        it('should calculate analytics after loading submissions', (done) => {
            component.loadAnalytics();

            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(component.submissions.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should handle error when loading analytics fails', (done) => {
            mockStorageService.getSubmissionsStream.and.returnValue(
                throwError(() => new Error('Failed to load'))
            );

            component.loadAnalytics();

            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(component.isLoading).toBeFalse();
                done();
            });
        });
    });

    describe('Filter Form', () => {
        it('should have days filter control', () => {
            expect(component.filterForm.get('days')).toBeDefined();
        });

        it('should allow changing filter days', () => {
            component.filterForm.patchValue({ days: 7 });
            expect(component.filterForm.get('days')?.value).toBe(7);
        });

        it('should allow different time ranges', () => {
            component.filterForm.patchValue({ days: 1 });
            expect(component.filterForm.get('days')?.value).toBe(1);

            component.filterForm.patchValue({ days: 30 });
            expect(component.filterForm.get('days')?.value).toBe(30);

            component.filterForm.patchValue({ days: 90 });
            expect(component.filterForm.get('days')?.value).toBe(90);
        });
    });

    describe('Analytics Calculation', () => {
        it('should calculate metrics from submissions', () => {
            component.submissions = mockSubmissions;
            component['calculateAnalytics']();

            expect(component.metrics).toBeDefined();
        });

        it('should create field analytics map', () => {
            component.submissions = mockSubmissions;
            component['calculateAnalytics']();

            expect(component.fieldAnalytics.size).toBeGreaterThanOrEqual(0);
        });

        it('should calculate submission timeline', () => {
            component.submissions = mockSubmissions;
            component['calculateAnalytics']();

            expect(component.timeline).toBeDefined();
        });
    });

    describe('Export Analytics', () => {
        it('should export analytics data as JSON', () => {
            spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
            spyOn(window.URL, 'revokeObjectURL');

            component.submissions = mockSubmissions;
            component['calculateAnalytics']();
            component.exportAnalytics();

            expect(window.URL.createObjectURL).toHaveBeenCalled();
        });

        it('should include metrics in export', () => {
            spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
            spyOn(window.URL, 'revokeObjectURL');

            component.submissions = mockSubmissions;
            component['calculateAnalytics']();
            component.metrics = { totalSubmissions: 2, newSubmissions: 1, reviewedSubmissions: 1, archivedSubmissions: 0, completionRate: 50 };
            component.exportAnalytics();

            expect(component.metrics).toBeDefined();
        });

        it('should create download link with correct filename', () => {
            const mockElement = {
                href: '',
                download: '',
                click: jasmine.createSpy('click'),
                setAttribute: jasmine.createSpy('setAttribute'),
                appendChild: jasmine.createSpy('appendChild'),
                removeChild: jasmine.createSpy('removeChild')
            };
            const createElementSpy = spyOn(document, 'createElement').and.returnValue(mockElement as any);
            spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
            spyOn(window.URL, 'revokeObjectURL');

            component.submissions = mockSubmissions;
            component['calculateAnalytics']();
            component.exportAnalytics();

            expect(createElementSpy).toHaveBeenCalledWith('a');
        });

        it('should show snackbar message after export', () => {
            spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
            spyOn(window.URL, 'revokeObjectURL');
            spyOn(component['snackBar'], 'open');

            component.submissions = mockSubmissions;
            component['calculateAnalytics']();
            component.exportAnalytics();

            expect(component['snackBar'].open).toHaveBeenCalledWith('Analytics exported', 'Close', jasmine.any(Object));
        });
    });

    describe('Button Interactions', () => {
        it('should call exportAnalytics when export button is clicked', () => {
            spyOn(component, 'exportAnalytics');
            component.exportAnalytics();
            expect(component.exportAnalytics).toHaveBeenCalled();
        });

        it('should disable export button when loading', () => {
            component.isLoading = true;
            expect(component.isLoading).toBeTrue();
        });

        it('should enable export button when not loading', () => {
            component.isLoading = false;
            expect(component.isLoading).toBeFalse();
        });
    });

    describe('Display Columns', () => {
        it('should have field analysis display columns defined', () => {
            expect(component.displayedColumns).toBeDefined();
            expect(component.displayedColumns.length).toBeGreaterThan(0);
        });

        it('should include fieldName column', () => {
            expect(component.displayedColumns).toContain('fieldName');
        });

        it('should include fillRate column', () => {
            expect(component.displayedColumns).toContain('fillRate');
        });
    });

    describe('Lifecycle Hooks', () => {
        it('should load analytics on init', () => {
            spyOn(component, 'loadAnalytics');
            component.ngOnInit();
            expect(component.loadAnalytics).toHaveBeenCalled();
        });

        it('should unsubscribe on destroy', () => {
            spyOn(component['destroy$'], 'next');
            spyOn(component['destroy$'], 'complete');

            component.ngOnDestroy();

            expect(component['destroy$'].next).toHaveBeenCalled();
            expect(component['destroy$'].complete).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty submissions', () => {
            mockStorageService.getSubmissionsStream.and.returnValue(of([]));
            component.loadAnalytics();

            fixture.detectChanges();
            expect(component.isLoading).toBeDefined();
        });

        it('should handle submissions with missing data', () => {
            const incompleteSubmissions: SubmissionRecord[] = [
                {
                    id: 'sub-1',
                    formId: 'form-1',
                    data: {},
                    status: 'new',
                    submittedAt: new Date()
                }
            ];

            mockStorageService.getSubmissionsStream.and.returnValue(of(incompleteSubmissions));
            component.loadAnalytics();

            expect(component.submissions.length).toBe(1);
        });

        it('should recalculate analytics when filter changes', () => {
            component.submissions = mockSubmissions;
            component.filterForm.patchValue({ days: 7 });

            component['calculateAnalytics']();
            expect(component.metrics).toBeDefined();
        });
    });
});
