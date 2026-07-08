import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface QualityAnalysis {
  id: number;
  sensorSourceId: number;
  detectedParameters: string;
  anomalyStatus: string;
  severityScore: number;
  hasContaminationPeakPrediction: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class QualityAnalysisService {
  readonly analyses = signal<QualityAnalysis[]>([]);
  readonly loaded = signal(false);
  readonly error = signal('');

  constructor(private readonly http: HttpClient) {}

  fetchAll(): void {
    this.loaded.set(false);
    this.http.get<QualityAnalysis[]>(`${environment.apiUrl}/quality-analysis`).subscribe({
      next: analyses => {
        this.analyses.set(analyses);
        this.loaded.set(true);
      },
      error: error => this.handleError(error)
    });
  }

  create(sensorSourceId: number, detectedParameters: string, severityScore: number): void {
    this.error.set('');
    this.http.post<QualityAnalysis>(`${environment.apiUrl}/quality-analysis`, {
      sensorSourceId,
      detectedParameters,
      severityScore
    }).subscribe({
      next: created => this.analyses.update(items => [created, ...items]),
      error: error => this.handleError(error)
    });
  }

  private handleError(error: unknown): void {
    const httpError = error as HttpErrorResponse;
    this.error.set(
      httpError?.error?.detail ||
      httpError?.error?.message ||
      httpError?.message ||
      'The request could not be completed.'
    );
    this.loaded.set(true);
  }
}
