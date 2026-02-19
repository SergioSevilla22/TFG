import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {

  private apiUrl = 'http://localhost:3000/api/calendario';

  constructor(private http: HttpClient) {}

  getCalendarioEquipo(equipoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipo/${equipoId}`);
  }

  getICalEquipo(equipoId: number): string {
    return `${this.apiUrl}/equipo/${equipoId}/ical`;
  }
}
