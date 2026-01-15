import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClubService {

  private apiUrl = 'http://localhost:3000/api/clubes';

  constructor(private http: HttpClient) {}

  // =====================
  // CLUBES
  // =====================
  getClubes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getClubById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createClub(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateClub(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteClub(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  buscarClubes(filtros: {
    nombre?: string;
    provincia?: string;
    poblacion?: string;
  }): Observable<any[]> {
    const params: any = {};

    if (filtros.nombre?.trim()) params.nombre = filtros.nombre.trim();
    if (filtros.provincia?.trim()) params.provincia = filtros.provincia.trim();
    if (filtros.poblacion?.trim()) params.poblacion = filtros.poblacion.trim();

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // =====================
  // JUGADORES
  // =====================
  getJugadoresClub(clubId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${clubId}/jugadores`);
  }

  addJugadoresClub(clubId: number, jugadores: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clubId}/jugadores`, { jugadores });
  }

  removeJugadorClub(clubId: number, dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clubId}/jugadores/${dni}`);
  }

  // =====================
  // ENTRENADORES
  // =====================
  getEntrenadoresClub(clubId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${clubId}/entrenadores`);
  }

  addEntrenadoresClub(clubId: number, entrenadores: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clubId}/entrenadores`, { entrenadores });
  }

  removeEntrenadorClub(clubId: number, dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clubId}/entrenadores/${dni}`);
  }

  // =====================
  // RESUMEN
  // =====================
  getResumenClub(clubId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clubId}/resumen`);
  }
}
