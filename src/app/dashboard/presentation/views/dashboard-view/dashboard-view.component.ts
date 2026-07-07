import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { TranslateModule } from '@ngx-translate/core';

import { MonitoringService } from '../../../../monitoring/application/monitoring.service';

@Component({
  selector: 'app-dashboard-view',

  standalone: true,

  imports: [
    CommonModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,

    TranslateModule
  ],

  template: `
    <div>

      <!-- HEADER -->

      <div class="page-header">

        <h1>
          {{ 'dashboard.title' | translate }}
        </h1>

        <p class="text-muted">
          {{ 'dashboard.subtitle' | translate }}
        </p>

      </div>

      <!-- KPI CARDS -->

      <div class="kpi-grid">

        <mat-card class="kpi-card">

          <mat-card-content>

            <div class="kpi-icon blue-bg">

              <mat-icon class="blue-icon">
                sensors
              </mat-icon>

            </div>

            <div>

              <p class="kpi-label">
                {{ 'dashboard.activeSensors' | translate }}
              </p>

              <p class="kpi-value">
                {{ store.activeSensorsCount() }}
              </p>

            </div>

          </mat-card-content>

        </mat-card>

        <mat-card class="kpi-card">

          <mat-card-content>

            <div class="kpi-icon red-bg">

              <mat-icon class="red-icon">
                notifications_active
              </mat-icon>

            </div>

            <div>

              <p class="kpi-label">
                {{ 'dashboard.criticalAlerts' | translate }}
              </p>

              <p class="kpi-value danger-text">
                {{ store.criticalAlertsCount() }}
              </p>

            </div>

          </mat-card-content>

        </mat-card>

        <mat-card class="kpi-card">

          <mat-card-content>

            <div class="kpi-icon green-bg">

              <mat-icon class="green-icon">
                water_drop
              </mat-icon>

            </div>

            <div>

              <p class="kpi-label">
                {{ 'dashboard.treatedVolume' | translate }}
              </p>

              <p class="kpi-value success-text">
                1,240 m³
              </p>

            </div>

          </mat-card-content>

        </mat-card>

        <mat-card class="kpi-card">

          <mat-card-content>

            <div class="kpi-icon green-bg">

              <mat-icon class="green-icon">
                trending_up
              </mat-icon>

            </div>

            <div>

              <p class="kpi-label">
                {{ 'dashboard.efficiency' | translate }}
              </p>

              <p class="kpi-value success-text">
                98.2%
              </p>

            </div>

          </mat-card-content>

        </mat-card>

      </div>

      <!-- QUALITY FINDINGS -->

      <mat-card class="quality-card">

        <mat-card-content>

          <div class="section-header compact">

            <div>

              <h2>
                {{ 'dashboard.recentQualityFindings' | translate }}
              </h2>

              <p class="text-muted">
                {{ 'dashboard.qualityFindingsSubtitle' | translate }}
              </p>

            </div>

            <button
              mat-flat-button
              color="primary"
              type="button"
            >
              <mat-icon>add</mat-icon>
              {{ 'dashboard.registerQualityFinding' | translate }}
            </button>
          </div>

          <div class="quality-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{{ 'dashboard.sourceDevice' | translate }}</th>
                  <th>{{ 'dashboard.evaluatedParameter' | translate }}</th>
                  <th>{{ 'dashboard.severity' | translate }}</th>
                  <th>{{ 'dashboard.reviewStatus' | translate }}</th>
                  <th>{{ 'dashboard.contaminationRisk' | translate }}</th>
                  <th>{{ 'dashboard.createdAt' | translate }}</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let finding of qualityFindings">
                  <td>
                    <strong>{{ finding.sourceDevice }}</strong>
                  </td>
                  <td>{{ finding.parameter }}</td>
                  <td>
                    <span
                      class="status-chip"
                      [ngClass]="getSeverityChipClass(finding.severityScore)"
                    >
                      {{ finding.severityScore.toFixed(1) }} / 10
                    </span>
                  </td>
                  <td>
                    <span
                      class="status-chip"
                      [ngClass]="getReviewStatusChipClass(finding.reviewStatus)"
                    >
                      {{ finding.reviewStatus }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="status-chip"
                      [ngClass]="finding.riskDetected ? 'chip-critical' : 'chip-normal'"
                    >
                      {{
                        (
                          finding.riskDetected
                            ? 'dashboard.riskDetected'
                            : 'dashboard.riskNotFlagged'
                        ) | translate
                      }}
                    </span>
                  </td>
                  <td>{{ finding.createdAt }}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </mat-card-content>

      </mat-card>

      <!-- MAIN GRID -->

      <div class="dashboard-layout">

        <!-- LEFT -->

        <mat-card class="monitoring-card">

          <div class="section-header">

            <h2>
              {{ 'dashboard.realtimeMonitor' | translate }}
            </h2>

            <button
                mat-button
                color="primary"
                (click)="router.navigate(['/monitoring/sensors'])"
            >
              {{ 'dashboard.viewFullMap' | translate }}
            </button>
          </div>

          <table>

            <thead>

              <tr>

                <th>{{ 'sensors.name' | translate }}</th>
                <th>{{ 'sensors.type' | translate }}</th>
                <th>{{ 'sensors.value' | translate }}</th>
                <th>{{ 'sensors.status' | translate }}</th>

              </tr>

            </thead>

            <tbody>

              <tr
                *ngFor="
                  let sensor of store.sensors().slice(0, 9)
                "
              >

                <td>
                  {{ sensor.name }}
                </td>

                <td>
                  {{ sensor.type }}
                </td>

                <td>
                  {{ sensor.currentValue }} {{ sensor.unit }}
                </td>

                <td>

                  <span
                    class="status-chip"
                    [ngClass]="getStatusChipClass(sensor.status)"
                  >
                    {{ sensor.status }}
                  </span>

                </td>

              </tr>

            </tbody>

          </table>

        </mat-card>

        <!-- RIGHT -->

        <div class="right-column">

          <!-- SYSTEM STATUS -->

          <mat-card>

            <mat-card-content>

              <h2 class="card-title">
                {{ 'dashboard.systemStatus' | translate }}
              </h2>

              <div class="system-status">

                <mat-icon class="red-icon">
                  error_outline
                </mat-icon>

                <div>

                  <p class="status-title">
                    {{ 'dashboard.requiredAttendance' | translate }}
                  </p>

                  <p class="text-muted">
                    {{ 'dashboard.operatingNormally' | translate }}
                  </p>

                  <ul class="status-list">

                    <li>
                      {{ 'dashboard.operatingPoints' | translate:{ n: 6, total: 10 } }}
                    </li>

                    <li>
                      {{ 'dashboard.activePumps' | translate }}
                    </li>

                    <li>
                      {{ 'dashboard.energyConsumption' | translate }}
                    </li>

                  </ul>

                </div>

              </div>

            </mat-card-content>

          </mat-card>

          <!-- ALERTS -->

          <mat-card>

            <mat-card-content>

              <div class="alerts-header">

                <h2 class="card-title">
                  {{ 'dashboard.recentAlerts' | translate }}
                </h2>

                <button
                  mat-button
                  color="primary"
                  (click)="router.navigate(['/monitoring/alerts'])"
                >
                  {{ 'dashboard.viewAll' | translate }}
                </button>

              </div>

              <div
                *ngFor="
                  let alert of store.activeAlerts().slice(0, 3)
                "
                class="alert-row"
                [ngClass]="
                  alert.severity === 'Crítica'
                    ? 'border-critical'
                    : 'border-warning'
                "
              >

                <mat-icon
                  [style.color]="
                    alert.severity === 'Crítica'
                      ? '#ff4d4f'
                      : '#ff9800'
                  "
                >
                  {{
                    alert.severity === 'Crítica'
                      ? 'cancel'
                      : 'warning'
                  }}
                </mat-icon>

                <div class="flex-1">

                  <p class="alert-title">
                    {{ alert.message }}
                  </p>

                  <p class="text-sm text-muted">

                    {{ alert.sensorName }}

                    ·

                    {{ alert.location }}

                  </p>

                </div>

                <span
                  class="status-chip"
                  [ngClass]="
                    alert.severity === 'Crítica'
                      ? 'chip-critical'
                      : 'chip-warning'
                  "
                >
                  {{ alert.severity }}
                </span>

              </div>

            </mat-card-content>

          </mat-card>

          <!-- CURRENT PLAN -->

          <mat-card>

            <mat-card-content>

              <h2 class="card-title">
                {{ 'dashboard.currentPlan' | translate }}
              </h2>

              <div class="plan-box">

                <mat-icon class="blue-icon">
                  workspace_premium
                </mat-icon>

                <div>

                  <p class="plan-name">

                    {{
                      store.subscription()?.plan
                    }}

                  </p>

                  <p class="plan-price">

                    S/
                    {{
                      store.subscription()?.price
                    }}
                    / {{ 'subscription.monthly' | translate }}
                  </p>

                  <button
                    mat-button
                    color="primary"
                    (click)="
                      router.navigate([
                        '/monitoring/subscription'
                      ])
                    "
                  >
                    {{ 'dashboard.viewSubscription' | translate }}
                  </button>

                </div>

              </div>

            </mat-card-content>

          </mat-card>

        </div>

      </div>

    </div>
  `,
styles: [`

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      font-size: 2.6rem;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .kpi-grid {

      display: grid;

      grid-template-columns:
        repeat(auto-fit, minmax(260px, 1fr));

      gap: 22px;

      margin-bottom: 24px;
    }

    .kpi-card mat-card-content {

      display: flex;

      align-items: center;

      gap: 18px;

      padding: 28px !important;
    }

    .kpi-icon {

      width: 64px;
      height: 64px;

      border-radius: 18px;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
    }

    .blue-bg {
      background: #d1fae5;
    }

    .red-bg {
      background: #fee2e2;
    }

    .green-bg {
      background: #dcfce7;
    }

    .blue-icon {
      color: #10B981;
    }

    .red-icon {
      color: #ff4d4f;
    }

    .green-icon {
      color: #22c55e;
    }

    .kpi-label {

      font-size: 13px;

      color: #64748b;

      margin-bottom: 6px;
    }

    .kpi-value {

      font-size: 2.3rem;

      font-weight: 800;

      line-height: 1;
    }

    .danger-text {
      color: #ff4d4f;
    }

    .success-text {
      color: #22c55e;
    }

    .dashboard-layout {

      display: grid;

      grid-template-columns: 1.4fr 1fr;

      gap: 24px;

      align-items: start;
    }

    .quality-card {
      margin-bottom: 24px;
    }

    .section-header.compact {
      padding: 0;
      margin-bottom: 12px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .section-header.compact h2 {
      font-size: 1.6rem;
    }

    .section-header.compact p {
      margin-top: 4px;
    }

    .quality-table-wrapper {
      overflow-x: auto;
    }

    .quality-table-wrapper table {
      min-width: 820px;
      margin-top: 0;
    }

    .monitoring-card {
      padding: 8px;
    }

    .section-header {

      display: flex;

      justify-content: space-between;

      align-items: center;

      padding: 18px 18px 0;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.8rem;
    }

    table {

      width: 100%;

      margin-top: 20px;
    }

    th {

      text-align: left;

      padding: 16px;

      border-bottom: 1px solid #e2e8f0;
    }

    td {

      padding: 18px 16px;

      border-bottom: 1px solid #f1f5f9;
    }

    .right-column {

      display: flex;

      flex-direction: column;

      gap: 20px;
    }

    .card-title {

      margin: 0 0 20px;

      font-size: 1.6rem;

      font-weight: 700;
    }

    .system-status {

      display: flex;

      align-items: flex-start;

      gap: 16px;
    }

    .system-status mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .status-title {

      font-weight: 700;

      margin-bottom: 6px;
    }

    .status-list {
      margin-top: 12px;
      padding-left: 18px;
      line-height: 1.8;
    }

    .alerts-header {

      display: flex;

      justify-content: space-between;

      align-items: center;

      margin-bottom: 12px;
    }

    .alert-row {

      display: flex;

      align-items: flex-start;

      gap: 14px;

      padding: 16px;

      border-radius: 16px;

      margin-bottom: 12px;
    }

    .alert-title {

      font-weight: 600;

      margin-bottom: 4px;
    }

    .plan-box {

      display: flex;

      align-items: flex-start;

      gap: 14px;
    }

    .plan-box mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .plan-name {

      font-weight: 700;

      margin-bottom: 6px;
    }

    .plan-price {
      color: #64748b;
      margin-bottom: 10px;
    }

    @media (max-width: 1024px) {

      .dashboard-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
  
export class DashboardViewComponent implements OnInit {

  qualityFindings = [
    {
      sourceDevice: 'SENSOR-03 #3',
      parameter: 'Chlorine',
      severityScore: 8.7,
      reviewStatus: 'Confirmed',
      riskDetected: true,
      createdAt: '07/07/2026 09:40'
    },
    {
      sourceDevice: 'SENSOR-02 #2',
      parameter: 'Turbidity',
      severityScore: 6.2,
      reviewStatus: 'Evaluated',
      riskDetected: false,
      createdAt: '07/07/2026 08:15'
    },
    {
      sourceDevice: 'SENSOR-01 #1',
      parameter: 'PH',
      severityScore: 3.4,
      reviewStatus: 'Dismissed',
      riskDetected: false,
      createdAt: '06/07/2026 18:05'
    }
  ];

  constructor(
      public store: MonitoringService,
      public router: Router
  ) {}

  ngOnInit(): void {

    if (!this.store.sensorsLoaded()) {
      this.store.fetchSensors();
    }

    if (!this.store.alertsLoaded()) {
      this.store.fetchAlerts();
    }

    if (!this.store.subscriptionLoaded()) {
      this.store.fetchSubscription();
    }
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

  getSeverityChipClass(score: number): string {

    if (score >= 8) {
      return 'chip-critical';
    }

    if (score >= 5) {
      return 'chip-warning';
    }

    return 'chip-normal';
  }

  getReviewStatusChipClass(status: string): string {

    if (status === 'Confirmed') {
      return 'chip-critical';
    }

    if (status === 'Dismissed') {
      return 'chip-normal';
    }

    return 'chip-info';
  }
}
