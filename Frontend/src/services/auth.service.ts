import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // =====================
  // ENDPOINTS BASE
  // =====================
  private apiBase = 'http://localhost:3000/api';

  private apiUrlLogin = `${this.apiBase}/login`;
  private apiUrlRegister = `${this.apiBase}/register`; // ⚠️ legado
  private apiUrlRegisterCSV = `${this.apiBase}/register-massive`; // ⚠️ legado
  private apiUrlForgotPassword = `${this.apiBase}/forgot-password`;
  private apiUrlResetPassword = `${this.apiBase}/reset-password`;
  private apiUrlAccept = `${this.apiBase}/accept-invitation`;
  private apiUrlUpdateUser = `${this.apiBase}/update-user`;
  private apiUrlChangePassword = `${this.apiBase}/change-password`;
  private apiUrlDeleteUser = `${this.apiBase}/delete-user`;

  constructor(private http: HttpClient) {}

  // =====================
  // SSR SAFE STORAGE
  // =====================
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private setItem(key: string, value: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(key, value);
    }
  }

  private getItem(key: string): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(key);
  }

  private removeItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    }
  }

  // =====================
  // AUTH
  // =====================
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrlLogin, credentials).pipe(
      tap((res: any) => {
        this.setItem('token', res.token);
        this.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout(): void {
    this.removeItem('token');
    this.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getItem('token');
  }

  getUser(): any {
    const user = this.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): string | null {
    return this.getUser()?.Rol ?? null;
  }

  getUserClubId(): number | null {
    return this.getUser()?.club_id ?? null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  // =====================
  // REGISTROS (NUEVO MODELO)
  // =====================

  /**
   * 🔴 ADMIN PLATAFORMA
   */
  registerByAdminPlataforma(data: {
    DNI: string;
    nombre: string;
    email: string;
    telefono: string;
    Rol: string;
    club_id?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiBase}/admin/register-user`, data);
  }

  /**
   * 🔵 ADMIN CLUB
   */
  registerByAdminClub(data: {
    DNI: string;
    nombre: string;
    email: string;
    telefono: string;
    Rol: 'jugador' | 'entrenador' | 'tutor';
  }): Observable<any> {
    return this.http.post(`${this.apiBase}/club-admin/register-user`, data);
  }

  /**
   * 🔵 ADMIN CLUB - CSV
   */
  registerMasivoAdminClub(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiBase}/club-admin/register-massive`, formData);
  }

  // =====================
  // ⚠️ REGISTROS LEGADOS
  // =====================
  register(userData: any): Observable<any> {
    return this.http.post(this.apiUrlRegister, userData);
  }

  registerMassive(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrlRegisterCSV, formData);
  }

  // =====================
  // PASSWORD / INVITACIONES
  // =====================
  forgotPassword(email: string): Observable<any> {
    return this.http.post(this.apiUrlForgotPassword, { email });
  }

  resetPassword(data: { token: string; nuevaPassword: string }): Observable<any> {
    return this.http.post(this.apiUrlResetPassword, data);
  }

  acceptInvitation(data: { token: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrlAccept, data);
  }

  changePassword(data: {
    email: string;
    actualPassword: string;
    nuevaPassword: string;
  }): Observable<any> {
    return this.http.post(this.apiUrlChangePassword, data);
  }

  // =====================
  // USUARIOS
  // =====================
  updateUser(datos: FormData, actualizarSesion = true): Observable<any> {
    return this.http.put(this.apiUrlUpdateUser, datos).pipe(
      tap((res: any) => {
        if (actualizarSesion && res.user) {
          this.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  deleteUser(dni: string): Observable<any> {
    return this.http.request('delete', this.apiUrlDeleteUser, {
      body: { dni }
    });
  }

  getUserByDni(dni: string): Observable<any> {
    return this.http.get(`${this.apiBase}/get-user?dni=${dni}`);
  }

  updateUserRole(data: { dni: string; nuevoRol: string }): Observable<any> {
    return this.http.put(`${this.apiBase}/update-role`, data);
  }

  // =====================
  // TUTOR
  // =====================
  registrarDependiente(data: any) {
    return this.http.post(`${this.apiBase}/tutor/registrar-dependiente`, data);
  }

  obtenerDependientes(idTutor: string) {
    return this.http.get(`${this.apiBase}/tutor/dependientes?idTutor=${idTutor}`);
  }

  quitarVinculo(DNI: string) {
    return this.http.put(`${this.apiBase}/tutor/quitar-vinculo`, { DNI });
  }

  // =====================
  // ROLES
  // =====================
  isAdminPlataforma(): boolean {
    return this.getUserRole() === 'admin_plataforma';
  }

  isAdminClub(): boolean {
    return this.getUserRole() === 'admin_club';
  }

  isAnyAdmin(): boolean {
    return this.isAdminPlataforma() || this.isAdminClub();
  }
}
