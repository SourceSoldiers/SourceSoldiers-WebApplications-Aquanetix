import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'monitoring',

    children: [

      {
        path: 'dashboard',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/dashboard-view/dashboard-view.component'
                ).then(m => m.DashboardViewComponent),

        title: 'Aquanetix - Dashboard'
      },

      {
        path: 'sensors',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/sensor-list/sensor-list.component'
                ).then(m => m.SensorListComponent),

        title: 'Aquanetix - Sensors'
      },

      {
        path: 'sensors/new',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/sensor-form/sensor-form.component'
                ).then(m => m.SensorFormComponent),

        title: 'Aquanetix - New Sensor'
      },

      {
        path: 'sensors/:id/edit',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/sensor-form/sensor-form.component'
                ).then(m => m.SensorFormComponent),

        title: 'Aquanetix - Edit Sensor'
      },

      {
        path: 'sensors/:id',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/sensor-detail/sensor-detail.component'
                ).then(m => m.SensorDetailComponent),

        title: 'Aquanetix - Sensor Detail'
      },

      {
        path: 'alerts',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/alert-list/alert-list.component'
                ).then(m => m.AlertListComponent),

        title: 'Aquanetix - Alerts'
      },

      {
        path: 'alerts/resolved',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/alert-resolved/alert-resolved.component'
                ).then(m => m.AlertResolvedComponent),

        title: 'Aquanetix - Alert History'
      },

      {
        path: 'subscription',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/subscription-view/subscription-view.component'
                ).then(m => m.SubscriptionViewComponent),

        title: 'Aquanetix - Subscription'
      },

      {
        path: 'subscription/change-plan',

        loadComponent: () =>
            import(
                './monitoring/presentation/views/change-plan/change-plan.component'
                ).then(m => m.ChangePlanComponent),

        title: 'Aquanetix - Change Plan'
      }
    ]
  },

  {
    path: '',

    redirectTo: '/monitoring/dashboard',

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