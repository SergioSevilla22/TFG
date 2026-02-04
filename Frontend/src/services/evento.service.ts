import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EventoService {
  private base = 'http://localhost:3000/api/eventos';

  constructor(private http: HttpClient) {}

  crearEvento(data: any) {
    return this.http.post(this.base, data);
  }

  getEventosEquipo(equipoId: number) {
    return this.http.get<any[]>(`${this.base}/equipo/${equipoId}`);
  }

  responderEvento(id: number, body: {
    jugador_dni: string;
    estado: string;
    motivo?: string;
  }) {
    return this.http.post(`${this.base}/${id}/responder`, body);
  }
  

  enviarRecordatorio(id: number) {
    return this.http.post(`${this.base}/${id}/recordatorio`, {});
  }

  eliminarEvento(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

}
