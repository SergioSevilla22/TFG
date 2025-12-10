import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {

  private apiUrl = 'http://localhost:3000/api/equipos';

  constructor(private http: HttpClient) {}

  obtenerEquiposPorClub(clubId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/club/${clubId}`);
  }

  crearEquipo(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  eliminarEquipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
