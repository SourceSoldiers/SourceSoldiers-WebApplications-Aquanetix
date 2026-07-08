import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { MonitoringService } from '../../../application/monitoring.service';
import { Alert } from '../../../domain/model/alert.entity';

@Component({
  selector: 'app-alert-resolved',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, TranslateModule
  ],
  template: `
    <div>
      <!-- Header with back button -->
      <div class="flex items-center gap-3 mb-4">
        <button mat-icon-button (click)="router.navigate(['/monitoring/alerts'])">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 style="font-family:'Manrope',sans-serif; font-size:2rem; font-weight:700; margin:0;">
            {{ 'alerts.resolvedHistory' | translate }}
          </h1>
          <p class="text-muted mt-1" style="margin:0;">
            {{ 'alerts.resolvedSubtitle' | translate }}
          </p>
        </div>
      </div>

      <div *ngIf="!store.alertsLoaded()" class="spinner-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="store.alertsLoaded()">

        <div *ngIf="resolvedAlerts.length === 0"
             style="text-align:center; padding:48px; color:#64748B;">
          <mat-icon style="font-size:2.5rem; width:2.5rem; height:2.5rem;">inbox</mat-icon>
          <p class="mt-2">{{ 'alerts.noResolved' | translate }}</p>
        </div>

        <ng-container *ngIf="resolvedAlerts.length > 0">
          <!-- Count card -->
          <mat-card class="mb-3">
            <mat-card-content style="padding:16px !important;">
              <div class="flex items-center gap-2">
                <mat-icon style="color:#10B981;">history</mat-icon>
                <span class="text-sm">
                  {{ 'alerts.resolvedCount' | translate:{ count: resolvedAlerts.length } }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Resolved alerts list -->
          <div style="display:flex; flex-direction:column; gap:8px;">
            <mat-card *ngFor="let alert of resolvedAlerts"
                      style="opacity:0.85;"
                      class="border-resolved">
              <mat-card-content style="padding:16px !important;">
                <div class="flex items-start gap-3">
                  <mat-icon style="color:#94a3b8; font-size:1.3rem; width:1.3rem; height:1.3rem; margin-top:2px; flex-shrink:0;">
                    {{ alert.severity === 'Crítica' ? 'cancel' : 'warning' }}
                  </mat-icon>
                  <div class="flex-1">
                    <div class="flex gap-2 items-center mb-2">
                      <span class="status-chip" [ngClass]="alert.severity === 'Crítica' ? 'chip-critical' : 'chip-warning'"
                            style="opacity:0.7;">
                        {{ store.alertSeverityLabel(alert) }}
                      </span>
                      <span class="status-chip chip-resolved">{{ 'alerts.resolved' | translate }}</span>
                    </div>
                    <p class="text-sm font-semibold" style="margin:0; color:#475569;">{{ store.alertMessage(alert) }}</p>
                    <p class="text-sm text-muted mt-1" style="margin:0;">
                      {{ alert.sensorName }} &nbsp;·&nbsp; {{ alert.location }} &nbsp;·&nbsp; {{ alert.type }}
                    </p>
                  </div>
                  <div style="text-align:right; min-width:120px; flex-shrink:0;">
                    <p class="text-sm text-muted" style="margin:0;">{{ store.formatDateTime(alert.timestamp) }}</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </ng-container>

      </ng-container>
    </div>
  `
})
export class AlertResolvedComponent implements OnInit {
  constructor(public store: MonitoringService, public router: Router) {}

  ngOnInit(): void {
    if (!this.store.alertsLoaded()) this.store.fetchAlerts();
  }

  get resolvedAlerts(): Alert[] {
    return this.store.alerts().filter(a => a.status === 'Resuelta');
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' } as any);
  }
}
