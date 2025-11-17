import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule,FormsModule, HeaderComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  activeTab: string = 'eliminar';

  // Eliminar usuario
  dniToDelete: string = "";
  resultado: string = "";

  // Buscar usuario
  dniBusqueda = "";
  usuarioEncontrado: any = null;
  resultadoBusqueda = "";

  // Modificar rol
  nuevoRol: string = "";
  resultadoRol: string = "";

  constructor(private authService: AuthService) {}

  onDniChange() {
    // Si no hay usuario mostrado aún, no hacemos nada
    if (!this.usuarioEncontrado) return;
  
    // Si lo que se escribe ya NO coincide con el DNI buscado → ocultamos tarjeta
    if (this.dniBusqueda !== this.usuarioEncontrado.DNI) {
      this.usuarioEncontrado = null;
      this.resultadoRol = "";
    }
  }

  eliminarUsuario() {
    if (!this.dniToDelete) {
      this.resultado = "Debes introducir un DNI";
      return;
    }

    if (!confirm(`¿Seguro que quieres eliminar al usuario con DNI ${this.dniToDelete}?`)) {
      return;
    }

    this.authService.deleteUser(this.dniToDelete).subscribe({
      next: (res: any) => {
        this.resultado = res.message;
        this.dniToDelete = "";
      },
      error: (err: any) => {
        this.resultado = err.error?.message || "Error al eliminar usuario";
      }
    });
  }

  buscarUsuario() {
    if (!this.dniBusqueda) {
      this.resultadoBusqueda = "Introduce un DNI";
      return;
    }

    this.authService.getUserByDni(this.dniBusqueda).subscribe({
      next: (user: any) => {
        this.usuarioEncontrado = user;
        this.resultadoBusqueda = "";
      },
      error: (err) => {
        this.usuarioEncontrado = null;
        this.resultadoBusqueda = err.error?.message || "Error al buscar usuario";
      }
    });
  }

  cambiarRol() {
    if (!this.nuevoRol) {
      this.resultadoRol = "Debes seleccionar un rol";
      return;
    }

    this.authService.updateUserRole({
      dni: this.usuarioEncontrado.DNI,
      nuevoRol: this.nuevoRol
    }).subscribe({
      next: (res: any) => {
        this.resultadoRol = res.message;
        this.usuarioEncontrado.Rol = this.nuevoRol; // actualizar vista
        this.nuevoRol = "";
      },
      error: (err) => {
        this.resultadoRol = err.error?.message || "Error al actualizar rol";
      }
    });
  }
}
