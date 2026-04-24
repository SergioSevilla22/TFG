import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../layout/header/header.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  constructor(private authService: AuthService) {}

  errorMessage: string = '';
  successMessage: string = '';
  csvErrorMessage: string = '';
  csvSuccessMessage: string = '';

  RegisterForm = new FormGroup({
    DNI: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl('', Validators.required),
    Rol: new FormControl('usuario'),
    club_id: new FormControl<number | null>(null),
  });

  selectedFile: File | null = null;

  get DNI() {
    return this.RegisterForm.get('DNI');
  }
  get nombre() {
    return this.RegisterForm.get('nombre');
  }
  get email() {
    return this.RegisterForm.get('email');
  }
  get telefono() {
    return this.RegisterForm.get('telefono');
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.RegisterForm.invalid) {
      this.RegisterForm.markAllAsTouched();
      return;
    }

    const userData = this.RegisterForm.value as {
      DNI: string;
      nombre: string;
      email: string;
      telefono: string;
      Rol?: string;
    };

    this.authService.register(userData).subscribe({
      next: (res) => {
        this.successMessage = 'Usuario registrado correctamente.';
        this.RegisterForm.reset({ Rol: 'usuario' });
        console.log('Registro:', res);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.errorMessage = err.error?.message || 'Error al registrar usuario.';
      },
    });
  }

  onFileSelected(event: Event) {
    this.csvErrorMessage = '';
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadCSV() {
    this.csvErrorMessage = '';
    this.csvSuccessMessage = '';

    if (!this.selectedFile) {
      this.csvErrorMessage = 'Por favor selecciona un archivo CSV.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.authService.registerMassive(formData).subscribe({
      next: (res: any) => {
        this.csvSuccessMessage = res.message || 'Usuarios registrados correctamente.';
        this.selectedFile = null;
        console.log(res);
      },
      error: (err) => {
        console.error('Error en registro masivo:', err);
        this.csvErrorMessage = err.error?.message || 'Error al registrar usuarios.';
      },
    });
  }
}
