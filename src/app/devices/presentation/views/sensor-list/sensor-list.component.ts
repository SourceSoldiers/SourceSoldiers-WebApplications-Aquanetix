import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';

import { MonitoringService } from '../../../../monitoring/application/monitoring.service';
import { Sensor } from '../../../domain/model/sensor.entity';

@Component({
  selector: 'app-sensor-list',

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
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,

    TranslateModule
  ],

  template: `
    <div>

      <!-- HEADER -->

      <div class="page-header">

        <h1>
          {{ 'sensors.title' | translate }}
        </h1>

        <p class="text-muted mt-1">
          {{ 'sensors.subtitle' | translate }}
        </p>

      </div>

      <!-- FILTERS -->

      <mat-card class="filters-card">

        <mat-card-content>

          <div class="filters-row">

            <mat-form-field
              appearance="outline"
              class="search-field"
            >

              <mat-label>
                {{ 'sensors.search' | translate }}
              </mat-label>

              <input
                matInput
                [(ngModel)]="search"
                (ngModelChange)="applyFilter()"
              >

              <mat-icon matSuffix>
                search
              </mat-icon>

            </mat-form-field>

            <mat-form-field
              appearance="outline"
              class="status-field"
            >

              <mat-label>
                {{ 'sensors.status' | translate }}
              </mat-label>

              <mat-select
                [(ngModel)]="statusFilter"
                (ngModelChange)="applyFilter()"
              >

                <mat-option value="all">
                  {{ 'sensors.allStatuses' | translate }}
                </mat-option>

                <mat-option value="Normal">
                  {{ 'sensors.normalStatus' | translate }}
                </mat-option>

                <mat-option value="Advertencia">
                  {{ 'sensors.warningStatus' | translate }}
                </mat-option>

                <mat-option value="Alerta">
                  {{ 'sensors.alertStatus' | translate }}
                </mat-option>

              </mat-select>

            </mat-form-field>

            <div class="add-btn-wrapper">

              <button
                mat-flat-button
                color="primary"
                (click)="navigateToNew()"
              >

                <mat-icon>
                  add
                </mat-icon>

                {{ 'sensors.addSensor' | translate }}

              </button>

            </div>

          </div>

        </mat-card-content>

      </mat-card>

      <!-- TABLE -->

      <mat-card class="table-card">

        <mat-card-content class="table-wrapper">

          <div
            *ngIf="!store.sensorsLoaded()"
            class="spinner-container"
          >

            <mat-spinner diameter="40"></mat-spinner>

          </div>

          <table
            mat-table
            [dataSource]="paginatedSensors"
            *ngIf="store.sensorsLoaded()"
          >

            <!-- NAME -->

            <ng-container matColumnDef="name">

              <th mat-header-cell *matHeaderCellDef>
                {{ 'sensors.name' | translate }}
              </th>

              <td mat-cell *matCellDef="let s">

                <div class="sensor-name">

                  <div class="sensor-avatar">

                    <mat-icon>
                      sensors
                    </mat-icon>

                  </div>

                  <div>

                    <p class="sensor-title">
                      {{ s.name }}
                    </p>

                    <p class="sensor-subtitle">
                      Sensor ID #{{ s.id }}
                    </p>

                  </div>

                </div>

              </td>

            </ng-container>

            <!-- LOCATION -->

            <ng-container matColumnDef="location">

              <th mat-header-cell *matHeaderCellDef>
                {{ 'sensors.location' | translate }}
              </th>

              <td mat-cell *matCellDef="let s">
                {{ s.location }}
              </td>

            </ng-container>

            <!-- TYPE -->

            <ng-container matColumnDef="type">

              <th mat-header-cell *matHeaderCellDef>
                {{ 'sensors.type' | translate }}
              </th>

              <td mat-cell *matCellDef="let s">
                {{ s.type }}
              </td>

            </ng-container>

            <!-- VALUE -->

            <ng-container matColumnDef="currentValue">

              <th mat-header-cell *matHeaderCellDef>
                {{ 'sensors.currentValue' | translate }}
              </th>

              <td mat-cell *matCellDef="let s">

                <span class="sensor-value">
                  {{ s.currentValue }}
                </span>

                <span class="sensor-unit">
                  {{ s.unit }}
                </span>

              </td>

            </ng-container>

            <!-- STATUS -->

            <ng-container matColumnDef="status">

              <th mat-header-cell *matHeaderCellDef>
                {{ 'sensors.status' | translate }}
              </th>

              <td mat-cell *matCellDef="let s">

                <span
                  class="status-chip"
                  [ngClass]="getStatusChipClass(s.status)"
                >
                  {{ s.status }}
                </span>

              </td>

            </ng-container>

            <!-- LAST UPDATED -->

            <ng-container matColumnDef="lastUpdated">

              <th mat-header-cell *matHeaderCellDef>
                {{ 'sensors.lastUpdated' | translate }}
              </th>

              <td mat-cell *matCellDef="let s">

                {{ formatDate(s.lastUpdated) }}

              </td>

            </ng-container>

            <!-- ACTIONS -->

            <ng-container matColumnDef="actions">

              <th mat-header-cell *matHeaderCellDef>
                {{ 'sensors.actions' | translate }}
              </th>

              <td mat-cell *matCellDef="let s">

                <div class="actions-row">

                  <button
                    mat-icon-button
                    matTooltip= "{{ 'sensors.viewDetail' | translate }}"
                    (click)="navigateToDetail(s.id)"
                  >

                    <mat-icon>
                      visibility
                    </mat-icon>

                  </button>

                  <button
                    mat-icon-button
                    matTooltip="{{ 'sensors.edit' | translate }}"
                    (click)="navigateToEdit(s.id)"
                  >

                    <mat-icon>
                      edit
                    </mat-icon>

                  </button>

                </div>

              </td>

            </ng-container>

            <tr
              mat-header-row
              *matHeaderRowDef="displayedColumns"
            ></tr>

            <tr
              mat-row
              *matRowDef="
                let row;
                columns: displayedColumns;
              "
            ></tr>

          </table>

          <!-- PAGINATION -->

          <div
            class="pagination-wrapper"
            *ngIf="filteredSensors.length > 0"
          >

            <div class="pagination-controls">

              <button
                class="page-btn"
                [disabled]="currentPage === 1"
                (click)="goToFirstPage()"
              >
                «
              </button>

              <button
                class="page-btn"
                [disabled]="currentPage === 1"
                (click)="goToPreviousPage()"
              >
                ‹
              </button>

              <div class="current-page">
                {{ currentPage }}
              </div>

              <button
                class="page-btn"
                [disabled]="currentPage === totalPages"
                (click)="goToNextPage()"
              >
                ›
              </button>

              <button
                class="page-btn"
                [disabled]="currentPage === totalPages"
                (click)="goToLastPage()"
              >
                »
              </button>

            </div>

            <mat-form-field
              appearance="outline"
              class="page-size-select"
            >

              <mat-select
                [(ngModel)]="pageSize"
                (ngModelChange)="onPageSizeChange()"
              >

                <mat-option [value]="5">
                  5
                </mat-option>

                <mat-option [value]="10">
                  10
                </mat-option>

                <mat-option [value]="20">
                  20
                </mat-option>

              </mat-select>

            </mat-form-field>

          </div>

        </mat-card-content>

      </mat-card>

    </div>
  `,

  styles: [`
    .page-header{
      margin-bottom:32px;
    }

    .page-header h1{
      font-size:2.5rem;
      font-weight:700;
      margin-bottom:6px;
    }

    .filters-card{
      margin-bottom:24px;
    }

    .filters-row{
      display:flex;
      align-items:center;
      gap:16px;
      flex-wrap:wrap;
    }

    .search-field{
      width:320px;
    }

    .status-field{
      width:220px;
    }

    .add-btn-wrapper{
      margin-left:auto;
    }

    .table-card{
      overflow:hidden;
    }

    .table-wrapper{
      overflow-x:auto;
    }

    table{
      width:100%;
      min-width:980px;
    }

    th.mat-mdc-header-cell{
      font-weight:700;
      background:#f8fafc;
    }

    td.mat-mdc-cell,
    th.mat-mdc-header-cell{
      padding-top:18px !important;
      padding-bottom:18px !important;
    }

    .sensor-name{
      display:flex;
      align-items:center;
      gap:14px;
    }

    .sensor-avatar{
      width:42px;
      height:42px;
      border-radius:12px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#d1fae5;
    }

    .sensor-avatar mat-icon{
      color:#10B981;
    }

    .sensor-title{
      font-weight:600;
      margin-bottom:2px;
    }

    .sensor-subtitle{
      font-size:12px;
      color:#64748b;
    }

    .sensor-value{
      font-weight:700;
    }

    .sensor-unit{
      margin-left:4px;
      color:#64748b;
    }

    .actions-row{
      display:flex;
      gap:4px;
    }

    .status-chip{
      padding:6px 14px;
      border-radius:999px;
      color:white;
      font-size:12px;
      font-weight:600;
    }

    .chip-normal{
      background:#4CAF50;
    }

    .chip-warning{
      background:#f59e0b;
    }

    .chip-alert{
      background:#ef4444;
    }

    .pagination-wrapper{
      display:flex;
      justify-content:center;
      align-items:center;
      gap:16px;
      padding:24px 0 8px;
      flex-wrap:wrap;
    }

    .pagination-controls{
      display:flex;
      align-items:center;
      gap:12px;
    }

    .page-btn{
      border:none;
      background:none;
      color:#94a3b8;
      font-size:22px;
      cursor:pointer;
      width:32px;
      height:32px;
    }

    .page-btn:disabled{
      opacity:.4;
      cursor:not-allowed;
    }

    .current-page{
      width:40px;
      height:40px;
      border-radius:999px;
      background:#dcfce7;
      color:#0f172a;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:600;
    }

    .page-size-select{
      width:90px;
    }

    @media (max-width:768px){

      .filters-row{
        flex-direction:column;
        align-items:stretch;
      }

      .search-field,
      .status-field{
        width:100%;
      }

      .add-btn-wrapper{
        margin-left:0;
      }
    }
  `]
})
export class SensorListComponent implements OnInit {

