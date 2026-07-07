import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { Sensor } from '../../devices/domain/model/sensor.entity';
import { Alert } from '../domain/model/alert.entity';
import { Subscription } from '../../subscriptions/domain/model/subscription.entity';

import { SensorAssembler } from '../../devices/infrastructure/sensor.assembler';
import { AlertAssembler } from '../infrastructure/alert.assembler';

import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';

const MOCK_SENSORS: Sensor[] = [
  new Sensor({
    id: 1,
    name: 'SENSOR-01',
    location: 'Planta Norte',
    type: 'pH',
    currentValue: 7.2,
    unit: 'pH',
    status: 'Normal',
    lastUpdated: new Date().toISOString(),
    recommendedRange: '6.5 - 8.5 pH',
    minAlert: 6.5,
    maxAlert: 8.5,
    history: [7.0, 7.1, 7.3, 7.2, 7.4, 7.1, 7.2]
  }),
  new Sensor({
    id: 2,
    name: 'SENSOR-02',
    location: 'Reservorio Central',
    type: 'Turbidez',
    currentValue: 5.8,
    unit: 'NTU',
    status: 'Advertencia',
    lastUpdated: new Date().toISOString(),
    recommendedRange: '0 - 5 NTU',
    minAlert: 0,
    maxAlert: 5,
    history: [3.2, 4.1, 4.8, 5.1, 5.4, 5.6, 5.8]
  }),
  new Sensor({
    id: 3,
    name: 'SENSOR-03',
    location: 'Sector Industrial',
    type: 'Cloro',
    currentValue: 0.1,
    unit: 'ppm',
    status: 'Alerta',
    lastUpdated: new Date().toISOString(),
    recommendedRange: '0.2 - 1 ppm',
    minAlert: 0.2,
    maxAlert: 1,
    history: [0.8, 0.6, 0.5, 0.3, 0.2, 0.14, 0.1]
  }),
  new Sensor({
    id: 4,
    name: 'SENSOR-04',
    location: 'Planta Sur',
    type: 'Temperatura',
    currentValue: 24.6,
    unit: 'C',
    status: 'Normal',
    lastUpdated: new Date().toISOString(),
    recommendedRange: '18 - 28 C',
    minAlert: 18,
    maxAlert: 28,
    history: [23.7, 24.0, 24.2, 24.1, 24.3, 24.5, 24.6]
  })
];

const MOCK_ALERTS: Alert[] = [
  new Alert({
    id: 1,
    sensorId: 3,
    sensorName: 'SENSOR-03',
    location: 'Sector Industrial',
    type: 'Cloro',
    severity: 'Crítica',
    message: 'El dispositivo SENSOR-03 (Cloro) superó el umbral permitido.',
    timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
    status: 'Activa',
    value: 0.1,
    threshold: 0.2
  }),
  new Alert({
    id: 2,
    sensorId: 2,
    sensorName: 'SENSOR-02',
    location: 'Reservorio Central',
    type: 'Turbidez',
    severity: 'Advertencia',
    message: 'El dispositivo SENSOR-02 (Turbidez) se encuentra cerca del límite.',
    timestamp: new Date(Date.now() - 85 * 60000).toISOString(),
    status: 'Activa',
    value: 5.8,
    threshold: 5
  }),
  new Alert({
    id: 3,
    sensorId: 1,
    sensorName: 'SENSOR-01',
    location: 'Planta Norte',
    type: 'pH',
    severity: 'Advertencia',
    message: 'Oscilación de pH estabilizada en Planta Norte.',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'Resuelta',
    value: 6.4,
    threshold: 6.5
  })
];

