import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateModule } from '@ngx-translate/core';

import { MonitoringService } from '../../../application/monitoring.service';
import { Alert } from '../../../domain/model/alert.entity';

@Component({
  selector: 'app-alert-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,

    TranslateModule
  ],

  template: `
    <div>

      <!-- PAGE HEADER -->
      <div class="page-header">

        <h1>
          {{ 'alerts.title' | translate }}
        </h1>

        <p class="text-muted mt-1">
          {{ 'alerts.subtitle' | translate }}
        </p>

      </div>

      <!-- TOP BAR -->
      <mat-card class="top-card">

        <mat-card-content>

          <div class="top-row">

            <!-- LEFT -->
            <div class="left-info">

              <div class="active-alerts">

                <mat-icon
                  class="
                    material-symbols-rounded
                    alert-icon
                  "
                >
                  notifications_active
                </mat-icon>

                <span>

                  {{ activeCount }}

                  {{ 'alerts.active' | translate }}

                </span>

              </div>

              <button
                mat-button
                color="primary"
                (click)="
                  router.navigate(
                    ['/monitoring/alerts/resolved']
                  )
                "
              >

                <mat-icon class="material-symbols-rounded">
                  history
                </mat-icon>

                {{ 'alerts.view-history' | translate }} ({{ resolvedCount }})

              </button>

            </div>

            <!-- FILTER -->
            <mat-form-field
              appearance="outline"
              class="severity-field"
            >
              

              <mat-select
                [(ngModel)]="severityFilter"
              >

                <mat-option value="all">
                  {{ 'alerts.allPriorities' | translate }}
                </mat-option>

                <mat-option value="Crítica">
                  {{ 'alerts.critical' | translate }}
                </mat-option>

                <mat-option value="Advertencia">
                  {{ 'alerts.warning' | translate }}
                </mat-option>

              </mat-select>

            </mat-form-field>

          </div>

        </mat-card-content>

      </mat-card>

      <!-- LOADING -->
      <div
        *ngIf="!store.alertsLoaded()"
        class="spinner-container"
      >

        <mat-spinner
          diameter="40"
          color="primary"
        ></mat-spinner>

      </div>

      <ng-container *ngIf="store.alertsLoaded()">

        <!-- EMPTY -->
        <div
          *ngIf="filteredActiveAlerts.length === 0"
          class="empty-state"
        >

          <mat-icon
            class="
              material-symbols-rounded
              empty-icon
            "
          >
            check_circle
          </mat-icon>

          <p class="empty-title">
            {{ 'alerts.noAlerts' | translate }}
          </p>

          <p class="text-sm text-muted">

            ¿Buscas el historial?

            <button
              mat-button
              color="primary"
              (click)="
                router.navigate(
                  ['/monitoring/alerts/resolved']
                )
              "
            >
              Ver alertas resueltas
            </button>

          </p>

        </div>

        <!-- ALERT LIST -->
        <div
          class="alerts-list"
          *ngIf="filteredActiveAlerts.length > 0"
        >

          <mat-card
            *ngFor="
              let alert of filteredActiveAlerts
            "
            class="alert-card"
            [ngClass]="
              alert.severity === 'Crítica'
                ? 'border-critical'
                : 'border-warning'
            "
          >

            <mat-card-content>

              <div class="alert-row">

                <!-- ICON -->
                <div
                  class="alert-icon-wrapper"
                  [ngClass]="
                    alert.severity === 'Crítica'
                      ? 'critical-bg'
                      : 'warning-bg'
                  "
                >

                  <mat-icon
                    class="material-symbols-rounded"
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

                </div>

                <!-- CONTENT -->
                <div class="flex-1">

                  <div class="chips-row">

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

                    <span
                      class="
                        status-chip
                        chip-active
                      "
                    >
                      Activa
                    </span>

                  </div>

                  <p class="alert-title">
                    {{ alert.message }}
                  </p>

                  <p class="alert-meta">

                    {{ alert.sensorName }}

                    ·

                    {{ alert.location }}

                    ·

                    {{ alert.type }}

                  </p>

                </div>

                <!-- RIGHT -->
                <div class="alert-right">

                  <p class="text-sm text-muted">

                    {{ formatDate(alert.timestamp) }}

                  </p>

                  <button
                    mat-button
                    color="primary"
                    class="details-btn"
                  >

                    {{ 'alerts.viewDetails' | translate }}

                  </button>

                </div>

              </div>

            </mat-card-content>

          </mat-card>

        </div>

        <!-- INFO CARD -->
        <mat-card class="info-card">

          <mat-card-content>

            <div class="info-row">

              <div class="info-icon">

                <mat-icon
                  class="material-symbols-rounded"
                >
                  info
                </mat-icon>

              </div>

              <div>

                <p class="info-title">

                  {{ 'alerts.whatAreAlerts' | translate }}

                </p>

                <p class="text-sm text-muted mt-1 mb-2">

                  {{ 'alerts.alertsExplanation' | translate }}

                </p>

                <button
                  mat-button
                  color="primary"
                  class="guide-btn"
                >

                  <mat-icon
                    class="material-symbols-rounded"
                  >
                    open_in_new
                  </mat-icon>

                  {{ 'alerts.viewFullGuide' | translate }}

                </button>

              </div>

            </div>

          </mat-card-content>

        </mat-card>

      </ng-container>

    </div>
  `,

  styles: [`
    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;

      margin-bottom: 6px;
    }

    .top-card {
      margin-bottom: 24px;
    }

    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 16px;

      flex-wrap: wrap;
    }

    .left-info {
      display: flex;
      align-items: center;

      gap: 16px;

      flex-wrap: wrap;
    }

    .active-alerts {
      display: flex;
      align-items: center;

      gap: 8px;

      font-weight: 700;
    }

    .alert-icon {
      color: #ff4d4f;
    }

    .severity-field {
      width: 220px;
    }

    .empty-state {
      text-align: center;

      padding: 56px 24px;

      color: #64748b;
    }

    .empty-icon {
      color: #22c55e;

      font-size: 3rem;

      width: 3rem;
      height: 3rem;
    }

    .empty-title {
      margin-top: 16px;
      margin-bottom: 8px;

      font-weight: 700;

      color: #111827;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;

      gap: 14px;
    }

    .alert-card {
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }

    .alert-card:hover {
      transform: translateY(-2px);
    }

    .alert-row {
      display: flex;
      align-items: flex-start;

      gap: 18px;
    }

    .alert-icon-wrapper {
      width: 48px;
      height: 48px;

      border-radius: 14px;

      display: flex;
      align-items: center;
      justify-content: center;

      flex-shrink: 0;
    }

    .critical-bg {
      background: #fee2e2;
    }

    .warning-bg {
      background: #fff7ed;
    }

    .chips-row {
      display: flex;
      align-items: center;

      gap: 8px;

      margin-bottom: 12px;
    }

    .alert-title {
      font-weight: 700;

      margin-bottom: 6px;
    }

    .alert-meta {
      font-size: 13px;

      color: #64748b;
    }

    .alert-right {
      text-align: right;

      min-width: 110px;

      flex-shrink: 0;
    }

    .details-btn {
      margin-top: 6px;
    }

    .info-card {
      margin-top: 28px;

      background: #eff6ff !important;

      border: 1px solid #bfdbfe !important;
    }

    .info-row {
      display: flex;
      align-items: flex-start;

      gap: 16px;
    }

    .info-icon {
      width: 42px;
      height: 42px;

      border-radius: 12px;

      display: flex;
      align-items: center;
      justify-content: center;

      background: #dbeafe;

      flex-shrink: 0;
    }

    .info-icon mat-icon {
      color: #2563eb;
    }

    .info-title {
      font-weight: 700;

      color: #111827;
    }

    .guide-btn {
      padding-left: 0 !important;
    }

    @media (max-width: 768px) {

      .top-row {
        flex-direction: column;
        align-items: stretch;
      }

      .severity-field {
        width: 100%;
      }

      .alert-row {
        flex-direction: column;
      }

      .alert-right {
        text-align: left;

        min-width: auto;
      }
    }
  `]
})
export class AlertListComponent implements OnInit {

  severityFilter = 'all';

  constructor(
      public store: MonitoringService,
      public router: Router
  ) {}

  ngOnInit(): void {

    if (!this.store.alertsLoaded()) {
      this.store.fetchAlerts();
    }
  }

  get activeCount() {

    return this.store.alerts()
        .filter(a => a.status === 'Activa')
        .length;
  }

  get resolvedCount() {

    return this.store.alerts()
        .filter(a => a.status === 'Resuelta')
        .length;
  }

  get filteredActiveAlerts(): Alert[] {

    return this.store.alerts().filter(a =>

        a.status === 'Activa' &&

        (
            this.severityFilter === 'all' ||

            a.severity === this.severityFilter
        )
    );
  }

  formatDate(iso: string): string {

    if (!iso) return '';

    const diff = Math.round(
        (
            Date.now() -

            new Date(iso).getTime()
        ) / 60000
    );

    if (diff < 60) {
      return `Hace ${diff} min`;
    }

    if (diff < 1440) {
      return `Hace ${Math.round(diff / 60)} h`;
    }

    return new Date(iso)
        .toLocaleDateString('es-PE');
  }
}