import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClubService {

  private apiUrl = 'http://localhost:3000/api/clubes';

  constructor(private http: HttpClient) {}

  getClubes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // 🔥 NUEVO: Obtener un club por ID
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

  getJugadoresClub(clubId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${clubId}/jugadores`);
  }
  
  addJugadoresClub(clubId: number, jugadores: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clubId}/jugadores`, { jugadores });
  }
  
  removeJugadorClub(clubId: number, dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clubId}/jugadores/${dni}`);
  }
}
