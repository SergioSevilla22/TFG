import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SeasonService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getSeasons(): Observable<any> {
    return this.http.get(`${this.apiUrl}/temporadas`);
  }

  createSeason(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/temporadas`, data);
  }

  activateSeason(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/temporadas/activar/${id}`, {});
  }

  deleteSeason(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/temporadas/${id}`);
  }
}
