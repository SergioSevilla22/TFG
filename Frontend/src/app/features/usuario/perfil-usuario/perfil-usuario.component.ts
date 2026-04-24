import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { HeaderComponent } from '../../../layout/header/header.component';

@Component({
  selector: 'app-perfil-usuario',
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css'],
})
export class PerfilUsuarioComponent {
  user: any = null;
  editMode = false;

  selectedFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;
  isDependent: boolean = false;

  loading = false;
  errorMsg = '';

  private baseUrl = 'http://localhost:3000';

  // Cambiar contraseña
  showChangePass = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passMessage = '';
  passSuccess = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user && this.user.idTutor) {
      this.isDependent = true;
    }
  }

  getProfileImage(): string {
    if (typeof this.previewImage === 'string' && this.previewImage) return this.previewImage;
    if (this.user?.foto) return this.baseUrl + this.user.foto;
    return 'perfil.png';
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    this.errorMsg = '';
  }

  onFileChange(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'Solo se permiten imágenes.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'La imagen no puede superar 5MB.';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => (this.previewImage = (ev.target as FileReader).result);
    reader.readAsDataURL(file);
  }

  cancelPhoto() {
    this.selectedFile = null;
    this.previewImage = null;
  }

  savePhoto() {
    if (!this.selectedFile || !this.user) return;

    const formData = new FormData();
    formData.append('DNI', this.user.DNI);
    formData.append('fotoPerfil', this.selectedFile);

    this.loading = true;
    this.authService.updateUser(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.user = res.user;
        this.previewImage = this.user.foto ? this.baseUrl + this.user.foto : null;
        this.selectedFile = null;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Error al actualizar la foto.';
      },
    });
  }

  validatePhone(phone: string): boolean {
    const regex = /^[0-9]{9}$/;
    return regex.test(phone);
  }

  saveChanges() {
    if (!this.user) return;

    if (!this.validatePhone(this.user.telefono)) {
      this.errorMsg = 'El teléfono debe tener 9 dígitos numéricos';
      return;
    }

    this.errorMsg = '';

    const formData = new FormData();
    formData.append('DNI', this.user.DNI);
    formData.append('nombre', this.user.nombre);
    formData.append('telefono', this.user.telefono);
    formData.append('email', this.user.email);
    formData.append('Rol', this.user.Rol);

    this.loading = true;

    this.authService.updateUser(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.user = res.user;
        this.previewImage = this.user.foto ? this.baseUrl + this.user.foto : null;
        this.editMode = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Error al actualizar perfil.';
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleChangePass() {
    this.showChangePass = !this.showChangePass;
    this.passMessage = '';
    this.passSuccess = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  get passwordsMismatch(): boolean {
    return (
      this.confirmPassword.trim().length > 0 &&
      this.newPassword.trim().length > 0 &&
      this.newPassword !== this.confirmPassword
    );
  }

  onChangePassword() {
    if (!this.user) return;
    if (this.passwordsMismatch) {
      this.passMessage = 'Las contraseñas no coinciden.';
      this.passSuccess = false;
      return;
    }

    const data = {
      email: this.user.email,
      actualPassword: this.currentPassword,
      nuevaPassword: this.newPassword,
    };

    this.loading = true;

    this.authService.changePassword(data).subscribe({
      next: (res) => {
        this.loading = false;
        this.passMessage = res.message;
        this.passSuccess = true;

        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';

        setTimeout(() => {
          this.showChangePass = false;
          this.passMessage = '';
          this.passSuccess = false;
        }, 900);
      },
      error: (err) => {
        this.loading = false;
        this.passSuccess = false;
        this.passMessage = err.error.message || 'Error al cambiar la contraseña.';
      },
    });
  }

  goBack() {
    const rol = this.user?.Rol;

    if (rol === 'jugador' || rol === 'entrenador') {
      const equipoId = this.user?.equipo_id;
      if (equipoId) {
        this.router.navigate(['/equipo', equipoId]);
      } else {
        this.router.navigate(['/']);
      }
    } else if (rol === 'admin_club') {
      const clubId = this.user?.club_id;
      if (clubId) {
        this.router.navigate(['/club', clubId]);
      } else {
        this.router.navigate(['/']);
      }
    } else if (rol === 'admin_plataforma') {
      this.router.navigate(['/admin']);
    } else if (rol === 'tutor') {
      this.router.navigate(['/tutor-panel']);
    } else {
      this.router.navigate(['/']);
    }
  }

  isAdminRole(): boolean {
    return this.user?.Rol === 'admin_plataforma' || this.user?.Rol === 'admin_club';
  }
}
