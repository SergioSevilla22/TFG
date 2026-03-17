import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlayerAIResponse {
  performance_score: number;
  metrics?: {
    goles: number;
    asistencias: number;
    minutos: number;
    disciplina: number;
    participacion: number;
    entrenamiento?: number;
    intensidad?: number;
    actitud?: number;
  };
}

export interface AttendanceAIResponse {
  attendance_ratio: number;
  dropout_probability: number;
  trend: string;

  history: {
    match: string;
    value: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private API_URL = 'http://localhost:3000/api/ai';

  constructor(private http: HttpClient) {}

  getPlayerAnalysis(dni: string): Observable<PlayerAIResponse> {
    return this.http.get<PlayerAIResponse>(`${this.API_URL}/player/${dni}`);
  }

  getAttendanceAnalysis(dni: string): Observable<AttendanceAIResponse> {
    return this.http.get<AttendanceAIResponse>(`${this.API_URL}/attendance/${dni}`);
  }
}
