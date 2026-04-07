import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClubService {
  private apiUrl = 'http://localhost:3000/api/clubes';

  constructor(private http: HttpClient) {}

  // =====================
  // CLUBS
  // =====================
  getClubs(): Observable<any[]> {
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

  searchClubs(filters: {
    nombre?: string;
    provincia?: string;
    poblacion?: string;
  }): Observable<any[]> {
    const params: any = {};

    if (filters.nombre?.trim()) params.nombre = filters.nombre.trim();
    if (filters.provincia?.trim()) params.provincia = filters.provincia.trim();
    if (filters.poblacion?.trim()) params.poblacion = filters.poblacion.trim();

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // =====================
  // PLAYERS
  // =====================
  getClubPlayers(clubId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${clubId}/jugadores`);
  }

  addClubPlayers(clubId: number, jugadores: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clubId}/jugadores`, { jugadores });
  }

  removeClubPlayer(clubId: number, dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clubId}/jugadores/${dni}`);
  }

  getClubPlayersByCategory(
    clubId: number,
    anioTemporada: number,
    edadMin: number,
    edadMax: number,
  ): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${clubId}/jugadores-categoria`, {
      params: {
        anioTemporada,
        edadMin,
        edadMax,
      },
    });
  }

  // =====================
  // COACHES
  // =====================
  getClubCoaches(clubId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${clubId}/entrenadores`);
  }

  addClubCoaches(clubId: number, entrenadores: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clubId}/entrenadores`, { entrenadores });
  }

  removeClubCoach(clubId: number, dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clubId}/entrenadores/${dni}`);
  }

  // =====================
  // SUMMARY
  // =====================
  getClubSummary(clubId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clubId}/resumen`);
  }
}
