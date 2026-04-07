import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ObservationsService {
  private apiUrl = 'http://localhost:3000/api/observaciones';

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getByPlayer(dni: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/jugador/${dni}`);
  }
}
