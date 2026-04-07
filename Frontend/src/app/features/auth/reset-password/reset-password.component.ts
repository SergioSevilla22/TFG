import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  passwordsMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('nuevaPassword')?.value;
    const confirmPassword = control.get('confirmarPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { noCoinciden: true }
      : null;
  };

  form = new FormGroup(
    {
      nuevaPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmarPassword: new FormControl('', [Validators.required]),
    },
    { validators: [this.passwordsMatch] },
  );

  token = '';
  message = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
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
      },
    });
  }

  get passwordsMismatch(): boolean {
    return this.form.hasError('noCoinciden') && this.form.get('confirmarPassword')?.touched!;
  }
}
