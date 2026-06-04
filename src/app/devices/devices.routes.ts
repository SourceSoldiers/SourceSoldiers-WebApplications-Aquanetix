import { Routes } from '@angular/router';

export const devicesRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./presentation/views/sensor-list/sensor-list.component')
                .then(m => m.SensorListComponent),
        title: 'Aquanetix - Sensors'
    },

    {
        path: 'new',
        loadComponent: () =>
            import('./presentation/views/sensor-form/sensor-form.component')
                .then(m => m.SensorFormComponent),
        title: 'Aquanetix - New Sensor'
    },

    {
        path: ':id/edit',
        loadComponent: () =>
            import('./presentation/views/sensor-form/sensor-form.component')
                .then(m => m.SensorFormComponent),
        title: 'Aquanetix - Edit Sensor'
    },

    {
        path: ':id',
        loadComponent: () =>
            import('./presentation/views/sensor-detail/sensor-detail.component')
                .then(m => m.SensorDetailComponent),
        title: 'Aquanetix - Sensor Detail'
    }
];