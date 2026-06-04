import { Routes } from '@angular/router';

export const subscriptionsRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./presentation/views/subscription-view/subscription-view.component')
                .then(m => m.SubscriptionViewComponent),
        title: 'Aquanetix - Subscription'
    },

    {
        path: 'change-plan',
        loadComponent: () =>
            import('./presentation/views/change-plan/change-plan.component')
                .then(m => m.ChangePlanComponent),
        title: 'Aquanetix - Change Plan'
    }
];