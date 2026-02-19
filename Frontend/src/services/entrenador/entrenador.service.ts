import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EntrenadorService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  buscarEntrenadoresGlobal(q: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/entrenadores/buscar?q=${encodeURIComponent(q)}`);
  }
}
