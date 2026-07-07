import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceDesignService, WaterBatch } from '../../../application/service-design.service';

@Component({
  selector: 'app-water-batch-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule
  ],
  template: `
    <div class="form-page">
      <div class="header">
        <button mat-icon-button (click)="cancel()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>{{ (isEdit ? 'waterBatches.editTitle' : 'waterBatches.newTitle') | translate }}</h1>
          <p>{{ 'waterBatches.formSubtitle' | translate }}</p>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <div *ngIf="errorMessage" class="error-box">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'waterBatches.certificationCode' | translate }}</mat-label>
              <input matInput [(ngModel)]="form.certificationCode" placeholder="CERT-2026-0001">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'waterBatches.destination' | translate }}</mat-label>
              <mat-select [(ngModel)]="form.destinationSectorId">
                <mat-option *ngFor="let destination of service.destinations()" [value]="destination.id">
                  {{ destination.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'waterBatches.volume' | translate }} (L)</mat-label>
              <input matInput type="number" min="0" [(ngModel)]="form.volumeLiters">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'waterBatches.source' | translate }}</mat-label>
              <mat-select [(ngModel)]="sourceSelect" (ngModelChange)="syncSource()">
                <mat-option *ngFor="let source of sourceOptions" [value]="source">{{ source }}</mat-option>
                <mat-option value="__other__">{{ 'waterBatches.sourceOther' | translate }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field *ngIf="sourceSelect === '__other__'" appearance="outline">
              <mat-label>{{ 'waterBatches.sourceOtherPlaceholder' | translate }}</mat-label>
              <input matInput [(ngModel)]="form.source">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'waterBatches.delivery' | translate }}</mat-label>
              <input matInput type="datetime-local" [(ngModel)]="deliveryLocal">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'waterBatches.status' | translate }}</mat-label>
              <mat-select [(ngModel)]="form.status">
                <mat-option value="Pendiente">Pendiente</mat-option>
                <mat-option value="Entregado">Entregado</mat-option>
                <mat-option value="Cancelado">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="actions">
            <button mat-button (click)="cancel()">{{ 'option.cancel' | translate }}</button>
            <button mat-flat-button color="primary" (click)="save()">
              <mat-icon>check</mat-icon>
              {{ 'waterBatches.save' | translate }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-page {
      max-width: 760px;
    }

    .header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 22px;
    }

    h1 {
      margin: 0 0 6px;
      font-size: 2rem;
      font-weight: 700;
    }

    .header p {
      margin: 0;
      color: var(--muted);
    }

    .form-grid {
      display: grid;
      gap: 14px;
    }

    .error-box {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 8px;
      color: #b91c1c;
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 12px;
    }
  `]
})
export class WaterBatchFormComponent implements OnInit {
  isEdit = false;
  errorMessage = '';
  deliveryLocal = new Date().toISOString().slice(0, 16);
  sourceOptions = ['Planta de tratamiento', 'Pozo certificado', 'Reservorio municipal'];
  sourceSelect = this.sourceOptions[0];

  form: Omit<WaterBatch, 'id'> & { id?: number } = {
    certificationCode: '',
    destinationSectorId: 1,
    volumeLiters: 0,
    deliveryTimestamp: new Date().toISOString(),
    status: 'Pendiente',
    source: this.sourceOptions[0]
  };

  constructor(
    public service: ServiceDesignService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = Boolean(id);

    if (!id) return;

    const batch = this.service.getWaterBatchById(id);
    if (!batch) return;

    this.form = { ...batch };
    this.deliveryLocal = batch.deliveryTimestamp.slice(0, 16);
    this.sourceSelect = this.sourceOptions.includes(batch.source) ? batch.source : '__other__';
  }

  syncSource(): void {
    if (this.sourceSelect !== '__other__') {
      this.form.source = this.sourceSelect;
    } else {
      this.form.source = '';
    }
  }

  save(): void {
    this.errorMessage = '';

    if (!this.form.certificationCode.trim()) {
      this.errorMessage = 'Ingresa un codigo de certificacion.';
      return;
    }

    if (!this.form.destinationSectorId) {
      this.errorMessage = 'Selecciona un destino.';
      return;
    }

    if (!this.form.volumeLiters || this.form.volumeLiters <= 0) {
      this.errorMessage = 'Ingresa un volumen valido.';
      return;
    }

    if (!this.form.source.trim()) {
      this.errorMessage = 'Selecciona o escribe una fuente.';
      return;
    }

    const payload = {
      ...this.form,
      deliveryTimestamp: new Date(this.deliveryLocal).toISOString(),
      volumeLiters: Number(this.form.volumeLiters),
      destinationSectorId: Number(this.form.destinationSectorId)
    };

    if (this.isEdit && this.form.id) {
      this.service.updateWaterBatch(payload as WaterBatch);
    } else {
      const { id, ...newBatch } = payload;
      this.service.addWaterBatch(newBatch);
    }

    this.cancel();
  }

  cancel(): void {
    this.router.navigate(['/service-design']);
  }
}
