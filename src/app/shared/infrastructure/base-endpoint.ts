import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class BaseEndpoint<T> {
  constructor(
    protected http: HttpClient,
    protected baseUrl: string,
    protected endpointPath: string
  ) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}${this.endpointPath}`);
  }

  getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${this.endpointPath}/${id}`);
  }

  create(resource: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${this.endpointPath}`, resource);
  }

  update(id: number | string, resource: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${this.endpointPath}/${id}`, resource);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${this.endpointPath}/${id}`);
  }
}
