import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EventService {
  private base = 'http://localhost:3000/api/eventos';

  constructor(private http: HttpClient) {}

  createEvent(data: any) {
    return this.http.post(this.base, data);
  }

  getTeamEvents(equipoId: number) {
    return this.http.get<any[]>(`${this.base}/equipo/${equipoId}`);
  }

  respondToEvent(
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

  deleteEvent(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  editEvent(id: number, data: any) {
    return this.http.put(`${this.base}/${id}`, data);
  }
}
