import { Routes } from '@angular/router';
import { FormGeneratorComponent } from './features/form-generator/components/form-generator.component';
import { MyFormsComponent } from './features/form-generator/components/my-forms/my-forms.component';
import { SettingsComponent } from './features/settings/components/settings.component';
import { ResponseListComponent } from './features/response-management/components/response-list/response-list.component';
import { ResponseDetailComponent } from './features/response-management/components/response-detail/response-detail.component';
import { AnalyticsDashboardComponent } from './features/analytics/components/analytics-dashboard/analytics-dashboard.component';
import { ApiCallTrackerComponent } from './features/analytics/components/api-call-tracker/api-call-tracker.component';
import { FormSubmissionComponent } from './features/public-submission/components/form-submission/form-submission.component';
import { SubmissionSuccessComponent } from './features/public-submission/components/submission-success/submission-success.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/form-generator',
        pathMatch: 'full'
    },
    {
        path: 'form-generator',
        component: FormGeneratorComponent,
        data: { title: 'AI Form Generator' }
    },
    {
        path: 'forms',
        component: MyFormsComponent,
        data: { title: 'My Forms' }
    },
    {
        path: 'responses',
        component: ResponseListComponent,
        data: { title: 'Form Responses' }
    },
    {
        path: 'responses/:id',
        component: ResponseDetailComponent,
        data: { title: 'Response Details' }
    },
    {
        path: 'analytics',
        component: AnalyticsDashboardComponent,
        data: { title: 'Analytics' }
    },
    {
        path: 'api-tracking',
        component: ApiCallTrackerComponent,
        data: { title: 'API Call Tracking' }
    },
    {
        path: 'settings',
        component: SettingsComponent,
        data: { title: 'Settings' }
    },
    {
        path: 'submit/:link',
        component: FormSubmissionComponent,
        data: { title: 'Form Submission' }
    },
    {
        path: 'submit/:link/success',
        component: SubmissionSuccessComponent,
        data: { title: 'Submission Success' }
    },
    {
        path: '**',
        redirectTo: '/form-generator'
    }
];
