import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css']
})
export class PerfilUsuarioComponent {

  user: any = null;
  editMode = false;
  selectedFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;
  errorMsg = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getUser();
    if (this.user?.foto) {
      this.previewImage = 'http://localhost:3000' + this.user.foto;
    }
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    this.errorMsg = '';
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'Solo se permiten imágenes.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'La imagen no puede superar 5 MB.';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => this.previewImage = (e.target as FileReader).result as string | ArrayBuffer;

    reader.readAsDataURL(file);
  }

  guardarCambios() {
    if (!this.user) return;

    const formData = new FormData();
    formData.append('DNI', this.user.DNI);
    formData.append('nombre', this.user.nombre);
    formData.append('telefono', this.user.telefono);
    formData.append('email', this.user.email);
    formData.append('Rol', this.user.Rol);

    if (this.selectedFile) {
      formData.append('fotoPerfil', this.selectedFile); // debe coincidir con upload.single("fotoPerfil")
    }

    this.loading = true;
    this.authService.updateUser(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.user = res.user;
        this.previewImage = this.user.foto ? 'http://localhost:3000' + this.user.foto : null;
        this.editMode = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Error al actualizar perfil.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
