import { Routes } from '@angular/router';
import { FormGeneratorComponent } from './features/form-generator/components/form-generator.component';
import { SettingsComponent } from './features/settings/components/settings.component';
import { ResponseListComponent } from './features/response-management/components/response-list/response-list.component';
import { ResponseDetailComponent } from './features/response-management/components/response-detail/response-detail.component';
import { AnalyticsDashboardComponent } from './features/analytics/components/analytics-dashboard/analytics-dashboard.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/form-generator',
        pathMatch: 'full'
    },
    {
        path: 'form-generator',
        component: FormGeneratorComponent
    },
    {
        path: 'forms',
        component: FormGeneratorComponent
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
        path: 'settings',
        component: SettingsComponent
    },
    {
        path: '**',
        redirectTo: '/form-generator'
    }
];
