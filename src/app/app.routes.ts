import { Routes } from '@angular/router';
import { authGuard } from './iam/infrastructure/auth.guard';

export const routes: Routes = [
  {
    path: 'iam',
    loadChildren: () =>
      import('./iam/iam.routes').then(m => m.iamRoutes)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
        import('./dashboard/dashboard.routes')
            .then(m => m.dashboardRoutes)
  },

  {
    path: 'devices',
    canActivate: [authGuard],
    loadChildren: () =>
        import('./devices/devices.routes')
            .then(m => m.devicesRoutes)
  },

  {
    path: 'monitoring',
    canActivate: [authGuard],
    loadChildren: () =>
        import('./monitoring/monitoring.routes')
            .then(m => m.monitoringRoutes)
  },

  {
    path: 'subscription',
    canActivate: [authGuard],
    loadChildren: () =>
        import('./subscriptions/subscriptions.routes')
            .then(m => m.subscriptionsRoutes)
  },

  {
    path: 'service-design',
    canActivate: [authGuard],
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
