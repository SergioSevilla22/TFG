import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class EstadisticasService {

  private base = 'http://localhost:3000/api/estadisticas';

  constructor(private http: HttpClient) {}

  getEstadisticasConvocatoria(id: number) {
    return this.http.get<any[]>(`${this.base}/convocatoria/${id}`);
  }

  guardarEstadisticasConvocatoria(id: number, estadisticas: any[]) {
    return this.http.post(`${this.base}/convocatoria/${id}`, { estadisticas });
  }

  getTotalesJugador(dni: string) {
    return this.http.get<any>(`${this.base}/jugador/${dni}`);
  }
}
