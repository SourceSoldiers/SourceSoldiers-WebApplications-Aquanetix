import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';

import { MonitoringService } from '../../../../monitoring/application/monitoring.service';
import { Sensor } from '../../../domain/model/sensor.entity';
import { ServiceDesignService } from '../../../../service-design/application/service-design.service';

@Component({
  selector: 'app-sensor-form',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule
  ],

  template: `
    <div>

      <h1
        style="
          font-family:'Manrope',sans-serif;
          font-size:2rem;
          font-weight:700;
          margin:0 0 24px;
          color:var(--text);
        "
      >
        {{ (
          isEdit
              ? 'sensors.editSensor'
              : 'sensors.newSensor'
      ) | translate
        }}
      </h1>

      <mat-card style="max-width:1000px;">

        <mat-card-content
          style="padding:24px !important;"
        >

          <mat-form-field
            appearance="outline"
            class="w-full mb-3"
          >

            <mat-label>
              {{ 'sensors.nameLabel' | translate }} *
            </mat-label>

            <input
              matInput
              [(ngModel)]="form.name"
              placeholder="Ej: SENSOR-07"
              required
            >

          </mat-form-field>

          <mat-form-field
            appearance="outline"
            class="w-full mb-3"
          >

            <mat-label>
              {{ 'sensors.locationLabel' | translate }} *
            </mat-label>

            <mat-select
              [(ngModel)]="form.destinationId"
              required
            >

              <mat-option
                *ngFor="
                  let destination of serviceDesign.destinations()
                "
                [value]="destination.id"
              >

                {{ destination.name }}

              </mat-option>

            </mat-select>

            <mat-hint
              *ngIf="serviceDesign.destinations().length === 0"
            >
              {{ 'sensors.noDestinations' | translate }}
            </mat-hint>

          </mat-form-field>

          <mat-form-field
            appearance="outline"
            class="w-full mb-3"
          >

            <mat-label>
              {{ 'sensors.typeLabel' | translate }} *
            </mat-label>

            <mat-select
              [(ngModel)]="form.type"
              (ngModelChange)="onTypeChange()"
            >

              <mat-option
                *ngFor="
                  let opt of sensorTypeOptions
                "
                [value]="opt.value"
              >

                {{ opt.label }}

              </mat-option>

            </mat-select>

          </mat-form-field>

          <mat-form-field
            appearance="outline"
            class="w-full mb-3"
          >

            <mat-label>
              {{ 'sensors.unitOfMeasure' | translate }} *
            </mat-label>

            <input
              matInput
              [(ngModel)]="form.unit"
              placeholder="Ej: pH, NTU, bar, %"
            >

            <mat-hint>
              {{ 'sensors.autoFilled' | translate }}
            </mat-hint>

          </mat-form-field>

          <mat-form-field
            appearance="outline"
            class="w-full mb-3"
          >

            <mat-label>
              {{ 'sensors.currentValueLabel' | translate }} *
            </mat-label>

            <input
              matInput
              type="number"
              step="0.1"
              [(ngModel)]="form.currentValue"
              placeholder="Ej: 7.2"
            >

            <mat-hint>
              {{ 'sensors.historyGenNote' | translate }}
            </mat-hint>

          </mat-form-field>

          <div class="flex gap-3 mb-3">

            <mat-form-field
              appearance="outline"
              style="flex:1;"
            >

              <mat-label>
                {{ 'sensors.minThreshold' | translate }} *
              </mat-label>

              <input
                matInput
                type="number"
                [(ngModel)]="form.minAlert"
                placeholder="0.0"
              >

            </mat-form-field>

            <mat-form-field
              appearance="outline"
              style="flex:1;"
            >

              <mat-label>
                {{ 'sensors.maxThreshold' | translate }} *
              </mat-label>

              <input
                matInput
                type="number"
                [(ngModel)]="form.maxAlert"
                placeholder="100.0"
              >

            </mat-form-field>

          </div>

          <div
            class="
              flex
              gap-2
              mt-2
              flex-wrap
            "
          >

            <button
              mat-flat-button
              color="primary"
              (click)="saveSensor()"
            >

              <mat-icon>
                save
              </mat-icon>

              {{ (
                isEdit
                    ? 'sensors.updateSensor'
                    : 'sensors.saveSensor'
            ) | translate
              }}

            </button>

            <button
              mat-stroked-button
              (click)="navigateBack()"
            >
              {{ 'sensors.cancel' | translate }}
            </button>

            <button
              *ngIf="isEdit"
              mat-raised-button
              color="warn"
              (click)="openDeleteModal()"
            >

              <mat-icon>
                delete
              </mat-icon>

              {{ 'sensors.deleteSensor' | translate }}

            </button>

          </div>

          <div
            *ngIf="store.errors().length"
            style="
              color:#ef4444;
              margin-top:12px;
              font-size:13px;
            "
          >

            {{ 'errors.occurred' | translate }}:
            {{ store.errors().join(', ') }}

          </div>

        </mat-card-content>

      </mat-card>

      <div
        *ngIf="showDeleteModal"
        style="
          position:fixed;
          inset:0;
          background:rgba(0,0,0,0.45);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:9999;
        "
      >

        <div
          style="
            width:420px;
            background:white;
            border-radius:20px;
            padding:28px;
            position:relative;
            box-shadow:0 20px 40px rgba(0,0,0,0.25);
            font-family:'Manrope',sans-serif;
          "
        >

          <button
            (click)="closeDeleteModal()"
            style="
              position:absolute;
              top:18px;
              right:18px;
              width:42px;
              height:42px;
              border:none;
              border-radius:50%;
              background:#f3f4f6;
              cursor:pointer;
              font-size:22px;
              color:#6b7280;
            "
          >
            ×
          </button>

          <h2
            style="
              margin:0 0 28px;
              font-size:2rem;
              font-weight:700;
              color:#111827;
            "
          >
            {{ 'sensors.confirmDeleteTitle' | translate }}
          </h2>

          <div
            style="
              display:flex;
              gap:16px;
              align-items:flex-start;
              margin-bottom:32px;
            "
          >

            <div
              style="
                color:#ef4444;
                font-size:42px;
                line-height:1;
              "
            >
              ⚠
            </div>

            <p
              style="
                margin:0;
                font-size:1rem;
                line-height:1.6;
                color:#111827;
              "
            >
              {{ 'sensors.confirmDeleteMsg' | translate:{ name: form.name } }}
            </p>

          </div>

          <div
            style="
              display:flex;
              justify-content:flex-end;
              gap:14px;
            "
          >

            <button
              (click)="closeDeleteModal()"
              style="
                border:none;
                background:transparent;
                color:#10b981;
                font-size:1rem;
                font-weight:600;
                cursor:pointer;
              "
            >
              {{ 'sensors.cancel' | translate }}
            </button>

            <button
              (click)="confirmDelete()"
              style="
                background:#ef4444;
                color:white;
                border:none;
                border-radius:10px;
                padding:12px 18px;
                font-size:1rem;
                font-weight:600;
                cursor:pointer;
                display:flex;
                align-items:center;
                gap:8px;
              "
            >
              <mat-icon>delete</mat-icon>
              {{ 'sensors.confirmDeleteBtn' | translate }}
            </button>

          </div>

        </div>

      </div>

    </div>
  `
})
export class SensorFormComponent
    implements OnInit {

  isEdit = false;

  showDeleteModal = false;

  sensorId: number | null = null;

  form = {
    name: '',
    location: '',
    destinationId: null as number | null,
    type: '',
    unit: '',
    currentValue: 0,
    minAlert: null as number | null,
    maxAlert: null as number | null
  };

  sensorTypeOptions = [
    { label: 'pH', value: 'PH' },
    { label: 'Turbidity', value: 'Turbidity' },
    { label: 'Pressure', value: 'Pressure' },
    { label: 'Level', value: 'Level' },
    { label: 'Chlorine', value: 'Chlorine' },
    { label: 'Flow', value: 'Flow' }
  ];

  private unitSuggestions:
      Record<string, string> = {

    'PH': 'pH',
    'Turbidity': 'NTU',
    'Pressure': 'bar',
    'Level': '%',
    'Chlorine': 'ppm',
    'Flow': 'L/s'
  };

  constructor(
      public store: MonitoringService,
      public serviceDesign: ServiceDesignService,
      private route: ActivatedRoute,
      public router: Router
  ) {}

  ngOnInit(): void {

    const id =
        this.route.snapshot.paramMap.get('id');

    this.isEdit = !!id;

    if (id) {

      this.sensorId = Number(id);

      if (!this.store.sensorsLoaded()) {

        this.store.fetchSensors();
      }

      this.tryFill();
    }
  }

  private tryFill(): void {

    if (!this.sensorId) return;

    const sensor =
        this.store.getSensorById(this.sensorId);

    if (sensor) {

      this.form.name =
          sensor.name;

      this.form.location =
          sensor.location;

      this.form.destinationId =
          sensor.destinationId ??
          this.serviceDesign.destinations()
              .find(destination => destination.name === sensor.location)
              ?.id ??
          null;

      this.form.type =
          sensor.type;

      this.form.unit =
          sensor.unit;

      this.form.currentValue =
          sensor.currentValue;

      this.form.minAlert =
          sensor.minAlert;

      this.form.maxAlert =
          sensor.maxAlert;

    } else {

      setTimeout(
          () => this.tryFill(),
          300
      );
    }
  }

  onTypeChange(): void {

    if (
        this.form.type &&
        this.unitSuggestions[
            this.form.type
            ]
    ) {

      this.form.unit =
          this.unitSuggestions[
              this.form.type
              ];
    }
  }

  saveSensor(): void {

    let status:
        'Normal'
        | 'Advertencia'
        | 'Alerta' = 'Normal';

    const min = Number(this.form.minAlert);
    const max = Number(this.form.maxAlert);
    const currentValue = Number(this.form.currentValue);

    if (currentValue < min || currentValue > max) {
      status = 'Alerta';
    } else {
      const margin = (max - min) * 0.1;

      if (currentValue <= min + margin || currentValue >= max - margin) {
        status = 'Advertencia';
      }
    }

    const destination =
        this.serviceDesign.destinations()
            .find(item => item.id === Number(this.form.destinationId));

    if (!destination) return;

    const history = this.generateHistory(currentValue);

    const sensor = new Sensor({

      id:
          this.isEdit
              ? this.sensorId
              : null,

      name:
      this.form.name,

      location:
          destination.name,

      destinationId:
          destination.id,

      type:
      this.form.type,

      unit:
      this.form.unit,

      currentValue:
          currentValue,

      status,

      lastUpdated:
          new Date().toISOString(),

      recommendedRange:
          `${min} - ${max} ${this.form.unit}`,

      minAlert:
          min,

      maxAlert:
          max,

      history
    });

    if (this.isEdit) {

      this.store.updateSensor(sensor);

    } else {

      this.store.addSensor(sensor);
    }

    this.navigateBack();
  }

  openDeleteModal(): void {

    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {

    this.showDeleteModal = false;
  }

  private generateHistory(currentValue: number): number[] {
    const base = Number(currentValue) || 0;

    if (base === 0) {
      return [0, 0, 0, 0, 0, 0, 0];
    }

    const variation = base * 0.08;

    return Array.from({ length: 7 }, (_, index) => {
      if (index === 6) return Number(base.toFixed(2));

      const value =
          base + (Math.random() * variation * 2 - variation);

      return Number(value.toFixed(2));
    });
  }

  confirmDelete(): void {

    if (!this.sensorId) return;

    this.store.deleteSensor(
        this.sensorId
    );

    this.closeDeleteModal();

    this.navigateBack();
  }

  navigateBack(): void {

    this.router.navigate([
      '/devices'
    ]);
  }
}

