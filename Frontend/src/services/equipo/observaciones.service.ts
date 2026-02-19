import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ObservacionesService {
  private apiUrl = 'http://localhost:3000/api/observaciones';

  constructor(private http: HttpClient) {}

  crear(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getPorJugador(dni: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/jugador/${dni}`);
  }
}