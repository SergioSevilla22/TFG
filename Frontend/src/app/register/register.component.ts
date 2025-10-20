import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private authService: AuthService) {}

  RegisterForm = new FormGroup({
    DNI: new FormControl('', Validators.required),
  email: new FormControl('', [Validators.required, Validators.email]),
  telefono: new FormControl('', [Validators.required]),
  password: new FormControl('', Validators.required),
  Rol: new FormControl('usuario')
  });

  selectedFile: File | null = null;

  get DNI() { return this.RegisterForm.get('DNI'); }
  get email() { return this.RegisterForm.get('email'); }
  get password() { return this.RegisterForm.get('password'); }

  onSubmit() {
    if (this.RegisterForm.invalid) {
      this.RegisterForm.markAllAsTouched();
      return;
    }

    const userData = this.RegisterForm.value as {
      DNI: string;
      email: string;
      telefono: string;
      password: string;
      Rol?: string;
    };

    this.authService.register(userData).subscribe({
      next: (res) => {
        alert('Usuario registrado correctamente');
        console.log('Registro:', res);
      },
      error: (err) => {
        console.error('Error en registro:', err);
        alert(err.error.message || 'Error al registrar usuario');
      }
    });
  }


onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  }
}

uploadCSV() {
  if (!this.selectedFile) {
    alert("Por favor selecciona un archivo CSV.");
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  this.authService.registerMassive(formData).subscribe({
    next: (res: any) => {
      alert(res.message);
      console.log(res);
    },
    error: (err) => {
      console.error('Error en registro masivo:', err);
      alert(err.error.message || 'Error al registrar usuarios');
    }
  });
}
}
