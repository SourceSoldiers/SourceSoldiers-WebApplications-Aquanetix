import {
  Component,
  computed,
  effect
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { TranslateModule } from '@ngx-translate/core';

import { MonitoringService } from '../../../../monitoring/application/monitoring.service';
import { Sensor } from '../../../domain/model/sensor.entity';

interface ChartBar {
  value: number;
  heightPct: number;
  color: string;
  label: string;
  isLast: boolean;
}

@Component({
  selector: 'app-sensor-detail',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    TranslateModule
  ],

  template: `
    <div>

      <button
        mat-button
        color="primary"
        (click)="router.navigate(['/devices'])"
        class="mb-3"
      >
        <mat-icon>arrow_back</mat-icon>
        {{ 'sensorDetail.back' | translate }}
      </button>

      <div
        *ngIf="!store.sensorsLoaded()"
        class="spinner-container"
      >
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div
        *ngIf="store.sensorsLoaded() && !sensor()"
        style="text-align:center;padding:48px;color:#64748B;"
      >
        <p>{{ 'sensorDetail.notFound' | translate }}</p>
      </div>

      <ng-container *ngIf="store.sensorsLoaded() && sensor()">

        <div class="header-row">

          <div>

            <h1 class="title">
              {{ sensor()!.name }}
            </h1>

            <p class="subtitle">
              {{ sensor()!.location }}
              ·
              {{ 'sensorDetail.parameter' | translate }}:
              {{ sensor()!.type }}
            </p>

          </div>

          <div class="header-actions">

            <span
              class="status-chip"
              [ngClass]="getStatusChipClass(sensor()!.status)"
            >
              {{ store.sensorStatusLabel(sensor()!.status) }}
            </span>

            <button mat-stroked-button>
              <mat-icon>download</mat-icon>
              {{ 'sensorDetail.export' | translate }}
            </button>

          </div>

        </div>

        <div class="detail-grid">

          <!-- LEFT -->

          <div class="left-column">

            <!-- CURRENT VALUE -->

            <mat-card>

              <mat-card-content class="card-padding">

                <p class="text-muted mb-2">
                  {{ 'sensorDetail.currentValue' | translate }}
                </p>

                <div class="value-row">

                  <span class="current-value">
                    {{ sensor()!.currentValue }}
                  </span>

                  <span class="current-unit">
                    {{ sensor()!.unit }}
                  </span>

                </div>

                <span
                  class="status-chip mt-2"
                  [ngClass]="getStatusChipClass(sensor()!.status)"
                >
                  {{ store.sensorStatusLabel(sensor()!.status) }}
                </span>

              </mat-card-content>

            </mat-card>

            <!-- CHART -->

            <mat-card>

              <mat-card-header>

                <mat-card-title>
                  {{ 'sensorDetail.history24h' | translate }}
                </mat-card-title>

              </mat-card-header>

              <mat-card-content class="card-padding">

                <!-- LEGEND -->

                <div class="legend">

                  <div class="legend-item">
    <span
        class="legend-color"
        style="background:#10B981;"
    ></span>
                    {{ 'sensorDetail.normal' | translate }}
                  </div>

                  <div class="legend-item">
    <span
        class="legend-color"
        style="background:#f59e0b;"
    ></span>
                    {{ 'sensorDetail.nearLimit' | translate }}
                  </div>

                  <div class="legend-item">
    <span
        class="legend-color"
        style="background:#ef4444;"
    ></span>
                    {{ 'sensorDetail.outOfRange' | translate }}
                  </div>

                </div>

                <!-- CHART -->

                <div class="chart-wrapper">

                  <!-- MAX LINE -->

                  <div
                      class="chart-line max-line"
                      [style.bottom.%]="refLines.max"
                  >

    <span class="line-label max-label">

      Máx {{ sensor()!.maxAlert }}
      {{ sensor()!.unit }}

    </span>

                  </div>

                  <!-- MIN LINE -->

                  <div
                      class="chart-line min-line"
                      [style.bottom.%]="refLines.min"
                  >

    <span class="line-label min-label">

      Mín {{ sensor()!.minAlert }}
      {{ sensor()!.unit }}

    </span>

                  </div>

                  <!-- BARS -->

                  <div class="bars-row">

                    <div
                        *ngFor="let bar of chartBars"
                        class="bar-column"
                    >

                      <!-- CURRENT DOT -->

                      <div
                          *ngIf="bar.isLast"
                          class="current-dot"
                          [style.background]="bar.color"
                          [style.boxShadow]="'0 0 0 2px ' + bar.color"
                      ></div>

                      <!-- BAR -->

                      <div
                          class="bar"
                          [style.height.%]="bar.heightPct"
                          [style.background]="bar.color"
                          [style.opacity]="bar.isLast ? 1 : .75"
                      ></div>

                    </div>

                  </div>

                </div>

                <!-- X AXIS -->

                <div class="x-axis">

                  <div
                      *ngFor="let bar of chartBars"
                      class="x-label"
                  >

    <span
        [style.color]="
        bar.isLast
          ? '#10B981'
          : '#94a3b8'
      "

        [style.fontWeight]="
        bar.isLast
          ? '700'
          : '400'
      "
    >

      {{ bar.label }}

    </span>

                  </div>

                </div>

                <!-- FOOTER -->

                <div class="chart-footer">

  <span>

    {{ 'sensorDetail.recommendedRange' | translate }}:
    <strong>

      {{ sensor()!.recommendedRange }}
      {{ sensor()!.unit }}

    </strong>

  </span>

                  <span>

    {{ sensor()!.history.length }}
                    {{ 'sensorDetail.readings' | translate }}
                    ·
                    {{ 'sensorDetail.latest' | translate }}:

    <strong>

      {{ sensor()!.currentValue }}
      {{ sensor()!.unit }}

    </strong>

  </span>

                </div>

              </mat-card-content>

            </mat-card>

          </div>

          <!-- RIGHT -->

          <div class="right-column">

            <!-- SENSOR INFO -->

            <mat-card>

              <mat-card-header>

                <mat-card-title>
                  {{ 'sensorDetail.sensorInfo' | translate }}
                </mat-card-title>

              </mat-card-header>

              <mat-card-content class="card-padding">

                <div class="info-grid">

                  <span class="text-muted">{{ 'sensorDetail.sensorId' | translate }}</span>
                  <span class="font-semibold">{{ sensor()!.name }}</span>

                  <span class="text-muted">{{ 'sensorDetail.locationLabel' | translate }}</span>
                  <span class="font-semibold">{{ sensor()!.location }}</span>

                  <span class="text-muted">{{ 'sensorDetail.parameterLabel' | translate }}</span>
                  <span class="font-semibold">{{ sensor()!.type }}</span>

                  <span class="text-muted">{{ 'sensorDetail.recommendedRange' | translate }}</span>
                  <span class="font-semibold">
                    {{ sensor()!.recommendedRange }}
                    {{ sensor()!.unit }}
                  </span>

                  <span class="text-muted">{{ 'sensorDetail.statusLabel' | translate }}</span>

                  <span
                    class="status-chip"
                    [ngClass]="getStatusChipClass(sensor()!.status)"
                  >
                    {{ store.sensorStatusLabel(sensor()!.status) }}
                  </span>

                </div>

              </mat-card-content>

            </mat-card>

            <!-- RESUMEN -->

            <mat-card>

              <mat-card-header>

                <mat-card-title>
                  {{ 'sensorDetail.valueSummary' | translate }}
                </mat-card-title>

              </mat-card-header>

              <mat-card-content class="card-padding">

                <div class="info-grid">

                  <span class="text-muted">{{ 'sensorDetail.minimum' | translate }}</span>

                  <span class="font-semibold">
                    {{ historyMin }}
                    {{ sensor()!.unit }}
                  </span>

                  <span class="text-muted">{{ 'sensorDetail.maximum' | translate }}</span>

                  <span class="font-semibold">
                    {{ historyMax }}
                    {{ sensor()!.unit }}
                  </span>

                  <span class="text-muted">{{ 'sensorDetail.average' | translate }}</span>

                  <span class="font-semibold">
                    {{ historyAvg }}
                    {{ sensor()!.unit }}
                  </span>

                </div>

              </mat-card-content>

            </mat-card>

            <!-- THRESHOLDS -->

            <mat-card>

              <mat-card-header>

                <mat-card-title>
                  {{ 'sensorDetail.configuredThresholds' | translate }}
                </mat-card-title>

              </mat-card-header>

              <mat-card-content class="card-padding">

                <div class="info-grid mb-3">

                  <span class="text-muted">
                    {{ 'sensorDetail.minAlert' | translate }}
                  </span>

                  <span style="color:#10B981;">
                    {{ sensor()!.minAlert }}
                    {{ sensor()!.unit }}
                  </span>

                  <span class="text-muted">
                    {{ 'sensorDetail.maxAlert' | translate }}
                  </span>

                  <span style="color:#ef4444;">
                    {{ sensor()!.maxAlert }}
                    {{ sensor()!.unit }}
                  </span>

                </div>

                <button
                  mat-stroked-button
                  style="width:100%;"
                  (click)="openThresholdModal()"
                >
                  <mat-icon>edit</mat-icon>
                  {{ 'sensorDetail.editThresholds' | translate }}
                </button>

              </mat-card-content>

            </mat-card>

          </div>

        </div>

        <!-- MODAL -->

        <div
          *ngIf="showThresholdModal"
          class="modal-overlay"
        >

          <div class="modal-card">

            <div class="modal-header">

              <h2>
                {{ 'sensorDetail.editThresholdsTitle' | translate }}
              </h2>

              <button
                mat-icon-button
                (click)="closeThresholdModal()"
              >
                <mat-icon>close</mat-icon>
              </button>

            </div>

            <mat-form-field appearance="outline" class="w-full mb-3">

              <mat-label>
                Min
              </mat-label>

              <input
                matInput
                type="number"
                [(ngModel)]="editMin"
              >

            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-4">

              <mat-label>
                Max
              </mat-label>

              <input
                matInput
                type="number"
                [(ngModel)]="editMax"
              >

            </mat-form-field>

            <div class="modal-actions">

              <button
                mat-button
                (click)="closeThresholdModal()"
              >
                {{ 'sensors.cancel' | translate }}
              </button>

              <button
                mat-flat-button
                color="primary"
                (click)="saveThresholds()"
              >
                {{ 'sensorDetail.saveThresholds' | translate }}
              </button>

            </div>

          </div>

        </div>

      </ng-container>

    </div>
  `,

  styles: [`
  .detail-grid{
    display:grid;
    grid-template-columns:2fr 1fr;
    gap:16px;
  }

  .left-column,
  .right-column{
    display:flex;
    flex-direction:column;
    gap:16px;
  }

  .card-padding{
    padding:20px !important;
  }

  .title{
    font-size:2rem;
    font-weight:700;
    margin:0 0 4px;
  }

  .subtitle{
    color:#64748b;
    margin:0;
  }

  .header-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-wrap:wrap;
    gap:16px;
    margin-bottom:20px;
  }

  .header-actions{
    display:flex;
    align-items:center;
    gap:10px;
  }

  .value-row{
    display:flex;
    align-items:center;
    gap:10px;
  }

  .current-value{
    font-size:4rem;
    font-weight:700;
    color:#10B981;
    line-height:1;
  }

  .current-unit{
    font-size:1.5rem;
    color:#64748b;
  }

  .chart-wrapper{
     position:relative;

     height:160px;

     padding:8px 66px 4px 0;

     margin-top:10px;
   }

  .bars-row{
    display:flex;

    align-items:flex-end;

    gap:4px;

    height:100%;
  }

  .bar-column{
    flex:1;
    height:100%;

    display:flex;
    flex-direction:column;
    justify-content:flex-end;
    align-items:center;
  }

  .bar{
    width:100%;

    min-height:4px;

    border-radius:4px 4px 0 0;

    transition:height .3s;
  }

  .current-dot{
    width:10px;
    height:10px;

    border-radius:50%;

    background:white;

    margin-bottom:4px;

    z-index:3;
  }
  
  .x-axis{
    display:flex;

    gap:4px;

    padding-right:66px;

    margin-top:4px;
  }

  .x-label{
    flex:1;

    text-align:center;

    font-size:.65rem;
  }

  .chart-line{
    position:absolute;

    left:0;
    right:62px;

    height:1px;

    opacity:.6;

    z-index:1;
  }
  
  .max-line{
    background:#ef4444;
  }

  .min-line{
    background:#10B981;
  }

  .line-label{
    position:absolute;

    right:-20px;

    transform:translateX(100%);

    font-size:.62rem;

    font-weight:700;

    white-space:nowrap;
  }

  .max-label{
    color:#ef4444;
  }

  .min-label{
    color:#10B981;
  }

  .legend{
    display:flex;
    gap:20px;
    margin-bottom:12px;
  }

  .legend-item{
    display:flex;
    align-items:center;
    gap:6px;
    font-size:13px;
  }

  .legend-color{
    width:12px;
    height:12px;
    border-radius:2px;
  }

  .chart-footer{
    margin-top:16px;
    display:flex;
    justify-content:space-between;
    color:#64748b;
    font-size:13px;
  }

  .info-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
  }

  .status-chip{
    padding:6px 14px;
    border-radius:999px;
    font-size:12px;
    font-weight:600;
    color:white;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:fit-content;
  }
  

  .modal-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.45);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:9999;
  }

  .modal-card{
    background:white;
    width:420px;
    border-radius:20px;
    padding:24px;
  }

  .modal-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:16px;
  }

  .modal-actions{
    display:flex;
    justify-content:flex-end;
    gap:10px;
  }

  @media (max-width:1024px){

    .detail-grid{
      grid-template-columns:1fr;
    }

    .chart-footer{
      flex-direction:column;
      gap:8px;
    }
  }
`]
})
export class SensorDetailComponent {