const MOCK_PLANS = [
  {
    name: 'Monitoreo Base',
    tier: 'Operaciones iniciales',
    monthlyPrice: 350,
    annualMonthlyPrice: 290,
    monthlyCost: 350,
    maxDevices: 10,
    isUnlimited: false,
    features: ['Hasta 10 dispositivos', 'Alertas esenciales', 'Historial de 30 días']
  },
  {
    name: 'Operador Integral',
    tier: 'Equipos en crecimiento',
    monthlyPrice: 1200,
    annualMonthlyPrice: 990,
    monthlyCost: 1200,
    maxDevices: 50,
    isUnlimited: false,
    highlight: true,
    features: ['Hasta 50 dispositivos', 'Analítica de calidad', 'Exportación de reportes']
  },
  {
    name: 'Smart City / Industrial',
    tier: 'Operación avanzada',
    monthlyPrice: 3500,
    annualMonthlyPrice: 2900,
    monthlyCost: 3500,
    maxDevices: null,
    isUnlimited: true,
    features: ['Dispositivos ilimitados', 'Soporte prioritario', 'Integraciones avanzadas']
  }
];

const MOCK_SUBSCRIPTION: Subscription = {
  id: 1,
  plan: 'Operador Integral',
  tier: 'Equipos en crecimiento',
  price: 1200,
  currency: 'PEN',
  billingCycle: 'monthly',
  status: 'Active',
  startDate: '2026-03-15',
  nextBillingDate: '2026-08-15',
  paymentMethod: 'Visa **** 2048',
  features: MOCK_PLANS[1].features,
  usage: {
    sensorsConnected: 4,
    sensorsLimit: 50,
    storageUsedGB: 18,
    storageLimitGB: 100,
    exports: 9,
    exportsLimit: 100
  }
};

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  private sensorsEndpoint: BaseEndpoint<Sensor>;

  private alertsEndpoint: BaseEndpoint<Alert>;

  private subscriptionEndpoint: BaseEndpoint<Subscription>;

  private plansEndpoint: BaseEndpoint<any>;

  sensors = signal<Sensor[]>([]);

  alerts = signal<Alert[]>([]);

  subscription = signal<Subscription | null>(null);

  plans = signal<any[]>([]);

  errors = signal<string[]>([]);

  sensorsLoaded = signal(false);

  alertsLoaded = signal(false);

  subscriptionLoaded = signal(false);

  plansLoaded = signal(false);

  activeSensorsCount = computed(() =>

      this.sensors()
          .filter(s => s.status !== 'Alerta')
          .length
  );

  criticalAlertsCount = computed(() =>

      this.alerts()
          .filter(
              a =>
                  a.severity === 'Crítica' &&
                  a.status === 'Activa'
          )
          .length
  );

  activeAlerts = computed(() =>

      this.alerts()
          .filter(a => a.status === 'Activa')
  );

  constructor(private http: HttpClient) {

    const base = environment.apiUrl;

    const subscriptionBase =
        environment.subscriptionApiUrl;

    this.sensorsEndpoint =
        new BaseEndpoint(
            http,
            base,
            environment.sensorsEndpoint
        );

    this.alertsEndpoint =
        new BaseEndpoint(
            http,
            base,
            environment.alertsEndpoint
        );

    this.subscriptionEndpoint =
        new BaseEndpoint(
            http,
            subscriptionBase,
            environment.subscriptionEndpoint
        );

    this.plansEndpoint =
        new BaseEndpoint(
            http,
            subscriptionBase,
            environment.plansEndpoint
        );
  }

  fetchSensors(): void {
    if (!environment.apiUrl) {
      this.sensors.set(MOCK_SENSORS);
      this.sensorsLoaded.set(true);
      return;
    }

    this.sensorsEndpoint.getAll().subscribe({

      next: (data) => {

        this.sensors.set(
            SensorAssembler.toEntitiesFromArray(data)
        );

        this.sensorsLoaded.set(true);
      },

      error: (err) => {

        this.sensors.set(MOCK_SENSORS);
        this.sensorsLoaded.set(true);

        this.errors.update(e => [
          ...e,
          err.message
        ]);
      }
    });
  }

  getSensorById(id: string | number): Sensor | undefined {

    return this.sensors().find(
        s => Number(s.id) === Number(id)
    );
  }

  addSensor(sensor: Sensor): void {
    if (!environment.apiUrl) {
      const nextId = Math.max(0, ...this.sensors().map(item => Number(item.id ?? 0))) + 1;
      this.sensors.update(list => [...list, new Sensor({ ...sensor, id: nextId })]);
      return;
    }

    this.sensorsEndpoint.create(sensor).subscribe({

      next: (created) => {

        this.sensors.update(list => [

          ...list,

          SensorAssembler
              .toEntityFromResource(created)
        ]);
      },

      error: (err) => {

        this.errors.update(e => [
          ...e,
          err.message
        ]);
      }
    });
  }

  updateSensor(sensor: Sensor): void {
    if (!environment.apiUrl) {
      this.sensors.update(list =>
          list.map(item => item.id === sensor.id ? new Sensor(sensor) : item)
      );
      return;
    }

    this.sensorsEndpoint
        .update(sensor.id!, sensor)
        .subscribe({

          next: (updated) => {

            const entity =
                SensorAssembler
                    .toEntityFromResource(updated);

            this.sensors.update(list =>

                list.map(s =>

                    s.id === entity.id
                        ? entity
                        : s
                )
            );
          },

          error: (err) => {

            this.errors.update(e => [
              ...e,
              err.message
            ]);
          }
        });
  }

  deleteSensor(id: number): void {
    if (!environment.apiUrl) {
      this.sensors.update(list => list.filter(sensor => sensor.id !== id));
      return;
    }

    this.sensorsEndpoint
        .delete(id)
        .subscribe({

          next: () => {

            this.sensors.update(list =>

                list.filter(
                    sensor => sensor.id !== id
                )
            );
          },

          error: (err) => {

            this.errors.update(e => [
              ...e,
              err.message
            ]);
          }
        });
  }

  fetchAlerts(): void {
    if (!environment.apiUrl) {
      this.alerts.set(MOCK_ALERTS);
      this.alertsLoaded.set(true);
      return;
    }

    this.alertsEndpoint.getAll().subscribe({

      next: (data) => {

        this.alerts.set(
            AlertAssembler.toEntitiesFromArray(data)
        );

        this.alertsLoaded.set(true);
      },

      error: (err) => {

        this.alerts.set(MOCK_ALERTS);
        this.alertsLoaded.set(true);

        this.errors.update(e => [
          ...e,
          err.message
        ]);
      }
    });
  }

  fetchSubscription(): void {
    if (!environment.subscriptionApiUrl) {
      this.subscription.set(MOCK_SUBSCRIPTION);
      this.subscriptionLoaded.set(true);
      return;
    }

    this.subscriptionEndpoint.getAll().subscribe({

      next: (data: any) => {

        const result =
            Array.isArray(data)
                ? data[0]
                : data;

        this.subscription.set(result);

        this.subscriptionLoaded.set(true);
      },

      error: (err) => {

        this.subscription.set(MOCK_SUBSCRIPTION);
        this.subscriptionLoaded.set(true);

        this.errors.update(e => [
          ...e,
          err.message
        ]);
      }
    });
  }

  fetchPlans(): void {
    if (!environment.subscriptionApiUrl) {
      this.plans.set(MOCK_PLANS);
      this.plansLoaded.set(true);
      return;
    }

    this.plansEndpoint.getAll().subscribe({

      next: (data: any) => {

        this.plans.set(data);

        this.plansLoaded.set(true);
      },

      error: (err) => {

        this.plans.set(MOCK_PLANS);
        this.plansLoaded.set(true);

        this.errors.update(e => [
          ...e,
          err.message
        ]);
      }
    });
  }

  changePlan(
      plan: string,
      tier: string,
      price: number,
      features: string[]
  ): void {

    const current = this.subscription();

    if (!current) return;

    this.subscription.set({

      ...current,

      plan,

      tier,

      price,

      features
    });
  }

  changeBillingCycle(
      cycle: 'monthly' | 'yearly'
  ): void {

    const current = this.subscription();

    if (!current) return;

    let updatedPrice = current.price;

    if (cycle === 'yearly') {

      updatedPrice =
          Math.round(current.price * 0.83);

    } else {

      if (current.plan === 'Monitoreo Base') {
        updatedPrice = 350;
      }

      if (current.plan === 'Operador Integral') {
        updatedPrice = 1200;
      }

      if (
          current.plan === 'Smart City / Industrial'
      ) {
        updatedPrice = 3500;
      }
    }

    this.subscription.set({

      ...current,

      billingCycle: cycle,

      price: updatedPrice
    });
  }
}
