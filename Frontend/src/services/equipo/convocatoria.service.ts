import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ConvocatoriaService {
  private base = 'http://localhost:3000/api/convocatorias';

  constructor(private http: HttpClient) {}

  crearConvocatoria(data: any) {
    return this.http.post(this.base, data);
  }

  getConvocatoriasEquipo(equipoId: number) {
    return this.http.get<any[]>(`${this.base}/equipo/${equipoId}`);
  }

  responderConvocatoria(
    id: number,
    body: {
      jugador_dni: string;
      estado: string;
      motivo?: string;
    },
  ) {
    return this.http.post(`${this.base}/${id}/responder`, body);
  }

  enviarRecordatorio(id: number) {
    return this.http.post(`${this.base}/${id}/recordatorio`, {});
  }

  editarConvocatoria(id: number, data: any) {
    return this.http.put(`${this.base}/${id}`, data);
  }
  eliminarConvocatoria(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
