import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemporadaService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTemporadas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/temporadas`);
  }

  createTemporada(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/temporadas`, data);
  }

  activarTemporada(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/temporadas/activar/${id}`, {});
  }

  deleteTemporada(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/temporadas/${id}`);
  }
}
