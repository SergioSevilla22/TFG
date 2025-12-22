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
  private apiUrlUpdateUser = 'http://localhost:3000/api/update-user';
  private apiUrlChangePassword = 'http://localhost:3000/api/change-password';
  private apiUrlDeleteUser = 'http://localhost:3000/api/delete-user';


  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrlLogin, credentials).pipe(
      tap((res: any) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getUser(): any {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  register(userData: { DNI: string; nombre: string; email: string; telefono: string; Rol?: string }): Observable<any> {
    return this.http.post(this.apiUrlRegister, userData);
  }

  registerMassive(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrlRegisterCSV, formData);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(this.apiUrlForgotPassword, { email });
  }

  resetPassword(data: { token: string; nuevaPassword: string }): Observable<any> {
    return this.http.post(this.apiUrlResetPassword, data);
  }

  acceptInvitation(data: { token: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrlAccept, data);
  }

  updateUser(datos: FormData, actualizarSesion = true): Observable<any> {
    return this.http.put(this.apiUrlUpdateUser, datos).pipe(
      tap((res: any) => {
        if (actualizarSesion && res.user && typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  changePassword(data: { email: string; actualPassword: string; nuevaPassword: string }): Observable<any> {
    return this.http.post(this.apiUrlChangePassword, data);
  }

  deleteUser(dni: string): Observable<any> {
    return this.http.request('delete', this.apiUrlDeleteUser, {body: { dni }});
  }

  getUserByDni(dni: string) {
  return this.http.get(`http://localhost:3000/api/get-user?dni=${dni}`);
  }

  updateUserRole(data: { dni: string; nuevoRol: string }): Observable<any> {
    return this.http.put('http://localhost:3000/api/update-role', data);
  }

  getUserRole(): string | null {
    const user = this.getUser();
    if (!user) return null;
    return user.Rol || null;
  }
  

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  registrarDependiente(data: any) {
    return this.http.post("http://localhost:3000/api/tutor/registrar-dependiente", data);
  }
  
  obtenerDependientes(idTutor: string) {
    return this.http.get(`http://localhost:3000/api/tutor/dependientes?idTutor=${idTutor}`);
  }
  
  quitarVinculo(DNI: string) {
    return this.http.put("http://localhost:3000/api/tutor/quitar-vinculo", { DNI });
  }
  
}
