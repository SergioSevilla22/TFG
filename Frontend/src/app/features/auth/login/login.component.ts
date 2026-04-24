import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  UserForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  get email() {
    return this.UserForm.get('email');
  }
  get password() {
    return this.UserForm.get('password');
  }

  onSubmit() {
    this.loginError = '';

    if (this.UserForm.invalid) {
      this.UserForm.markAllAsTouched();
      return;
    }

    const credentials = this.UserForm.value as { email: string; password: string };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        const user = res.user;

        if (user.Rol === 'jugador' || user.Rol === 'entrenador') {
          this.router.navigate(['/equipo', user.equipo_id ? user.equipo_id : 'sin-asignar']);
        } else if (user.Rol === 'admin_club' && user.club_id) {
          this.router.navigate(['/club', user.club_id]);
        } else if (user.Rol === 'admin_plataforma') {
          this.router.navigate(['/admin']);
        } else if (user.Rol === 'tutor') {
          this.router.navigate(['/tutor-panel']);
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.loginError = err.error?.message || 'Error al iniciar sesión';
      },
    });
  }
}
