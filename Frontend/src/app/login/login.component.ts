import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private authService: AuthService) {}

  UserForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  get email() { return this.UserForm.get('email'); }
  get password() { return this.UserForm.get('password'); }

  onSubmit() {
    if (this.UserForm.invalid) {
      this.UserForm.markAllAsTouched();
      return;
    }

    const credentials = this.UserForm.value as { email: string; password: string };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        console.log('Login correcto:', res);
        alert(`Bienvenido ${res.user.email}`);
        // Aquí podrías redirigir a otra página: por ejemplo /dashboard
      },
      error: (err) => {
        console.error('Error en login:', err);
        alert(err.error.message || 'Error al iniciar sesión');
      }
    });
  }
}
