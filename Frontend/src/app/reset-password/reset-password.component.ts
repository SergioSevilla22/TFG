import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  form = new FormGroup({
    nuevaPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  token = '';
  message = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const nuevaPassword = this.form.value.nuevaPassword!;

    this.authService.resetPassword({ token: this.token, nuevaPassword }).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.message = err.error.message || 'Error al restablecer la contraseña';
        this.loading = false;
      }
    });
  }
}