  sensorId = Number(
      this.route.snapshot.paramMap.get('id')
  );

  sensor = computed(() =>
      this.store.getSensorById(this.sensorId)
  );

  chartBars: ChartBar[] = [];

  historyMin = 0;
  historyMax = 0;
  historyAvg = '0';

  refLines = {
    min: 0,
    max: 100
  };

  showThresholdModal = false;

  editMin = 0;
  editMax = 0;

  constructor(
      public store: MonitoringService,
      public router: Router,
      private route: ActivatedRoute
  ) {

    if (!this.store.sensorsLoaded()) {
      this.store.fetchSensors();
    }

    effect(() => {

      const sensor = this.sensor();

      if (sensor) {

        this.computeStats(sensor);

        this.buildChart(sensor);
      }
    });
  }

  openThresholdModal(): void {

    const sensor = this.sensor();

    if (!sensor) return;

    this.editMin = sensor.minAlert;
    this.editMax = sensor.maxAlert;

    this.showThresholdModal = true;
  }

  closeThresholdModal(): void {
    this.showThresholdModal = false;
  }

  saveThresholds(): void {

    const sensor = this.sensor();

    if (!sensor) return;

    let status:
        'Normal'
        | 'Advertencia'
        | 'Alerta' = 'Normal';

    if (sensor.currentValue < this.editMin || sensor.currentValue > this.editMax) {
      status = 'Alerta';
    } else {
      const margin = (this.editMax - this.editMin) * 0.1;

      if (
          sensor.currentValue <= this.editMin + margin ||
          sensor.currentValue >= this.editMax - margin
      ) {
        status = 'Advertencia';
      }
    }

    const updated = new Sensor({
      ...sensor,
      minAlert: this.editMin,
      maxAlert: this.editMax,
      recommendedRange: `${this.editMin} - ${this.editMax}`,
      status
    });

    this.store.updateSensor(updated);

    this.closeThresholdModal();
  }

