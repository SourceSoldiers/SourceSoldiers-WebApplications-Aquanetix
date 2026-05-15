import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div style="text-align:center; padding: 80px 24px;">
      <mat-icon style="font-size:4rem; width:4rem; height:4rem; color:#64748B;">search_off</mat-icon>
      <h1 style="font-family:'Manrope',sans-serif; margin-top:16px;">{{ 'page-not-found.title' | translate }}</h1>
      <p style="color:#64748B;">{{ 'page-not-found.content' | translate }}</p>
      <button mat-flat-button color="primary" (click)="router.navigate(['/monitoring/dashboard'])">
        {{ 'page-not-found.go-home' | translate }}
      </button>
    </div>
  `
})
export class PageNotFoundComponent {
  constructor(public router: Router) {}
}
