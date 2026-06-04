import { Component } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

import {
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';

@Component({
  selector: 'app-layout',

  standalone: true,

  imports: [
    CommonModule,

    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,

    TranslateModule
  ],

  template: `
    <mat-sidenav-container class="sidenav-container">

      <!-- MOBILE SIDENAV -->
      <mat-sidenav
        #drawer
        mode="over"
        [opened]="drawerOpen"
      >

        <mat-nav-list>

          <a
            mat-list-item
            *ngFor="let item of navItems"
            [routerLink]="item.to"
            routerLinkActive="active-link"
            (click)="drawerOpen = false"
          >

            <mat-icon class="material-symbols-rounded" matListItemIcon>
              {{ item.icon }}
            </mat-icon>

            <span>
              {{ item.label | translate }}
            </span>

          </a>

        </mat-nav-list>

      </mat-sidenav>

      <mat-sidenav-content>

        <!-- TOP NAVBAR -->
        <mat-toolbar class="app-toolbar">

          <button
            mat-icon-button
            class="menu-btn"
            (click)="drawerOpen = !drawerOpen"
          >

            <mat-icon class="material-symbols-rounded">
              menu
            </mat-icon>

          </button>

          <!-- BRAND -->
          <div class="brand-wrapper">

            <div class="brand-logo">
              <mat-icon class="material-symbols-rounded">
                water_drop
              </mat-icon>
            </div>

            <span class="brand-name">
              Aquanetix
            </span>

          </div>

          <span class="spacer"></span>

          <!-- DESKTOP NAV -->
          <nav class="desktop-nav">

            <a
              *ngFor="let item of navItems"
              mat-button
              class="nav-link"
              [routerLink]="item.to"
              routerLinkActive="active-nav-link"
            >

              <mat-icon class="material-symbols-rounded nav-icon">
                {{ item.icon }}
              </mat-icon>

              <span>
                {{ item.label | translate }}
              </span>

            </a>

          </nav>

          <!-- LANGUAGE SWITCHER -->
          <div class="lang-switcher">

            <button
              mat-button
              [class.lang-active]="currentLang === 'es'"
              (click)="switchLang('es')"
            >
              ES
            </button>

            <button
              mat-button
              [class.lang-active]="currentLang === 'en'"
              (click)="switchLang('en')"
            >
              EN
            </button>

          </div>

        </mat-toolbar>

        <!-- PAGE CONTENT -->
        <main class="page-container">
          <router-outlet></router-outlet>
        </main>

        <!-- FOOTER -->
        <footer class="app-footer">

          <p>
            © 2026 Aquanetix — Water Quality Monitoring Platform
          </p>

        </footer>

      </mat-sidenav-content>

    </mat-sidenav-container>
  `,

  styles: [`
    .sidenav-container {
      height: 100vh;
      background: #f4f7fb;
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;

      height: 78px;

      padding: 0 36px;

      background: #41c4aa !important;

      border-bottom:
        1px solid rgba(255,255,255,0.08);

      box-shadow:
        0 2px 10px rgba(0,0,0,0.04);
    }

    .brand-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      width: 42px;
      height: 42px;

      border-radius: 12px;

      display: flex;
      align-items: center;
      justify-content: center;

      background: rgba(255,255,255,0.16);
    }

    .brand-logo mat-icon {
      color: white;
      font-size: 22px;
    }

    .brand-name {
      font-family: 'Manrope', sans-serif;

      font-size: 1.35rem;
      font-weight: 700;

      letter-spacing: -0.03em;

      color: white;
    }

    .spacer {
      flex: 1;
    }

    .desktop-nav {
      display: flex;
      align-items: center;

      gap: 6px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;

      height: 44px;

      padding: 0 16px !important;

      border-radius: 12px;

      color: rgba(255,255,255,0.9) !important;

      font-size: 14px;
      font-weight: 400;

      transition:
        background 0.2s ease,
        color 0.2s ease;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.12);
    }

    .active-nav-link {
      background: rgba(255,255,255,0.16);

      color: white !important;

      font-weight: 600;
    }

    .nav-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .lang-switcher {
      display: flex;

      margin-left: 18px;

      border: 1px solid #cbd5e1;

      border-radius: 6px;

      overflow: hidden;

      background: white;
    }

    .lang-switcher button {

      min-width: 52px;

      height: 44px;

      border-radius: 0 !important;

      color: #0f172a !important;

      font-size: 14px;

      font-weight: 700;

      background: white !important;
    }

    .lang-switcher button.lang-active {

      background: #e2e8f0 !important;

      color: #0f172a !important;
    }

    .lang-switcher button.lang-active span {

      color: #0f172a !important;
    }

    .app-footer {
      padding: 18px;

      background: #0f172a;

      text-align: center;

      color: rgba(255,255,255,0.72);

      font-size: 13px;
    }

    .app-footer p {
      margin: 0;
    }

    .menu-btn {
      display: none;

      color: white;

      margin-right: 8px;
    }

    @media (max-width: 1024px) {

      .desktop-nav {
        display: none;
      }

      .menu-btn {
        display: inline-flex;
      }

      .app-toolbar {
        padding: 0 20px;
      }

      .page-container {
        padding: 24px;
      }
    }
  `]
})
export class LayoutComponent {

  drawerOpen = false;

  currentLang = 'es';

  navItems = [
    {
      label: 'option.dashboard',
      to: '/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'option.sensors',
      to: '/devices',
      icon: 'sensors'
    },
    {
      label: 'option.alerts',
      to: '/monitoring/alerts',
      icon: 'notifications'
    },
    {
      label: 'option.subscription',
      to: '/subscription',
      icon: 'card_membership'
    }
  ];

  constructor(
      private translate: TranslateService
  ) {

    this.translate.setDefaultLang('es');

    this.translate.use('es');
  }

  switchLang(lang: string): void {

    this.currentLang = lang;

    this.translate.use(lang);
  }
}