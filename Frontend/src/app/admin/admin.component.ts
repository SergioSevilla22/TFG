import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { ClubService } from '../../services/club.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

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

  // Registro usuario
  RegisterForm = new FormGroup({
    DNI: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl('', [Validators.required]),
    Rol: new FormControl('usuario')
  });

  selectedFile: File | null = null;

  // Gestión de clubes
  clubes: any[] = [];
  editingClubId: number | null = null;
  selectedEscudo: File | null = null;

  ClubForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    telefono: new FormControl(''),
    email: new FormControl(''),
    direccion: new FormControl(''),
    poblacion: new FormControl(''),
    provincia: new FormControl(''),
    codigo_postal: new FormControl('')
  });

  constructor(
    private authService: AuthService,
    private clubService: ClubService
  ) {}

  ngOnInit(): void {
    this.cargarClubes();
  }

  // ---------- GESTIÓN USUARIOS ----------

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

  get DNI() { return this.RegisterForm.get('DNI'); }
  get email() { return this.RegisterForm.get('email'); }

  onSubmit() {
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

  // ---------- GESTIÓN CLUBES ----------

  cargarClubes() {
    this.clubService.getClubes().subscribe({
      next: (data: any) => {
        this.clubes = data;
      },
      error: (err) => {
        console.error('Error al cargar clubes:', err);
      }
    });
  }

  onEscudoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedEscudo = input.files[0];
    }
  }

  guardarClub() {
    if (this.ClubForm.invalid) {
      this.ClubForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const values = this.ClubForm.value;

    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value as string);
      }
    });

    if (this.selectedEscudo) {
      formData.append('escudo', this.selectedEscudo);
    }

    if (this.editingClubId) {
      this.clubService.updateClub(this.editingClubId, formData).subscribe({
        next: () => {
          alert('Club actualizado');
          this.resetClubForm();
          this.cargarClubes();
        },
        error: (err) => {
          console.error('Error al actualizar club:', err);
          alert(err.error?.message || 'Error al actualizar club');
        }
      });
    } else {
      this.clubService.createClub(formData).subscribe({
        next: () => {
          alert('Club creado');
          this.resetClubForm();
          this.cargarClubes();
        },
        error: (err) => {
          console.error('Error al crear club:', err);
          alert(err.error?.message || 'Error al crear club');
        }
      });
    }
  }

  editarClub(club: any) {
    this.editingClubId = club.id;

    this.ClubForm.patchValue({
      nombre: club.nombre,
      telefono: club.telefono,
      email: club.email,
      direccion: club.direccion,
      poblacion: club.poblacion,
      provincia: club.provincia,
      codigo_postal: club.codigo_postal
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarClub(id: number) {
    if (!confirm("¿Eliminar este club?")) return;

    this.clubService.deleteClub(id).subscribe({
      next: () => {
        this.cargarClubes();
      },
      error: (err) => {
        console.error('Error al eliminar club:', err);
        alert(err.error?.message || 'Error al eliminar club');
      }
    });
  }

  resetClubForm() {
    this.ClubForm.reset();
    this.selectedEscudo = null;
    this.editingClubId = null;
  }
}
