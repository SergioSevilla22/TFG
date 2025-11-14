import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-admin',
  standalone: true, 
  imports: [FormsModule, HeaderComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  
  dniToDelete: string = "";
  resultado: string = "";

  constructor(private authService: AuthService) {}

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
}
