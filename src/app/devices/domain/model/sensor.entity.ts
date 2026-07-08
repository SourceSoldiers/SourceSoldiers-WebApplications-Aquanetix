export class Sensor {
  id: number | null;
  name: string;
  location: string;
  destinationId: number | null;
  type: string;
  currentValue: number;
  unit: string;
  status: 'Normal' | 'Advertencia' | 'Alerta';
  lastUpdated: string;
  recommendedRange: string;
  minAlert: number;
  maxAlert: number;
  history: number[];

  constructor(params: Partial<Sensor> = {}) {
    this.id              = params.id              ?? null;
    this.name            = params.name            ?? '';
    this.location        = params.location        ?? '';
    this.destinationId   = params.destinationId   ?? null;
    this.type            = params.type            ?? '';
    this.currentValue    = params.currentValue    ?? 0;
    this.unit            = params.unit            ?? '';
    this.status          = params.status          ?? 'Normal';
    this.lastUpdated     = params.lastUpdated     ?? '';
    this.recommendedRange = params.recommendedRange ?? '';
    this.minAlert        = params.minAlert        ?? 0;
    this.maxAlert        = params.maxAlert        ?? 0;
    this.history         = params.history         ?? [];
  }
}
