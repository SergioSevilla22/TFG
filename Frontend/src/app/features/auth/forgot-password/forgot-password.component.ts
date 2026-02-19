import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  message = '';
  loading = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const email = this.form.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error.message || 'Error al enviar el correo';
        this.loading = false;
      },
    });
  }
}
