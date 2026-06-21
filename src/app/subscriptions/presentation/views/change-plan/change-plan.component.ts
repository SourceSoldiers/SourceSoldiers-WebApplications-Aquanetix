import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { MonitoringService } from '../../../../monitoring/application/monitoring.service';

@Component({
    selector: 'app-change-plan',

    standalone: true,

    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule
    ],

    template: `
    <div class="change-plan-page">

      <div class="header-section">

        <button
          mat-icon-button
          routerLink="/subscription"
          class="back-btn">

          <mat-icon>arrow_back</mat-icon>
        </button>

        <div>
          <h1>{{ 'subscription.changePlan' | translate }}</h1>

          <p class="subtitle">
              {{ 'subscription.choosePlanSubtitle' | translate }}
          </p>
        </div>
      </div>

      <div class="billing-toggle">

        <button
          class="toggle-btn"
          [class.active]="billingCycle() === 'monthly'"
          (click)="setBillingCycle('monthly')">

            {{ 'subscription.month' | translate }}
        </button>

        <button
          class="toggle-btn"
          [class.active]="billingCycle() === 'yearly'"
          (click)="setBillingCycle('yearly')">

            {{ 'subscription.annual' | translate }}

          <span class="badge">
            {{ 'subscription.twoMonthsFree' | translate }}
          </span>
        </button>
      </div>

      <div class="plans-grid">

        <mat-card
          *ngFor="let plan of plans()"
          class="plan-card"
          [class.highlight]="plan.highlight">

          <div
            *ngIf="plan.highlight"
            class="popular-badge">

              ⭐ {{ 'subscription.mostPopular' | translate }}
          </div>

          <h2>{{ plan.name }}</h2>

          <p class="tier">
            {{ plan.tier }}
          </p>

          <div class="price">

            <span class="currency">
              S/
            </span>

            <span class="amount">

              {{
                billingCycle() === 'monthly'
                  ? plan.monthlyPrice.toLocaleString()
                  : plan.annualMonthlyPrice.toLocaleString()
              }}

            </span>

            <span class="period">
              / {{ 'subscription.month' | translate }}
            </span>
          </div>

          <p
            *ngIf="billingCycle() === 'yearly'"
            class="annual-note">

            S/
            {{
              (
                plan.annualMonthlyPrice * 12
              ).toLocaleString()
            }}
              /{{ 'subscription.annual' | translate | lowercase }}
              ·
              {{ 'subscription.youSave' | translate }}
            S/
            {{
              (
                (plan.monthlyPrice * 12) -
                (plan.annualMonthlyPrice * 12)
              ).toLocaleString()
            }}
          </p>

          <ul class="features">

            <li *ngFor="let feature of plan.features">

              <mat-icon>
                check_circle
              </mat-icon>

              {{ feature }}
            </li>
          </ul>

          <button
            mat-stroked-button
            class="plan-btn"

            [class.current]="
              currentSubscription()?.plan === plan.name
            "

            (click)="openConfirmModal(plan)">

              {{
                  currentSubscription()?.plan === plan.name
                          ? ('✓ ' + ('subscription.currentPlan' | translate))
                          : (('subscription.choose' | translate) + ' ' + plan.name)
              }}
          </button>
        </mat-card>
      </div>

      <!-- MODAL -->

      <div
        *ngIf="showConfirmModal()"
        class="modal-overlay">

        <div class="confirm-modal">

          <button
            class="close-btn"
            (click)="closeModal()">

            <mat-icon>
              close
            </mat-icon>
          </button>

          <h3>
              {{ 'subscription.confirmChange' | translate }}
          </h3>

          <p class="confirm-text">

              {{ 'subscription.confirmChangeTo' | translate }}
              <strong>{{ selectedPlan()?.name }}</strong>?
          </p>

          <div class="summary-box">

            <p>

                {{ 'subscription.newPrice' | translate }}:

              <strong>
                S/
                {{
                  billingCycle() === 'monthly'
                    ? selectedPlan()?.monthlyPrice?.toLocaleString()
                    : selectedPlan()?.annualMonthlyPrice?.toLocaleString()
                }}

                  /{{ 'subscription.month' | translate }}
              </strong>
            </p>

            <p>

                {{ 'subscription.cycle' | translate }}:

              <strong>
                  {{
                      (
                              billingCycle() === 'monthly'
                                      ? 'subscription.month'
                                      : 'subscription.annual'
                      ) | translate
                  }}
              </strong>
            </p>
          </div>

          <div class="modal-actions">

            <button
              mat-button
              class="cancel-modal-btn"
              (click)="closeModal()">

                {{ 'subscription.cancel' | translate }}
            </button>

            <button
              mat-flat-button
              class="confirm-btn"
              (click)="confirmPlanChange()">

              <mat-icon>
                check
              </mat-icon>

                {{ 'subscription.confirmButton' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

    styles: [`

    .change-plan-page {
      padding: 0 8px 40px;
    }

    .header-section {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 34px;
    }

    .back-btn {
      margin-top: 2px;
      color: var(--primary);
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.1;
    }

    .subtitle {
      margin-top: 8px;
      color: var(--muted);
      font-size: 14px;
    }

    .billing-toggle {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 38px;
    }

    .toggle-btn {
      border: none;
      background: white;
      border-radius: 12px;
      padding: 10px 20px;
      font-family: 'Inter';
      font-weight: 700;
      cursor: pointer;
      transition: 0.2s ease;
      box-shadow: var(--shadow);
    }

    .toggle-btn.active {
      background: var(--primary);
      color: white;
    }

    .badge {
      margin-left: 8px;
      background: #22c55e;
      color: white;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }

    .plans-grid {

      display: grid;

      grid-template-columns:
      repeat(auto-fit, minmax(280px, 1fr));

      gap: 22px;

      align-items: stretch;
    }

    .plan-card {

      position: relative;

      overflow: visible !important;

      padding: 26px;

      border-radius: 22px !important;

      transition: 0.25s ease;

      min-height: 460px;

      display: flex;

      flex-direction: column;
    }

    .plan-card:hover {
      transform: translateY(-4px);
    }

    .highlight {
      border: 2px solid #1677ff !important;
      padding-top: 34px;
    }

    .popular-badge {

      position: absolute;

      top: -14px;

      left: 50%;

      transform: translateX(-50%);

      background: #1677ff;

      color: white;

      padding: 6px 16px;

      border-radius: 999px;

      font-size: 11px;

      font-weight: 700;

      line-height: 1;

      white-space: nowrap;

      z-index: 100;

      box-shadow:
        0 4px 12px rgba(22, 119, 255, 0.25);
    }

    h2 {

      margin: 0;

      font-size: 0.95rem;

      font-weight: 700;

      line-height: 1.2;
    }

    .tier {
      margin-top: 6px;
      color: var(--muted);
      margin-bottom: 22px;
      font-size: 14px;
    }

    .price {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 10px;
    }

    .currency {
      font-size: 1.3rem;
      font-weight: 700;
    }

    .amount {
      font-size: 2rem;
      line-height: 1;
      font-weight: 700;
    }

    .period {
      color: var(--muted);
      font-size: 16px;
    }

    .annual-note {
      color: #22c55e;
      font-weight: 700;
      margin-bottom: 22px;
      font-size: 13px;
    }

    .features {

      list-style: none;

      padding: 0;

      margin: 0 0 26px;

      display: flex;

      flex-direction: column;

      gap: 12px;

      flex: 1;
    }

    .features li {

      display: flex;

      align-items: center;

      gap: 8px;

      font-size: 12px;
    }

    .features mat-icon {
      color: #22c55e;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .plan-btn {

      width: 100%;

      height: 46px;

      border-radius: 12px !important;

      font-weight: 700;

      font-size: 14px;

      margin-top: auto;

      border-color: var(--primary) !important;

      color: var(--primary) !important;
    }

    .plan-btn.current {
      background: rgba(65, 196, 170, 0.08);
    }

    /* MODAL */

    .modal-overlay {

      position: fixed;

      inset: 0;

      background: rgba(15, 23, 42, 0.45);

      display: flex;

      align-items: center;

      justify-content: center;

      z-index: 999;
    }

    .confirm-modal {

      position: relative;

      width: 420px;

      background: white;

      border-radius: 20px;

      padding: 26px;

      box-shadow:
        0 12px 40px rgba(15,23,42,0.18);
    }

    .close-btn {

      position: absolute;

      top: 18px;

      right: 18px;

      border: none;

      width: 44px;

      height: 44px;

      border-radius: 50%;

      background: #f1f5f9;

      cursor: pointer;

      display: flex;

      align-items: center;

      justify-content: center;
    }

    h3 {
      margin: 0 0 26px;
      font-size: 1.6rem;
      font-weight: 700;
    }

    .confirm-text {
      margin-bottom: 18px;
      color: var(--text);
      line-height: 1.5;
    }

    .summary-box {

      background: #f8fafc;

      border-radius: 14px;

      padding: 18px;

      margin-bottom: 24px;
    }

    .summary-box p {
      margin: 0 0 10px;
      font-size: 14px;
    }

    .summary-box p:last-child {
      margin-bottom: 0;
    }

    .modal-actions {

      display: flex;

      justify-content: flex-end;

      gap: 12px;
    }

    .cancel-modal-btn {
      color: var(--primary) !important;
      font-weight: 700;
    }

    .confirm-btn {

      background: var(--primary) !important;

      color: white !important;

      height: 42px;

      border-radius: 12px !important;

      font-weight: 700;
    }

    @media (max-width: 768px) {

      h1 {
        font-size: 2rem;
      }

      .plans-grid {
        grid-template-columns: 1fr;
      }

      .plan-card {
        min-height: auto;
      }

      .amount {
        font-size: 2rem;
      }

      .confirm-modal {
        width: calc(100% - 32px);
      }
    }
  `]
})
export class ChangePlanComponent implements OnInit {

    billingCycle = signal<'monthly' | 'yearly'>(
        'monthly'
    );

    showConfirmModal = signal(false);

    selectedPlan = signal<any>(null);

    plans = computed(() =>
        this.monitoringService.plans()
    );

    currentSubscription = computed(() =>
        this.monitoringService.subscription()
    );

    constructor(
        private monitoringService: MonitoringService,
        private router: Router
    ) {}

    ngOnInit(): void {

        this.monitoringService.fetchPlans();

        this.monitoringService.fetchSubscription();
    }

    setBillingCycle(
        cycle: 'monthly' | 'yearly'
    ): void {

        this.billingCycle.set(cycle);

        this.monitoringService.changeBillingCycle(
            cycle
        );
    }

    openConfirmModal(plan: any): void {

        if (
            this.currentSubscription()?.plan === plan.name
        ) {
            return;
        }

        this.selectedPlan.set(plan);

        this.showConfirmModal.set(true);
    }

    closeModal(): void {

        this.showConfirmModal.set(false);
    }

    confirmPlanChange(): void {

        const plan = this.selectedPlan();

        const price =
            this.billingCycle() === 'monthly'
                ? plan.monthlyPrice
                : plan.annualMonthlyPrice;

        this.monitoringService.changePlan(
            plan.name,
            plan.tier,
            price,
            plan.features
        );

        this.showConfirmModal.set(false);

        setTimeout(() => {

            this.router.navigate([
                '/subscription'
            ]);

        }, 400);
    }
}