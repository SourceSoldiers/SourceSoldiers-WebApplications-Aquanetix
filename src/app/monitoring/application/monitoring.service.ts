import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { Sensor } from '../domain/model/sensor.entity';
import { Alert } from '../domain/model/alert.entity';
import { Subscription } from '../domain/model/subscription.entity';

import { SensorAssembler } from '../infrastructure/sensor.assembler';
import { AlertAssembler } from '../infrastructure/alert.assembler';

import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';

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

    this.sensorsEndpoint.getAll().subscribe({

      next: (data) => {

        this.sensors.set(
            SensorAssembler.toEntitiesFromArray(data)
        );

        this.sensorsLoaded.set(true);
      },

      error: (err) => {

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

    this.alertsEndpoint.getAll().subscribe({

      next: (data) => {

        this.alerts.set(
            AlertAssembler.toEntitiesFromArray(data)
        );

        this.alertsLoaded.set(true);
      },

      error: (err) => {

        this.errors.update(e => [
          ...e,
          err.message
        ]);
      }
    });
  }

  fetchSubscription(): void {

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

        this.errors.update(e => [
          ...e,
          err.message
        ]);
      }
    });
  }

  fetchPlans(): void {

    this.plansEndpoint.getAll().subscribe({

      next: (data: any) => {

        this.plans.set(data);

        this.plansLoaded.set(true);
      },

      error: (err) => {

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