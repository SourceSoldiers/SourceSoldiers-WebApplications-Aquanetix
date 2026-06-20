import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./presentation/views/dashboard-view/dashboard-view.component')
                .then(m => m.DashboardViewComponent),
        title: 'Aquanetix - Dashboard'
    },
];
