import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'dashboard',
    loadChildren: () =>
        import('./dashboard/dashboard.routes')
            .then(m => m.dashboardRoutes)
  },

  {
    path: 'devices',
    loadChildren: () =>
        import('./devices/devices.routes')
            .then(m => m.devicesRoutes)
  },

  {
    path: 'monitoring',
    loadChildren: () =>
        import('./monitoring/monitoring.routes')
            .then(m => m.monitoringRoutes)
  },

  {
    path: 'subscription',
    loadChildren: () =>
        import('./subscriptions/subscriptions.routes')
            .then(m => m.subscriptionsRoutes)
  },

  {
    path: 'service-design',
    loadChildren: () =>
        import('./service-design/service-design.routes')
            .then(m => m.serviceDesignRoutes)
  },

  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  {
    path: '**',
    loadComponent: () =>
        import(
            './shared/presentation/components/page-not-found/page-not-found.component'
            ).then(m => m.PageNotFoundComponent),
    title: 'Aquanetix - Page Not Found'
  }
];
