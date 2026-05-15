export class Alert {
  id: number | null;
  sensorId: number | null;
  sensorName: string;
  location: string;
  type: string;
  severity: 'Crítica' | 'Advertencia' | string;
  message: string;
  timestamp: string;
  status: 'Activa' | 'Resuelta' | string;
  value: number;
  threshold: number;

  constructor(params: Partial<Alert> = {}) {
    this.id         = params.id         ?? null;
    this.sensorId   = params.sensorId   ?? null;
    this.sensorName = params.sensorName ?? '';
    this.location   = params.location   ?? '';
    this.type       = params.type       ?? '';
    this.severity   = params.severity   ?? '';
    this.message    = params.message    ?? '';
    this.timestamp  = params.timestamp  ?? '';
    this.status     = params.status     ?? '';
    this.value      = params.value      ?? 0;
    this.threshold  = params.threshold  ?? 0;
  }
}
