import { computed, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Destination {
  id: number;
  name: string;
  address: string;
  description: string;
}

export interface WaterBatch {
  id: number;
  certificationCode: string;
  destinationSectorId: number;
  volumeLiters: number;
  deliveryTimestamp: string;
  status: 'Pendiente' | 'Entregado' | 'Cancelado' | string;
  source: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceDesignService {
  readonly destinations = signal<Destination[]>([]);
  readonly waterBatches = signal<WaterBatch[]>([]);
  readonly loaded = signal(false);
  readonly error = signal('');

  readonly totalVolume = computed(() =>
    this.waterBatches().reduce((sum, batch) => sum + Number(batch.volumeLiters), 0)
  );
  readonly pendingCount = computed(() =>
    this.waterBatches().filter(batch =>
      ['pendiente', 'pending'].includes(batch.status.toLowerCase())
    ).length
  );

  constructor(private readonly http: HttpClient) {
    this.refresh();
  }

  refresh(): void {
    this.loaded.set(false);
    forkJoin({
      destinations: this.http.get<Destination[]>(`${environment.apiUrl}/destinations`),
      waterBatches: this.http.get<WaterBatch[]>(`${environment.apiUrl}/water-batches`)
    }).subscribe({
      next: ({ destinations, waterBatches }) => {
        this.destinations.set(destinations);
        this.waterBatches.set(waterBatches);
        this.loaded.set(true);
      },
      error: error => this.handleError(error)
    });
  }

  destinationName(id: number): string {
    return this.destinations().find(destination => destination.id === Number(id))?.name ?? '-';
  }

  getWaterBatchById(id: number | string): WaterBatch | undefined {
    return this.waterBatches().find(batch => batch.id === Number(id));
  }

  addWaterBatch(batch: Omit<WaterBatch, 'id'>): void {
    this.http.post<WaterBatch>(`${environment.apiUrl}/water-batches`, batch).subscribe({
      next: created => this.waterBatches.update(items => [...items, created]),
      error: error => this.handleError(error)
    });
  }

  updateWaterBatch(batch: WaterBatch): void {
    this.http.put<WaterBatch>(`${environment.apiUrl}/water-batches/${batch.id}`, batch).subscribe({
      next: updated => this.waterBatches.update(items =>
        items.map(item => item.id === updated.id ? updated : item)
      ),
      error: error => this.handleError(error)
    });
  }

  deleteWaterBatch(id: number): void {
    this.http.delete<void>(`${environment.apiUrl}/water-batches/${id}`).subscribe({
      next: () => this.waterBatches.update(items => items.filter(batch => batch.id !== id)),
      error: error => this.handleError(error)
    });
  }

  addDestination(destination: Omit<Destination, 'id'>): void {
    this.http.post<Destination>(`${environment.apiUrl}/destinations`, destination).subscribe({
      next: created => this.destinations.update(items => [...items, created]),
      error: error => this.handleError(error)
    });
  }

  deleteDestination(id: number): boolean {
    const inUse = this.waterBatches().some(batch => batch.destinationSectorId === id);
    if (inUse) return false;

    this.http.delete<void>(`${environment.apiUrl}/destinations/${id}`).subscribe({
      next: () => this.destinations.update(items =>
        items.filter(destination => destination.id !== id)
      ),
      error: error => this.handleError(error)
    });
    return true;
  }

  private handleError(error: unknown): void {
    const httpError = error as HttpErrorResponse;
    this.error.set(
      httpError?.error?.detail ||
      httpError?.error?.message ||
      httpError?.message ||
      'The request could not be completed.'
    );
    this.loaded.set(true);
  }
}
