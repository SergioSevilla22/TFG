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

  getEquipoById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  
  asignarJugadores(equipoId: number, jugadores: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${equipoId}/asignar-jugadores`, { jugadores });
  }
  
  asignarEntrenador(equipoId: number, entrenadorDNI: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${equipoId}/asignar-entrenador`, { entrenador: entrenadorDNI });
  }
  
  moverJugador(jugadorDNI: string, nuevoEquipoId: number | null): Observable<any> {
    return this.http.put(`${this.apiUrl}/mover-jugador`, { jugador: jugadorDNI, nuevoEquipoId });
  }

  quitarEntrenadorEquipo(dni: string) {
    return this.http.put(
      `${this.apiUrl}/quitar-entrenador`,
      { dni }
    );
  }

  buscarEquiposClub(
    clubId: number,
    filtros: { nombre?: string; categoria?: string; temporada?: string }
  ) {
    const params: any = {};
  
    if (filtros.nombre) params.nombre = filtros.nombre;
    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.temporada) params.temporada = filtros.temporada;
  
    return this.http.get<any[]>(
      `${this.apiUrl}/club/${clubId}`,
      { params }
    );
  }
  
  
}
