import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = 'http://localhost:3000/api/equipos';

  constructor(private http: HttpClient) {}

  getTeamsByClub(clubId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/club/${clubId}`);
  }

  createTeam(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTeamById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  assignPlayers(equipoId: number, jugadores: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${equipoId}/asignar-jugadores`, { jugadores });
  }

  assignCoach(equipoId: number, entrenadorDNI: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${equipoId}/asignar-entrenador`, {
      entrenador: entrenadorDNI,
    });
  }

  movePlayer(jugadorDNI: string, nuevoEquipoId: number | null): Observable<any> {
    return this.http.put(`${this.apiUrl}/mover-jugador`, { jugador: jugadorDNI, nuevoEquipoId });
  }

  removeCoachFromTeam(dni: string) {
    return this.http.put(`${this.apiUrl}/quitar-entrenador`, { dni });
  }

  searchClubTeams(
    clubId: number,
    filters: { nombre?: string; categoria?: string; temporada?: string },
  ) {
    const params: any = {};

    if (filters.nombre) params.nombre = filters.nombre;
    if (filters.categoria) params.categoria = filters.categoria;
    if (filters.temporada) params.temporada = filters.temporada;

    return this.http.get<any[]>(`${this.apiUrl}/club/${clubId}`, { params });
  }
}
