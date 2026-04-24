import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { HeaderComponent } from '../../../layout/header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutor-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './tutor-panel.component.html',
  styleUrls: ['./tutor-panel.component.css'],
})
export class TutorPanelComponent implements OnInit {
  dependents: any[] = [];
  user: any;

  errorMessage: string = '';
  successMessage: string = '';
  confirmingUnlinkDNI: string | null = null;

  dependentForm = new FormGroup({
    DNI: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{8}[A-Za-z]$/)]),
    nombre: new FormControl('', Validators.required),
    anioNacimiento: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1900),
      Validators.max(new Date().getFullYear()),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    password: new FormControl('', Validators.required),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    if (!this.user) {
      this.errorMessage = 'No se pudo cargar el usuario.';
      return;
    }

    this.loadDependents();
  }

  loadDependents() {
    this.errorMessage = '';
    this.authService.getDependents(this.user.DNI).subscribe({
      next: (res: any) => (this.dependents = res),
      error: () => (this.errorMessage = 'Error cargando dependientes.'),
    });
  }

  registerDependent() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.dependentForm.invalid) {
      this.dependentForm.markAllAsTouched();
      return;
    }

    const data = {
      ...this.dependentForm.value,
      idTutor: this.user.DNI,
    };

    this.authService.registerDependent(data).subscribe({
      next: (res: any) => {
        this.successMessage = res || 'Dependiente registrado correctamente.';
        this.dependentForm.reset();
        this.loadDependents();
      },
      error: (err) => (this.errorMessage = err.error?.message || 'Error al registrar dependiente.'),
    });
  }

  askUnlink(dni: string) {
    this.confirmingUnlinkDNI = dni;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelUnlink() {
    this.confirmingUnlinkDNI = null;
  }

  confirmUnlink(dni: string) {
    this.errorMessage = '';
    this.successMessage = '';
    this.confirmingUnlinkDNI = null;

    this.authService.removeLink(dni).subscribe({
      next: (res: any) => {
        this.successMessage = res || 'Vínculo eliminado correctamente.';
        this.loadDependents();
      },
      error: (err) => (this.errorMessage = err.error?.message || 'Error al quitar vínculo.'),
    });
  }
}
