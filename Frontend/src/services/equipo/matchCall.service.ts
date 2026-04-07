import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MatchCallService {
  private base = 'http://localhost:3000/api/convocatorias';

  constructor(private http: HttpClient) {}

  createMatchCall(data: any) {
    return this.http.post(this.base, data);
  }

  getTeamMatchCalls(equipoId: number) {
    return this.http.get<any[]>(`${this.base}/equipo/${equipoId}`);
  }

  respondMatchCall(
    id: number,
    body: {
      jugador_dni: string;
      estado: string;
      motivo?: string;
    },
  ) {
    return this.http.post(`${this.base}/${id}/responder`, body);
  }

  sendReminder(id: number) {
    return this.http.post(`${this.base}/${id}/recordatorio`, {});
  }

  editMatchCall(id: number, data: any) {
    return this.http.put(`${this.base}/${id}`, data);
  }

  deleteMatchCall(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