  search = '';

  statusFilter = 'all';

  filteredSensors: Sensor[] = [];

  paginatedSensors: Sensor[] = [];

  displayedColumns = [
    'name',
    'location',
    'type',
    'currentValue',
    'status',
    'lastUpdated',
    'actions'
  ];

  currentPage = 1;

  pageSize = 10;

  totalPages = 1;

  constructor(
      public store: MonitoringService,
      public router: Router
  ) {}

  ngOnInit(): void {

    if (!this.store.sensorsLoaded()) {

      this.store.fetchSensors();

      const interval = setInterval(() => {

        if (this.store.sensorsLoaded()) {

          this.applyFilter();

          clearInterval(interval);
        }

      }, 100);

    } else {

      this.applyFilter();
    }
  }

  applyFilter(): void {

    const s = this.search.toLowerCase();

    this.filteredSensors =
        this.store.sensors().filter(sensor => {

          const matchSearch =
              !s ||

              sensor.name.toLowerCase().includes(s) ||

              sensor.location.toLowerCase().includes(s) ||

              sensor.type.toLowerCase().includes(s);

          const matchStatus =
              this.statusFilter === 'all' ||

              sensor.status === this.statusFilter;

          return matchSearch && matchStatus;
        });

    this.totalPages =
        Math.max(
            1,
            Math.ceil(
                this.filteredSensors.length / this.pageSize
            )
        );

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePaginatedSensors();
  }

  updatePaginatedSensors(): void {

    const start =
        (this.currentPage - 1) * this.pageSize;

    const end =
        start + this.pageSize;

    this.paginatedSensors =
        this.filteredSensors.slice(start, end);
  }

  onPageSizeChange(): void {

    this.currentPage = 1;

    this.applyFilter();
  }

  goToFirstPage(): void {

    this.currentPage = 1;

    this.updatePaginatedSensors();
  }

  goToPreviousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePaginatedSensors();
    }
  }

  goToNextPage(): void {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.updatePaginatedSensors();
    }
  }

  goToLastPage(): void {

    this.currentPage = this.totalPages;

    this.updatePaginatedSensors();
  }

  navigateToNew() {

    this.router.navigate([
      '/devices/new'
    ]);
  }

  navigateToEdit(id: any) {

    this.router.navigate([
      '/devices',
      id,
      'edit'
    ]);
  }

  navigateToDetail(id: any) {

    this.router.navigate([
      '/devices',
      id
    ]);
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

  formatDate(iso: string): string {

    if (!iso) return '';

    return new Date(iso).toLocaleString(
        'es-PE',
        {
          dateStyle: 'short',
          timeStyle: 'short'
        } as any
    );
  }
}

