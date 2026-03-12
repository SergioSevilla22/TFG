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

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private API_URL = 'http://localhost:3000/api/ai';

  constructor(private http: HttpClient) {}

  getPlayerAnalysis(dni: string): Observable<PlayerAIResponse> {
    return this.http.get<PlayerAIResponse>(`${this.API_URL}/player/${dni}`);
  }
}
