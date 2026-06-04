import { Routes } from '@angular/router';

export const monitoringRoutes: Routes = [
    {
        path: 'alerts',
        loadComponent: () =>
            import('./presentation/views/alert-list/alert-list.component')
                .then(m => m.AlertListComponent),
        title: 'Aquanetix - Alerts'
    },

    {
        path: 'alerts/resolved',
        loadComponent: () =>
            import('./presentation/views/alert-resolved/alert-resolved.component')
                .then(m => m.AlertResolvedComponent),
        title: 'Aquanetix - Alert History'
    }
];