  private computeStats(sensor: Sensor): void {

    const h = sensor.history;

    if (!h.length) return;

    this.historyMin = Math.min(...h);

    this.historyMax = Math.max(...h);

    this.historyAvg = (
        h.reduce((a, b) => a + b, 0) / h.length
    ).toFixed(2);
  }

  private buildChart(sensor: Sensor): void {

    const vals = sensor.history;

    if (!vals.length) {

      this.chartBars = [];

      return;
    }

    const valueMax = Math.max(...vals);

    const axisTop = Math.max(
        valueMax * 1.25,
        sensor.maxAlert * 1.05
    );

    const lastIdx = vals.length - 1;

    this.chartBars = vals.map((v, i) => {

      let color = '#10B981';


      if (
          v <= sensor.minAlert ||
          v >= sensor.maxAlert
      ) {

        color = '#ef4444';
      }


      else if (

          v <= sensor.minAlert * 1.15 ||
          v >= sensor.maxAlert * 0.90
      ) {

        color = '#f59e0b';
      }

      const hoursAgo = lastIdx - i;

      const normalized = Math.round(
          (v / axisTop) * 100
      );

      return {

        value: v,

        heightPct: Math.max(
            4,
            normalized
        ),

        color,

        label:
            hoursAgo === 0
                ? 'Ahora'
                : `-${hoursAgo}h`,

        isLast:
            i === lastIdx
      };
    });


    this.refLines = {

      min: Math.round(
          (sensor.minAlert / axisTop) * 100
      ),

      max: Math.round(
          (sensor.maxAlert / axisTop) * 100
      )
    };
  }

  getStatusChipClass(status: string): string {

    if (status === 'Normal') {
      return 'chip-normal';
    }

    if (status === 'Advertencia') {
      return 'chip-warning';
    }

    return 'chip-alert';
  }
}
