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

@Component({
  selector: 'app-tutor-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './tutor-panel.component.html',
  styleUrls: ['./tutor-panel.component.css'],
})
export class TutorPanelComponent implements OnInit {
  dependientes: any[] = [];
  user: any;

  DepForm = new FormGroup({
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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.cargarDependientes();
  }

  cargarDependientes() {
    this.authService.obtenerDependientes(this.user.DNI).subscribe({
      next: (res: any) => (this.dependientes = res),
      error: () => alert('Error cargando dependientes'),
    });
  }

  registrarDependiente() {
    if (this.DepForm.invalid) return;

    const data = {
      ...this.DepForm.value,
      idTutor: this.user.DNI,
    };

    this.authService.registrarDependiente(data).subscribe({
      next: (res) => {
        alert(res);
        this.DepForm.reset();
        this.cargarDependientes();
      },
      error: (err) => alert(err.error?.message || 'Error al registrar dependiente'),
    });
  }

  quitarVinculo(dni: string) {
    if (!confirm('¿Seguro que quieres desvincular este jugador?')) return;

    this.authService.quitarVinculo(dni).subscribe({
      next: (res) => {
        alert(res);
        this.cargarDependientes();
      },
      error: (err) => alert(err.error?.message || 'Error al quitar vínculo'),
    });
  }
}
