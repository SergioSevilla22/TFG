import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class RendimientoService {

  private base = 'http://localhost:3000/api/rendimiento';

  constructor(private http: HttpClient) {}

  getRendimiento(eventoId: number) {
    return this.http.get<any[]>(`${this.base}/${eventoId}`);
  }

  guardarRendimiento(eventoId: number, data: any[]) {
    return this.http.post(`${this.base}/${eventoId}`, {
      rendimiento: data
    });
  }
}
