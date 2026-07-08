import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateModule } from '@ngx-translate/core';

import { MonitoringService } from '../../../../monitoring/application/monitoring.service';

@Component({
  selector: 'app-subscription-view',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    TranslateModule
  ],

  template: `
    <div class="subscription-page">

      <div class="header-section">

        <h1>
          {{ 'subscription.title' | translate }}
        </h1>

        <p class="subtitle">
          {{ 'subscription.subtitle' | translate }}
        </p>
      </div>

      <div
        *ngIf="!store.subscriptionLoaded()"
        class="spinner-container">

        <mat-spinner diameter="42"></mat-spinner>
      </div>

      <ng-container
        *ngIf="store.subscriptionLoaded() && store.subscription()">

        <div class="subscription-grid">

          <mat-card class="plan-card">

            <mat-card-content>

              <div class="current-badge">
                {{ 'subscription.currentPlan' | translate }}
              </div>

              <div class="plan-header">

                <div class="plan-icon">
                  <mat-icon>
                    workspace_premium
                  </mat-icon>
                </div>

                <div>
                  <h2>
                    {{ store.subscription()!.plan }}
                  </h2>

                  <p class="tier">
                    {{ store.subscription()!.tier | translate }}
                  </p>
                </div>
              </div>

              <div class="price-block">

                <span class="currency">
                  S/
                </span>

                <span class="amount">
                  {{
                    store.subscription()!.price.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }
                    )
                  }}
                </span>

                <span class="period">
                  /
                  {{
                    (
                        store.subscription()!.billingCycle === 'yearly'
                            ? 'subscription.annual'
                            : 'subscription.monthly_label'
                    ) | translate
                  }}
                </span>
              </div>

              <ul class="features-list">

                <li
                  *ngFor="
                    let feature of
                    store.subscription()!.features
                  ">

                  <mat-icon>
                    check
                  </mat-icon>

                  {{ feature | translate }}
                </li>
              </ul>

              <div class="actions">

                <button
                  mat-stroked-button
                  class="change-btn"
                  routerLink="/subscription/change-plan">

                  <mat-icon>
                    autorenew
                  </mat-icon>

                  {{ 'subscription.changePlan' | translate }}
                </button>

                <button
                  mat-button
                  class="cancel-btn">

                  {{ 'subscription.cancelSubscription' | translate }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="right-column">

            <mat-card>

              <mat-card-content>

                <h3>
                  {{ 'subscription.planUsage' | translate }}
                </h3>

                <div class="usage-item">

                  <div class="usage-label">

                    <span>
                      {{ 'subscription.sensorsConnected' | translate }}
                    </span>

                    <strong>
                      {{
                        store.subscription()!
                        .usage.sensorsConnected
                      }}
                      /
                      {{
                        store.subscription()!
                        .usage.sensorsLimit
                      }}
                    </strong>
                  </div>

                  <div class="progress-bar">

                    <div
                      class="progress blue"

                      [style.width.%]="
                        usagePercent(
                          store.subscription()!
                          .usage.sensorsConnected,

                          store.subscription()!
                          .usage.sensorsLimit
                        )
                      ">
                    </div>
                  </div>
                </div>

                <div class="usage-item">

                  <div class="usage-label">

                    <span>
                      {{ 'subscription.dataStorage' | translate }}
                    </span>

                    <strong>
                      {{
                        store.subscription()!
                        .usage.storageUsedGB
                      }}
                      GB /
                      {{
                        store.subscription()!
                        .usage.storageLimitGB
                      }}
                      GB
                    </strong>
                  </div>

                  <div class="progress-bar">

                    <div
                      class="progress green"

                      [style.width.%]="
                        usagePercent(
                          store.subscription()!
                          .usage.storageUsedGB,

                          store.subscription()!
                          .usage.storageLimitGB
                        )
                      ">
                    </div>
                  </div>
                </div>

                <div class="usage-item">

                  <div class="usage-label">

                    <span>
                      {{ 'subscription.dataExports' | translate }}
                    </span>

                    <strong>
                      {{
                        store.subscription()!
                        .usage.exports
                      }}
                      /
                      {{
                        store.subscription()!
                        .usage.exportsLimit
                      }}
                    </strong>
                  </div>

                  <div class="progress-bar">

                    <div
                      class="progress orange"

                      [style.width.%]="
                        usagePercent(
                          store.subscription()!
                          .usage.exports,

                          store.subscription()!
                          .usage.exportsLimit
                        )
                      ">
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>

              <mat-card-content>

                <h3>
                  {{ 'subscription.billingInfo' | translate }}
                </h3>

                <div class="billing-grid">

                  <span class="label">
                    {{ 'subscription.paymentMethod' | translate }}
                  </span>

                  <strong>
                    {{
                      store.subscription()!
                      .paymentMethod
                    }}
                  </strong>

                  <span class="label">
                    {{ 'subscription.startDate' | translate }}
                  </span>

                  <strong>
                    {{
                      store.subscription()!
                      .startDate
                    }}
                  </strong>

                  <span class="label">
                    {{ 'subscription.nextBilling' | translate }}
                  </span>

                  <strong>
                    {{
                      store.subscription()!
                      .nextBillingDate
                    }}
                  </strong>

                  <span class="label">
                    {{ 'subscription.amount' | translate }}
                  </span>

                  <strong>
                    S/
                    {{
                      store.subscription()!
                      .price.toFixed(2)
                    }}
                  </strong>

                  <span class="label">
                    {{ 'subscription.billingCycle' | translate }}
                  </span>

                  <strong>
                    {{
                      (
                          store.subscription()!.billingCycle === 'yearly'
                              ? 'subscription.annual'
                              : 'subscription.monthly_label'
                      ) | translate
                    }}
                  </strong>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>

              <mat-card-content>

                <div class="support-box">

                  <mat-icon>
                    headset_mic
                  </mat-icon>

                  <div>

                    <h4>
                      {{ 'subscription.needHelp' | translate }}
                    </h4>

                    <p>
                      {{ 'subscription.helpText' | translate }}
                    </p>

                    <button
                      mat-stroked-button
                      class="support-btn">

                      <mat-icon>
                        email
                      </mat-icon>

                      {{ 'subscription.contactSupport' | translate }}
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </ng-container>
    </div>
  `,

  styles: [`

    .subscription-page {
      padding: 0 8px 32px;
    }

    .header-section {
      margin-bottom: 28px;
    }

    h1 {
      margin: 0;
      font-size: 2.4rem;
      font-weight: 800;
      line-height: 1.1;
    }

    .subtitle {
      margin-top: 6px;
      color: var(--muted);
      font-size: 15px;
    }

    .subscription-grid {

      display: grid;

      grid-template-columns: 1.15fr 1.7fr;

      gap: 18px;

      align-items: start;
    }

    .plan-card {
      border-top: 4px solid #10B981;
    }

    .plan-card mat-card-content {
      padding: 26px !important;
    }

    .current-badge {

      display: inline-flex;

      align-items: center;

      justify-content: center;

      background: rgba(22, 119, 255, 0.12);

      color: #10B981;

      border-radius: 12px;

      padding: 8px 18px;

      font-size: 13px;

      font-weight: 700;

      margin-bottom: 26px;
    }

    .plan-header {

      display: flex;

      align-items: center;

      gap: 14px;

      margin-bottom: 18px;
    }

    .plan-icon {

      width: 48px;
      height: 48px;

      border-radius: 14px;

      background: rgba(16, 185, 129, 0.08);

      display: flex;

      align-items: center;

      justify-content: center;
    }

    .plan-icon mat-icon {
      color: #10B981;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    h2 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .tier {
      margin-top: 4px;
      color: var(--muted);
      font-size: 15px;
    }

    .price-block {

      display: flex;

      align-items: baseline;

      gap: 6px;

      margin-bottom: 24px;
    }

    .currency {
      font-size: 1.7rem;
      color: #10B981;
      font-weight: 700;
    }

    .amount {
      font-size: 3rem;
      line-height: 1;
      color: #10B981;
      font-weight: 800;
    }

    .period {
      color: var(--muted);
      font-size: 18px;
    }

    .features-list {

      list-style: none;

      padding: 0;

      margin: 0 0 24px;

      display: flex;

      flex-direction: column;

      gap: 12px;
    }

    .features-list li {

      display: flex;

      align-items: center;

      gap: 10px;

      font-size: 15px;
    }

    .features-list mat-icon {
      color: #22c55e;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .actions {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }

    .change-btn {
      border-color: #10B981 !important;
      color: #10B981 !important;
      height: 42px;
      border-radius: 12px !important;
      font-weight: 700;
    }

    .cancel-btn {
      color: #ff4d4f !important;
      font-weight: 600;
    }

    .right-column {

      display: flex;

      flex-direction: column;

      gap: 18px;
    }

    .right-column mat-card-content {
      padding: 22px !important;
    }

    h3 {
      margin: 0 0 22px;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .usage-item {
      margin-bottom: 24px;
    }

    .usage-label {

      display: flex;

      justify-content: space-between;

      align-items: center;

      margin-bottom: 10px;

      font-size: 14px;
    }

    .progress-bar {

      width: 100%;

      height: 10px;

      border-radius: 999px;

      overflow: hidden;

      background: #dbe3ef;
    }

    .progress {
      height: 100%;
      border-radius: 999px;
    }

    .blue {
      background: #10B981;
    }

    .green {
      background: #22c55e;
    }

    .orange {
      background: #f59e0b;
    }

    .billing-grid {

      display: grid;

      grid-template-columns: 1fr 1fr;

      gap: 18px 12px;

      font-size: 15px;
    }

    .label {
      color: var(--muted);
    }

    .support-box {

      display: flex;

      align-items: flex-start;

      gap: 14px;
    }

    .support-box mat-icon {
      color: #22c55e;
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-top: 2px;
    }

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
    }

    .support-box p {
      margin: 6px 0 16px;
      color: var(--muted);
      font-size: 14px;
    }

    .support-btn {
      border-radius: 12px !important;
      height: 42px;
      font-weight: 700;
    }

    @media (max-width: 1100px) {

      .subscription-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {

      h1 {
        font-size: 2rem;
      }

      h2 {
        font-size: 1.6rem;
      }

      .amount {
        font-size: 2.2rem;
      }

      .billing-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SubscriptionViewComponent implements OnInit {

  constructor(
      public store: MonitoringService
  ) {}

  ngOnInit(): void {

    if (!this.store.subscriptionLoaded()) {

      this.store.fetchSubscription();
    }
  }

  usagePercent(
      used: number,
      limit: number
  ): number {

    return Math.round(
        (used / limit) * 100
    );
  }
}
