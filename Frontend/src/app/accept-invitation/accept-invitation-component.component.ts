import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './accept-invitation-component.component.html',
  styleUrls: ['./accept-invitation-component.component.css']
})
export class AcceptInvitationComponent implements OnInit {
  token!: string;
  form = new FormGroup({
    password: new FormControl('', Validators.required),
    confirm: new FormControl('', Validators.required)
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    if (this.form.invalid || this.form.value.password !== this.form.value.confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.authService.acceptInvitation({
      token: this.token,
      password: this.form.value.password!
    }).subscribe({
      next: (res) => {
        alert('Cuenta activada. Ya puedes iniciar sesión');
        this.router.navigate(['/login']);
      },
      error: (err) => alert(err.error.message || 'Error al activar cuenta')
    });
  }
}
