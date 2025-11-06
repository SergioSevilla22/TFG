import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrlLogin = 'http://localhost:3000/api/login';
  private apiUrlRegister = 'http://localhost:3000/api/register';
  private apiUrlRegisterCSV = 'http://localhost:3000/api/register-massive';
  private apiUrlForgotPassword = 'http://localhost:3000/api/forgot-password';
  private apiUrlResetPassword = 'http://localhost:3000/api/reset-password';
  private apiUrlAccept = 'http://localhost:3000/api/accept-invitation';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrlLogin, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
 
 
  register(userData: { DNI: string; nombre: string; email: string; telefono: string; Rol?: string }): Observable<any> {
    return this.http.post(this.apiUrlRegister, userData);
  }
  

  registerMassive(formData: FormData) {
  return this.http.post(this.apiUrlRegisterCSV, formData);
}

forgotPassword(email: string) {
  return this.http.post(this.apiUrlForgotPassword,{ email });
}

resetPassword(data: { token: string; nuevaPassword: string }) {
  return this.http.post(this.apiUrlResetPassword, data);
}

acceptInvitation(data: { token: string, password: string }) {
  return this.http.post(this.apiUrlAccept, data);
}


  
}
