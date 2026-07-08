import { computed, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../iam/application/authentication.service';
import { Sensor } from '../../devices/domain/model/sensor.entity';
import { Alert } from '../domain/model/alert.entity';
import { Subscription } from '../../subscriptions/domain/model/subscription.entity';

interface DeviceResource {
  id: number;
  ownerId: number;
  serialNumber: string;
  deviceType: string;
  currentStatus: string;
  lastTelemetrySync: string;
  name: string;
  location: string;
  unit: string;
  currentValue: number;
  destinationId: number | null;
}

interface ThresholdResource {
  id: number;
  deviceId: number;
  minValue: number;
  maxValue: number;
  unit: string;
  alertLevel: string;
}

interface AlertResource {
  id: number;
  deviceId: number;
  deviceName: string;
  location: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
  status: string;
  value: number;
  threshold: number;
}

interface SubscriptionResource {
  id: number;
  userId: number;
  plan: string;
  status: string;
}

interface PlanResource {
  name: string;
  monthlyCost: number;
  maxDevices: number;
  isUnlimited: boolean;
}

const PLAN_DETAILS: Record<string, { tier: string; features: string[] }> = {
  Basic: {
    tier: 'subscription.tierBasic',
    features: ['subscription.featureBasicDevices', 'subscription.featureAlerts', 'subscription.featureHistory']
  },
  'Smart City': {
    tier: 'subscription.tierSmartCity',
    features: ['subscription.featureSmartDevices', 'subscription.featureAnalytics', 'subscription.featureExports']
  },
  Industrial: {
    tier: 'subscription.tierIndustrial',
    features: ['subscription.featureUnlimited', 'subscription.featureSupport', 'subscription.featureIntegrations']
  }
};

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  readonly sensors = signal<Sensor[]>([]);
  readonly alerts = signal<Alert[]>([]);
  readonly subscription = signal<Subscription | null>(null);
  readonly plans = signal<any[]>([]);
  readonly errors = signal<string[]>([]);
  readonly sensorsLoaded = signal(false);
  readonly alertsLoaded = signal(false);
  readonly subscriptionLoaded = signal(false);
  readonly plansLoaded = signal(false);

  readonly activeSensorsCount = computed(() =>
    this.sensors().filter(sensor => sensor.status !== 'Alerta').length
  );
  readonly criticalAlertsCount = computed(() =>
    this.alerts().filter(alert =>
      alert.severity === 'Crítica' && alert.status === 'Activa'
    ).length
  );
  readonly activeAlerts = computed(() =>
    this.alerts().filter(alert => alert.status === 'Activa')
  );

  constructor(
    private readonly http: HttpClient,
    private readonly translate: TranslateService,
    private readonly auth: AuthenticationService
  ) {}

  fetchSensors(): void {
    this.sensorsLoaded.set(false);
    this.http.get<DeviceResource[]>(`${environment.apiUrl}/devices`).pipe(
      switchMap(devices => {
        if (!devices.length) return of([] as Sensor[]);
        return forkJoin(devices.map(device =>
          this.http.get<ThresholdResource[]>(`${environment.apiUrl}/devices/${device.id}/thresholds`).pipe(
            map(thresholds => this.toSensor(device, thresholds.at(-1))),
            catchError(() => of(this.toSensor(device)))
          )
        ));
      })
    ).subscribe({
      next: sensors => {
        this.sensors.set(sensors);
        this.sensorsLoaded.set(true);
      },
      error: error => this.recordError(error, this.sensorsLoaded)
    });
  }

  getSensorById(id: string | number): Sensor | undefined {
    return this.sensors().find(sensor => Number(sensor.id) === Number(id));
  }

  addSensor(sensor: Sensor): void {
    const ownerId = this.auth.currentUser()?.id;
    if (!ownerId) return;

    const createPayload = {
      ownerId,
      serialNumber: this.serialNumberFor(sensor),
      deviceType: this.toApiDeviceType(sensor.type),
      name: sensor.name,
      location: sensor.location,
      unit: sensor.unit,
      currentValue: sensor.currentValue,
      destinationId: sensor.destinationId
    };

    this.http.post<DeviceResource>(`${environment.apiUrl}/devices`, createPayload).pipe(
      switchMap(device => this.saveThreshold(device.id, sensor).pipe(
        switchMap(threshold => this.http.put<DeviceResource>(
          `${environment.apiUrl}/devices/${device.id}`,
          this.updatePayload(sensor)
        ).pipe(map(updated => ({ updated, threshold }))))
      ))
    ).subscribe({
      next: ({ updated, threshold }) => {
        const entity = this.toSensor(updated, threshold);
        this.sensors.update(items => [...items, entity]);
        this.syncAutomaticAlert(entity);
      },
      error: error => this.recordError(error)
    });
  }

  updateSensor(sensor: Sensor): void {
    if (!sensor.id) return;

    forkJoin({
      device: this.http.put<DeviceResource>(
        `${environment.apiUrl}/devices/${sensor.id}`,
        this.updatePayload(sensor)
      ),
      threshold: this.saveThreshold(sensor.id, sensor)
    }).subscribe({
      next: ({ device, threshold }) => {
        const entity = this.toSensor(device, threshold);
        this.sensors.update(items =>
          items.map(item => item.id === entity.id ? entity : item)
        );
        this.syncAutomaticAlert(entity);
      },
      error: error => this.recordError(error)
    });
  }

  deleteSensor(id: number): void {
    this.http.delete<void>(`${environment.apiUrl}/devices/${id}`).subscribe({
      next: () => {
        this.sensors.update(items => items.filter(sensor => sensor.id !== id));
        this.alerts.update(items => items.filter(alert => alert.sensorId !== id));
      },
      error: error => this.recordError(error)
    });
  }

  fetchAlerts(): void {
    this.alertsLoaded.set(false);
    this.http.get<AlertResource[]>(`${environment.apiUrl}/alerts`).subscribe({
      next: resources => {
        this.alerts.set(resources.map(resource => this.toAlert(resource)));
        this.alertsLoaded.set(true);
      },
      error: error => this.recordError(error, this.alertsLoaded)
    });
  }

  resolveAlert(alert: Alert): void {
    if (!alert.id || !alert.sensorId) return;

    this.http.put<AlertResource>(`${environment.apiUrl}/alerts/${alert.id}`, {
      deviceId: alert.sensorId,
      deviceName: alert.sensorName,
      location: alert.location,
      type: alert.type,
      severity: alert.severity === 'Crítica' ? 'Critical' : 'Warning',
      message: alert.message,
      timestamp: alert.timestamp,
      status: 'Resolved',
      value: alert.value,
      threshold: alert.threshold
    }).subscribe({
      next: resource => {
        const resolved = this.toAlert(resource);
        this.alerts.update(items =>
          items.map(item => item.id === resolved.id ? resolved : item)
        );
      },
      error: error => this.recordError(error)
    });
  }

  fetchSubscription(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    this.subscriptionLoaded.set(false);
    this.http.get<SubscriptionResource>(
      `${environment.apiUrl}/subscriptions/by-user/${userId}`
    ).subscribe({
      next: resource => {
        this.subscription.set(this.toSubscription(resource));
        this.subscriptionLoaded.set(true);
      },
      error: error => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.subscription.set(null);
          this.subscriptionLoaded.set(true);
          return;
        }
        this.recordError(error, this.subscriptionLoaded);
      }
    });
  }

  fetchPlans(): void {
    this.plansLoaded.set(false);
    this.http.get<PlanResource[]>(`${environment.apiUrl}/subscriptions/plans`).subscribe({
      next: resources => {
        this.plans.set(resources.map(plan => ({
          ...plan,
          tier: PLAN_DETAILS[plan.name]?.tier ?? '',
          monthlyPrice: this.planPrice(plan.name),
          annualMonthlyPrice: Math.round(this.planPrice(plan.name) * 0.83),
          maxDevices: plan.name === 'Smart City' ? 50 : plan.maxDevices,
          features: PLAN_DETAILS[plan.name]?.features ?? []
        })));
        this.plansLoaded.set(true);
      },
      error: error => this.recordError(error, this.plansLoaded)
    });
  }

  changePlan(plan: string, _tier: string, _price: number, _features: string[]): void {
    const current = this.subscription();
    if (!current) return;

    this.http.put<SubscriptionResource>(
      `${environment.apiUrl}/subscriptions/${current.id}/plan`,
      { newPlan: plan }
    ).subscribe({
      next: resource => this.subscription.set(this.toSubscription(resource)),
      error: error => this.recordError(error)
    });
  }

  changeBillingCycle(cycle: 'monthly' | 'yearly'): void {
    const current = this.subscription();
    if (!current) return;
    const basePrice = this.planPrice(current.plan);
    this.subscription.set({
      ...current,
      billingCycle: cycle,
      price: cycle === 'yearly' ? Math.round(basePrice * 0.83) : basePrice
    });
  }

  alertMessage(alert: Alert): string {
    return this.translate.instant(
      alert.severity === 'Crítica' ? 'alerts.autoMsgCritical' : 'alerts.autoMsgWarning',
      { name: alert.sensorName, parameter: alert.type }
    );
  }

  alertSeverityLabel(alert: Alert): string {
    return this.translate.instant(
      alert.severity === 'Crítica' ? 'alerts.critical' : 'alerts.warning'
    );
  }

  sensorStatusLabel(status: Sensor['status']): string {
    if (status === 'Alerta') return this.translate.instant('sensors.alertStatus');
    if (status === 'Advertencia') return this.translate.instant('sensors.warningStatus');
    return this.translate.instant('sensors.normalStatus');
  }

  formatRelativeDate(iso: string): string {
    if (!iso) return '';
    const locale = this.translate.currentLang === 'es' ? 'es-PE' : 'en-US';
    const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
    return formatter.format(Math.round(hours / 24), 'day');
  }

  formatDateTime(iso: string): string {
    if (!iso) return '';
    const locale = this.translate.currentLang === 'es' ? 'es-PE' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(iso));
  }

  private saveThreshold(deviceId: number, sensor: Sensor) {
    return this.http.post<ThresholdResource>(
      `${environment.apiUrl}/devices/${deviceId}/thresholds`,
      {
        minValue: sensor.minAlert,
        maxValue: sensor.maxAlert,
        unit: sensor.unit,
        alertLevel: sensor.status === 'Alerta' ? 'Critical' : 'Warning'
      }
    );
  }

  private syncAutomaticAlert(sensor: Sensor): void {
    const severity = sensor.status === 'Alerta'
      ? 'Crítica'
      : sensor.status === 'Advertencia' ? 'Advertencia' : null;

    if (!sensor.id) return;

    this.http.get<AlertResource[]>(`${environment.apiUrl}/alerts/device/${sensor.id}`).pipe(
      switchMap(resources => {
        const active = resources.filter(resource =>
          !resource.status.toLowerCase().startsWith('res')
        );
        if (!active.length) return of([]);

        return forkJoin(active.map(resource =>
          this.http.put<AlertResource>(`${environment.apiUrl}/alerts/${resource.id}`, {
            deviceId: resource.deviceId,
            deviceName: resource.deviceName,
            location: resource.location,
            type: resource.type,
            severity: resource.severity,
            message: resource.message,
            timestamp: resource.timestamp,
            status: 'Resolved',
            value: resource.value,
            threshold: resource.threshold
          })
        ));
      }),
      switchMap(() => {
        this.alerts.update(items => items.map(item =>
          item.sensorId === sensor.id && item.status === 'Activa'
            ? new Alert({ ...item, status: 'Resuelta' })
            : item
        ));

        if (!severity) return of(null);

        const threshold = sensor.currentValue < sensor.minAlert
          ? sensor.minAlert
          : sensor.maxAlert;
        const alert = new Alert({
          sensorId: sensor.id,
          sensorName: sensor.name,
          location: sensor.location,
          type: sensor.type,
          severity,
          message: this.translate.instant(
            severity === 'Crítica' ? 'alerts.autoMsgCritical' : 'alerts.autoMsgWarning',
            { name: sensor.name, parameter: sensor.type }
          ),
          timestamp: new Date().toISOString(),
          status: 'Activa',
          value: sensor.currentValue,
          threshold
        });

        return this.http.post<AlertResource>(`${environment.apiUrl}/alerts`, {
          deviceId: alert.sensorId,
          deviceName: alert.sensorName,
          location: alert.location,
          type: alert.type,
          severity: severity === 'Crítica' ? 'Critical' : 'Warning',
          message: alert.message,
          timestamp: alert.timestamp,
          status: 'Active',
          value: alert.value,
          threshold: alert.threshold
        });
      })
    ).subscribe({
      next: resource => {
        if (resource) {
          this.alerts.update(items => [this.toAlert(resource), ...items]);
          this.alertsLoaded.set(true);
        }
      },
      error: error => this.recordError(error)
    });
  }

  private toSensor(device: DeviceResource, threshold?: ThresholdResource): Sensor {
    const min = threshold?.minValue ?? 0;
    const max = threshold?.maxValue ?? 0;
    return new Sensor({
      id: device.id,
      name: device.name || device.serialNumber,
      location: device.location || '',
      destinationId: device.destinationId,
      type: device.deviceType,
      currentValue: Number(device.currentValue ?? 0),
      unit: device.unit || threshold?.unit || '',
      status: this.toUiStatus(device.currentStatus),
      lastUpdated: device.lastTelemetrySync,
      recommendedRange: threshold ? `${min} - ${max} ${threshold.unit}` : '',
      minAlert: min,
      maxAlert: max,
      history: Array(7).fill(Number(device.currentValue ?? 0))
    });
  }

  private toAlert(resource: AlertResource): Alert {
    return new Alert({
      id: resource.id,
      sensorId: resource.deviceId,
      sensorName: resource.deviceName,
      location: resource.location,
      type: resource.type,
      severity: resource.severity.toLowerCase().startsWith('crit') ? 'Crítica' : 'Advertencia',
      message: resource.message,
      timestamp: resource.timestamp,
      status: resource.status.toLowerCase().startsWith('res') ? 'Resuelta' : 'Activa',
      value: resource.value,
      threshold: resource.threshold
    });
  }

  private toSubscription(resource: SubscriptionResource): Subscription {
    const plan = resource.plan;
    const details = PLAN_DETAILS[plan] ?? { tier: '', features: [] };
    const price = this.planPrice(plan);
    return {
      id: resource.id,
      plan,
      tier: details.tier,
      price,
      currency: 'USD',
      billingCycle: 'monthly',
      status: resource.status,
      startDate: '',
      nextBillingDate: '',
      paymentMethod: '',
      features: details.features,
      usage: {
        sensorsConnected: this.sensors().length,
        sensorsLimit: plan === 'Industrial' ? -1 : plan === 'Smart City' ? 50 : 10,
        storageUsedGB: 0,
        storageLimitGB: 100,
        exports: 0,
        exportsLimit: 100
      }
    };
  }

  private updatePayload(sensor: Sensor) {
    return {
      currentStatus: this.toApiStatus(sensor.status),
      lastTelemetrySync: sensor.lastUpdated || new Date().toISOString(),
      name: sensor.name,
      location: sensor.location,
      unit: sensor.unit,
      currentValue: sensor.currentValue
    };
  }

  private serialNumberFor(sensor: Sensor): string {
    const normalized = sensor.name.trim().replace(/\s+/g, '-').toUpperCase();
    return normalized || `DEVICE-${Date.now()}`;
  }

  private toApiDeviceType(type: string): string {
    const normalized = type.toLowerCase();
    if (normalized === 'ph') return 'PH';
    if (normalized.includes('turbi')) return 'Turbidity';
    if (normalized.includes('pres') || normalized === 'pressure') return 'Pressure';
    if (normalized.includes('nivel') || normalized === 'level') return 'Level';
    if (normalized.includes('cloro') || normalized === 'chlorine') return 'Chlorine';
    if (normalized.includes('flujo') || normalized === 'flow') return 'Flow';
    return type;
  }

  private toApiStatus(status: Sensor['status']): string {
    if (status === 'Advertencia') return 'Warning';
    if (status === 'Alerta') return 'Alert';
    return 'Normal';
  }

  private toUiStatus(status: string): Sensor['status'] {
    if (status.toLowerCase() === 'warning') return 'Advertencia';
    if (status.toLowerCase() === 'alert') return 'Alerta';
    return 'Normal';
  }

  private planPrice(plan: string): number {
    if (plan === 'Industrial') return 3500;
    if (plan === 'Smart City') return 1200;
    return 350;
  }

  private recordError(error: unknown, loadedSignal?: { set(value: boolean): void }): void {
    const httpError = error as HttpErrorResponse;
    const message = httpError?.error?.detail || httpError?.error?.message || httpError?.message ||
      'The request could not be completed.';
    this.errors.update(items => [...items, message]);
    loadedSignal?.set(true);
  }
}
