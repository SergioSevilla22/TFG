import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrlLogin = 'http://localhost:3000/api/login';
  private apiUrlRegister = 'http://localhost:3000/api/register';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrlLogin, credentials);
  }

  register(userData: { DNI: string; email: string; password: string; Rol?: string }): Observable<any> {
    return this.http.post(this.apiUrlRegister, userData);
  }

  
}
