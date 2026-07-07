import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceDesignService, WaterBatch } from '../../../application/service-design.service';

@Component({
  selector: 'app-water-batch-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    TranslateModule
  ],
  template: `
    <div class="page-heading">
      <div>
        <h1>{{ 'waterBatches.title' | translate }}</h1>
        <p>{{ 'waterBatches.subtitle' | translate }}</p>
      </div>

      <div class="heading-actions">
        <button mat-stroked-button (click)="router.navigate(['/service-design/destinations'])">
          <mat-icon>map</mat-icon>
          {{ 'destinations.manage' | translate }}
        </button>
        <button mat-flat-button color="primary" (click)="router.navigate(['/service-design/new'])">
          <mat-icon>add</mat-icon>
          {{ 'waterBatches.addBatch' | translate }}
        </button>
      </div>
    </div>

    <div class="kpi-grid">
      <mat-card>
        <mat-card-content class="kpi-card">
          <mat-icon>water_drop</mat-icon>
          <div>
            <p>{{ 'waterBatches.totalVolume' | translate }}</p>
            <strong>{{ service.totalVolume().toLocaleString('es-PE') }} L</strong>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-card>
        <mat-card-content class="kpi-card">
          <mat-icon>pending_actions</mat-icon>
          <div>
            <p>{{ 'waterBatches.pendingDeliveries' | translate }}</p>
            <strong>{{ service.pendingCount() }}</strong>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-card>
        <mat-card-content class="kpi-card">
          <mat-icon>pin_drop</mat-icon>
          <div>
            <p>{{ 'destinations.title' | translate }}</p>
            <strong>{{ service.destinations().length }}</strong>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <mat-card class="table-card">
      <mat-card-content>
        <mat-form-field appearance="outline" class="search">
          <mat-label>{{ 'waterBatches.searchPlaceholder' | translate }}</mat-label>
          <input matInput [(ngModel)]="searchText">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <table mat-table [dataSource]="filteredBatches()">
          <ng-container matColumnDef="certificationCode">
            <th mat-header-cell *matHeaderCellDef>{{ 'waterBatches.certificationCode' | translate }}</th>
            <td mat-cell *matCellDef="let batch">
              <strong>{{ batch.certificationCode }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="destination">
            <th mat-header-cell *matHeaderCellDef>{{ 'waterBatches.destination' | translate }}</th>
            <td mat-cell *matCellDef="let batch">{{ service.destinationName(batch.destinationSectorId) }}</td>
          </ng-container>

          <ng-container matColumnDef="volume">
            <th mat-header-cell *matHeaderCellDef>{{ 'waterBatches.volume' | translate }}</th>
            <td mat-cell *matCellDef="let batch">{{ batch.volumeLiters.toLocaleString('es-PE') }} L</td>
          </ng-container>

          <ng-container matColumnDef="source">
            <th mat-header-cell *matHeaderCellDef>{{ 'waterBatches.source' | translate }}</th>
            <td mat-cell *matCellDef="let batch">{{ batch.source }}</td>
          </ng-container>

          <ng-container matColumnDef="delivery">
            <th mat-header-cell *matHeaderCellDef>{{ 'waterBatches.delivery' | translate }}</th>
            <td mat-cell *matCellDef="let batch">{{ formatDate(batch.deliveryTimestamp) }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>{{ 'waterBatches.status' | translate }}</th>
            <td mat-cell *matCellDef="let batch">
              <span class="status-chip" [ngClass]="statusClass(batch.status)">{{ batch.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>{{ 'waterBatches.actions' | translate }}</th>
            <td mat-cell *matCellDef="let batch">
              <button mat-icon-button (click)="router.navigate(['/service-design', batch.id, 'edit'])">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="service.deleteWaterBatch(batch.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-heading {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0 0 6px;
    }

    .page-heading p,
    .kpi-card p {
      color: var(--muted);
      margin: 0;
    }

    .heading-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 22px;
    }

    .kpi-card {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .kpi-card mat-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #10B981;
      background: #d1fae5;
    }

    .kpi-card strong {
      display: block;
      margin-top: 4px;
      font-size: 1.6rem;
      color: var(--text);
    }

    .table-card mat-card-content {
      overflow-x: auto;
    }

    .search {
      width: min(360px, 100%);
      margin-bottom: 12px;
    }

    table {
      width: 100%;
      min-width: 880px;
    }

    .chip-pending {
      background: #f59e0b;
      color: white;
    }

    .chip-delivered {
      background: #10B981;
      color: white;
    }

    .chip-cancelled {
      background: #ef4444;
      color: white;
    }

    @media (max-width: 760px) {
      .page-heading {
        flex-direction: column;
      }
    }
  `]
})
export class WaterBatchListComponent {
  columns = ['certificationCode', 'destination', 'volume', 'source', 'delivery', 'status', 'actions'];
  searchText = '';

  filteredBatches(): WaterBatch[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) return this.service.waterBatches();
    return this.service.waterBatches().filter(batch =>
      batch.certificationCode.toLowerCase().includes(q) ||
      batch.source.toLowerCase().includes(q) ||
      this.service.destinationName(batch.destinationSectorId).toLowerCase().includes(q)
    );
  }

  constructor(
    public service: ServiceDesignService,
    public router: Router
  ) {}

  formatDate(value: string): string {
    return new Date(value).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  statusClass(status: WaterBatch['status']): string {
    if (status === 'Entregado') return 'chip-delivered';
    if (status === 'Cancelado') return 'chip-cancelled';
    return 'chip-pending';
  }
}
