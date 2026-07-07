import { Injectable, computed, signal } from '@angular/core';

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
  status: 'Pendiente' | 'Entregado' | 'Cancelado';
  source: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceDesignService {
  destinations = signal<Destination[]>([
    {
      id: 1,
      name: 'Planta Norte',
      address: 'Av. Industrial 1250, Lima',
      description: 'Zona de tratamiento primario y distribución urbana.'
    },
    {
      id: 2,
      name: 'Reservorio Central',
      address: 'Sector 4, Callao',
      description: 'Almacenamiento y control de despacho.'
    },
    {
      id: 3,
      name: 'Sector Industrial',
      address: 'Parque Industrial Este',
      description: 'Punto de entrega para clientes industriales.'
    }
  ]);

  waterBatches = signal<WaterBatch[]>([
    {
      id: 1,
      certificationCode: 'CERT-2026-0001',
      destinationSectorId: 1,
      volumeLiters: 24000,
      deliveryTimestamp: new Date(Date.now() + 2 * 3600000).toISOString(),
      status: 'Pendiente',
      source: 'Planta de tratamiento'
    },
    {
      id: 2,
      certificationCode: 'CERT-2026-0002',
      destinationSectorId: 2,
      volumeLiters: 18500,
      deliveryTimestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'Entregado',
      source: 'Pozo certificado'
    },
    {
      id: 3,
      certificationCode: 'CERT-2026-0003',
      destinationSectorId: 3,
      volumeLiters: 32000,
      deliveryTimestamp: new Date(Date.now() + 86400000).toISOString(),
      status: 'Pendiente',
      source: 'Reservorio municipal'
    }
  ]);

  totalVolume = computed(() =>
    this.waterBatches().reduce((sum, batch) => sum + batch.volumeLiters, 0)
  );

  pendingCount = computed(() =>
    this.waterBatches().filter(batch => batch.status === 'Pendiente').length
  );

  destinationName(id: number): string {
    return this.destinations().find(destination => destination.id === Number(id))?.name ?? '-';
  }

  getWaterBatchById(id: number | string): WaterBatch | undefined {
    return this.waterBatches().find(batch => batch.id === Number(id));
  }

  addWaterBatch(batch: Omit<WaterBatch, 'id'>): void {
    const nextId = Math.max(0, ...this.waterBatches().map(item => item.id)) + 1;
    this.waterBatches.update(list => [...list, { ...batch, id: nextId }]);
  }

  updateWaterBatch(batch: WaterBatch): void {
    this.waterBatches.update(list =>
      list.map(item => item.id === batch.id ? batch : item)
    );
  }

  deleteWaterBatch(id: number): void {
    this.waterBatches.update(list => list.filter(batch => batch.id !== id));
  }

  addDestination(destination: Omit<Destination, 'id'>): void {
    const nextId = Math.max(0, ...this.destinations().map(item => item.id)) + 1;
    this.destinations.update(list => [...list, { ...destination, id: nextId }]);
  }

  deleteDestination(id: number): boolean {
    const inUse = this.waterBatches().some(batch => batch.destinationSectorId === id);
    if (inUse) return false;
    this.destinations.update(list => list.filter(destination => destination.id !== id));
    return true;
  }
}
