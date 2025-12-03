import { Routes } from '@angular/router';
import { FormGeneratorComponent } from './features/form-generator/components/form-generator.component';
import { SettingsComponent } from './features/settings/components/settings.component';

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
        component: FormGeneratorComponent // Placeholder - will create forms list component later
    },
    {
        path: 'responses',
        component: FormGeneratorComponent // Placeholder - will create responses component later
    },
    {
        path: 'settings',
        component: SettingsComponent
    }
];
