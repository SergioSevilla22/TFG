import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './accept-invitation-component.component.html',
  styleUrls: ['./accept-invitation-component.component.css'],
})
export class AcceptInvitationComponent implements OnInit {
  token!: string;
  errorMessage: string = '';
  successMessage: string = '';

  form = new FormGroup({
    password: new FormControl('', Validators.required),
    confirm: new FormControl('', Validators.required),
  });

  get password() {
    return this.form.get('password');
  }
  get confirm() {
    return this.form.get('confirm');
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirm) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.authService
      .acceptInvitation({
        token: this.token,
        password: this.form.value.password!,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Cuenta activada. Ya puedes iniciar sesión.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al activar cuenta.';
        },
      });
  }
}
