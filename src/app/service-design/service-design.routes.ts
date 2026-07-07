import { Routes } from '@angular/router';

export const serviceDesignRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/views/water-batch-list/water-batch-list.component')
        .then(m => m.WaterBatchListComponent),
    title: 'Aquanetix - Water Batches'
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./presentation/views/water-batch-form/water-batch-form.component')
        .then(m => m.WaterBatchFormComponent),
    title: 'Aquanetix - New Water Batch'
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./presentation/views/water-batch-form/water-batch-form.component')
        .then(m => m.WaterBatchFormComponent),
    title: 'Aquanetix - Edit Water Batch'
  },
  {
    path: 'destinations',
    loadComponent: () =>
      import('./presentation/views/destination-manage/destination-manage.component')
        .then(m => m.DestinationManageComponent),
    title: 'Aquanetix - Destinations'
  }
];
