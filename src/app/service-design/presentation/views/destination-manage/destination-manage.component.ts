import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceDesignService } from '../../../application/service-design.service';

@Component({
  selector: 'app-destination-manage',
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
    <div class="destination-page">
      <div class="header">
        <button mat-icon-button (click)="router.navigate(['/service-design'])">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>{{ 'destinations.title' | translate }}</h1>
          <p>{{ 'destinations.subtitle' | translate }}</p>
        </div>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <h2>{{ 'destinations.addTitle' | translate }}</h2>

          <div *ngIf="message" class="message" [class.error]="messageIsError">
            {{ message }}
          </div>

          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'destinations.name' | translate }}</mat-label>
              <input matInput [(ngModel)]="form.name" placeholder="Planta Norte">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'destinations.address' | translate }}</mat-label>
              <input matInput [(ngModel)]="form.address" [placeholder]="'destinations.addressPlaceholder' | translate">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'destinations.description' | translate }}</mat-label>
              <input matInput [(ngModel)]="form.description" [placeholder]="'destinations.descriptionPlaceholder' | translate">
            </mat-form-field>
          </div>

          <button mat-flat-button color="primary" (click)="addDestination()">
            <mat-icon>add</mat-icon>
            {{ 'destinations.add' | translate }}
          </button>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="table-wrapper">
          <table mat-table [dataSource]="service.destinations()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'destinations.name' | translate }}</th>
              <td mat-cell *matCellDef="let destination"><strong>{{ destination.name }}</strong></td>
            </ng-container>

            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>{{ 'destinations.address' | translate }}</th>
              <td mat-cell *matCellDef="let destination">{{ destination.address }}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>{{ 'destinations.description' | translate }}</th>
              <td mat-cell *matCellDef="let destination">{{ destination.description }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ 'destinations.actions' | translate }}</th>
              <td mat-cell *matCellDef="let destination">
                <button mat-icon-button color="warn" (click)="deleteDestination(destination.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .destination-page {
      max-width: 980px;
    }

    .header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 22px;
    }

    h1,
    h2 {
      margin: 0;
      font-weight: 700;
    }

    h1 {
      font-size: 2rem;
    }

    h2 {
      font-size: 1.2rem;
      margin-bottom: 16px;
    }

    .header p {
      margin: 6px 0 0;
      color: var(--muted);
    }

    .form-card {
      margin-bottom: 22px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      margin-bottom: 10px;
    }

    .message {
      padding: 10px 12px;
      margin-bottom: 14px;
      border-radius: 8px;
      color: #065f46;
      background: #dcfce7;
    }

    .message.error {
      color: #b91c1c;
      background: #fef2f2;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 720px;
    }
  `]
})
export class DestinationManageComponent {
  columns = ['name', 'address', 'description', 'actions'];
  message = '';
  messageIsError = false;
  form = {
    name: '',
    address: '',
    description: ''
  };

  constructor(
    public service: ServiceDesignService,
    public router: Router
  ) {}

  addDestination(): void {
    this.message = '';

    if (!this.form.name.trim()) {
      this.message = 'Ingresa un nombre de destino.';
      this.messageIsError = true;
      return;
    }

    this.service.addDestination({
      name: this.form.name.trim(),
      address: this.form.address.trim(),
      description: this.form.description.trim()
    });

    this.form = { name: '', address: '', description: '' };
    this.message = 'Destino agregado correctamente.';
    this.messageIsError = false;
  }

  deleteDestination(id: number): void {
    const deleted = this.service.deleteDestination(id);
    this.message = deleted
      ? 'Destino eliminado correctamente.'
      : 'No se puede eliminar un destino usado por un lote.';
    this.messageIsError = !deleted;
  }
}
