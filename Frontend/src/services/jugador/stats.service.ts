import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private base = 'http://localhost:3000/api/estadisticas';

  constructor(private http: HttpClient) {}

  getMatchCallStats(id: number) {
    return this.http.get<any[]>(`${this.base}/convocatoria/${id}`);
  }

  saveMatchCallStats(id: number, estadisticas: any[]) {
    return this.http.post(`${this.base}/convocatoria/${id}`, { estadisticas });
  }

  getPlayerTotals(dni: string) {
    return this.http.get<any>(`${this.base}/jugador/${dni}`);
  }

  getPlayerMatchCallStats(convocatoriaId: number, dni: string) {
    return this.http.get<any>(
      `http://localhost:3000/api/estadisticas/convocatoria/${convocatoriaId}/jugador/${dni}`,
    );
  }
}
