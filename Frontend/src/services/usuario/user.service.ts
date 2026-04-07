import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  transferUser(dni: string, clubId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${dni}/traspaso`, {
      club_id: clubId,
    });
  }

  deleteUser(dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dni}`);
  }
}
