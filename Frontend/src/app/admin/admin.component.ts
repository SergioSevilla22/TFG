import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { ClubService } from '../../services/club.service';
import { CategoriaService } from '../../services/categoria.service';
import { TemporadaService } from '../../services/temporada.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    HttpClientModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  activeTab: string = 'eliminar';

  // ---------- GESTIÓN USUARIOS ----------
  dniToDelete: string = "";
  resultado: string = "";

  dniBusqueda = "";
  usuarioEncontrado: any = null;
  resultadoBusqueda = "";

  nuevoRol: string = "";
  resultadoRol: string = "";

  RegisterForm = new FormGroup({
    DNI: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{8}[A-Za-z]$/)]),
    nombre: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    anioNacimiento: new FormControl<number | null>(null, [ Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]),
    Rol: new FormControl('usuario'),
    club_id: new FormControl<number | null>(null)
  });

  selectedFile: File | null = null;

  // ---- EDICIÓN PERFIL USUARIO (ADMIN) ----
  editUserMode = false;
  editUser: any = null;
  resultadoEdicion = '';

  // ---------- GESTIÓN CLUBES ----------
  clubes: any[] = [];
  clubesFiltrados: any[] = [];
  busquedaClub: string = "";

  editingClubId: number | null = null;
  selectedEscudo: File | null = null;

  ClubForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    email: new FormControl(''),
    direccion: new FormControl(''),
    poblacion: new FormControl(''),
    provincia: new FormControl(''),
    codigo_postal: new FormControl('')
  });

  // ---------- GESTIÓN CATEGORÍAS ----------
  categorias: any[] = [];
  editingCategoriaId: number | null = null;

  CategoriaForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    edad_min: new FormControl<number | null>(null),
    edad_max: new FormControl<number | null>(null)
  });

  // ---------- GESTIÓN TEMPORADAS ----------
  temporadas: any[] = [];

  TemporadaForm = new FormGroup({
    nombre: new FormControl('', Validators.required)
  });

  rolUsuario: 'admin_plataforma' | 'admin_club' | null = null;
  clubIdAdminClub: number | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly clubService: ClubService,
    private readonly categoriaService: CategoriaService,
    private readonly temporadaService: TemporadaService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const user = this.authService.getUser();
    this.rolUsuario = user?.Rol || null;
    this.clubIdAdminClub = user?.club_id || null;
  
    // 🔒 Si es admin club, forzamos pestaña registrar
    if (this.rolUsuario === 'admin_club') {
      this.activeTab = 'registrar';
    }
  
    if (this.rolUsuario === 'admin_plataforma') {
      this.cargarClubes();
    }
    this.cargarCategorias();
    this.cargarTemporadas();
  
    // --- TU CÓDIGO DE DNI (NO TOCAR) ---
    const dniControl = this.RegisterForm.get('DNI');
    if (dniControl) {
      dniControl.valueChanges.subscribe(value => {
        if (!value) return;
        if (value.length > 8) {
          const numeros = value.slice(0, 8);
          const letra = value.slice(8).toUpperCase();
          const nuevoValor = numeros + letra;
          if (nuevoValor !== value) {
            dniControl.setValue(nuevoValor, { emitEvent: false });
          }
        }
      });
    }
  }


  // ===========================
  //       GESTIÓN USUARIOS
  // ===========================

  onDniChange() {
    if (!this.usuarioEncontrado) return;

    if (this.dniBusqueda !== this.usuarioEncontrado.DNI) {
      this.usuarioEncontrado = null;
      this.resultadoRol = "";
    }
  }

  eliminarUser(dni: string) {
    
    if (!confirm(`¿Seguro que quieres eliminar al usuario con DNI ${dni}?`)) return;

    this.authService.deleteUser(dni).subscribe({
      next: (res: any) => {
        this.resultado = res.message;
        this.dniBusqueda = "";
        this.usuarioEncontrado = null;
      },
      error: (err: any) => {
        this.resultado = err.error?.message || "Error al eliminar usuario";
      }
    });
  }

  eliminarUsuario() {
    if (!this.dniToDelete) {
      this.resultado = "Debes introducir un DNI";
      return;
    }

    if (!confirm(`¿Seguro que quieres eliminar al usuario con DNI ${this.dniToDelete}?`)) return;

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
        this.usuarioEncontrado.Rol = this.nuevoRol;
        this.nuevoRol = "";
      },
      error: (err) => {
        this.resultadoRol = err.error?.message || "Error al actualizar rol";
      }
    });
  }

  activarEdicionUsuario() {
    this.editUserMode = true;
    this.resultadoEdicion = '';
    this.editUser = { ...this.usuarioEncontrado };
  }

  cancelarEdicionUsuario() {
    this.editUserMode = false;
    this.editUser = null;
    this.resultadoEdicion = '';
  }

  guardarEdicionUsuario() {
    if (!this.editUser) return;

    if (!/^[0-9]{9}$/.test(this.editUser.telefono)) {
      this.resultadoEdicion = 'El teléfono debe tener 9 dígitos';
      return;
    }

    const formData = new FormData();
    formData.append('DNI', this.editUser.DNI);
    formData.append('nombre', this.editUser.nombre);
    formData.append('email', this.editUser.email);
    formData.append('telefono', this.editUser.telefono);
    formData.append('Rol', this.editUser.Rol);

    this.authService.updateUser(formData, false).subscribe({
      next: (res) => {
        this.usuarioEncontrado = res.user;
        this.editUserMode = false;
        this.resultadoEdicion = 'Usuario actualizado correctamente';
      },
      error: (err) => {
        this.resultadoEdicion = err.error?.message || 'Error al actualizar usuario';
      }
    });
  }

  onSubmit() {
    if (this.RegisterForm.invalid) {
      this.RegisterForm.markAllAsTouched();
      return;
    }
  
    const raw = this.RegisterForm.getRawValue();
  
    // ============================
    // ADMIN PLATAFORMA
    // ============================
    if (this.rolUsuario === 'admin_plataforma') {
  
      const payload: {
        DNI: string;
        nombre: string;
        email: string;
        telefono: string;
        anioNacimiento: number;
        Rol: string; 
        club_id?: number;
      } = {
        DNI: raw.DNI!,
        nombre: raw.nombre!,
        email: raw.email!,
        telefono: raw.telefono!,
        anioNacimiento: raw.anioNacimiento!,
        Rol: raw.Rol as string
      };
      
      if (raw.Rol !== 'admin_plataforma' && raw.club_id) {
        payload.club_id = raw.club_id;
      }
  
      this.authService.registerByAdminPlataforma(payload).subscribe({
        next: () => alert('Usuario creado correctamente'),
        error: err => alert(err.error?.message || 'Error al crear usuario')
      });
    }
  
    // ============================
    // ADMIN CLUB
    // ============================
    if (this.rolUsuario === 'admin_club') {
  
      const rol = raw.Rol;
  
      // 🔒 Validación estricta (y defendible)
      if (rol !== 'jugador' && rol !== 'entrenador' && rol !== 'tutor') {
        alert('Rol no válido para admin de club');
        return;
      }
  
      const payload: {
        DNI: string;
        nombre: string;
        email: string;
        telefono: string;
        anioNacimiento: number;
        Rol: 'jugador' | 'entrenador' | 'tutor';
      } = {
        DNI: raw.DNI!,
        nombre: raw.nombre!,
        email: raw.email!,
        telefono: raw.telefono!,
        anioNacimiento: raw.anioNacimiento!,
        Rol: rol
      };
  
      this.authService.registerByAdminClub(payload).subscribe({
        next: () => alert('Usuario creado en tu club'),
        error: err => alert(err.error?.message || 'Error al crear usuario')
      });
    }
  }
  
  

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadCSV() {
    if (!this.selectedFile) {
      alert("Selecciona un archivo CSV.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", this.selectedFile);
  
    // 🔴 ADMIN PLATAFORMA (LEGADO)
    if (this.rolUsuario === 'admin_plataforma') {
      this.authService.registerMassive(formData).subscribe({
        next: res => alert(res.message),
        error: err => alert(err.error?.message || "Error")
      });
    }
  
    // 🔵 ADMIN CLUB
    if (this.rolUsuario === 'admin_club') {
      this.authService.registerMasivoAdminClub(formData).subscribe({
        next: res => alert(res.message),
        error: err => alert(err.error?.message || "Error")
      });
    }
  }

  // ===========================
  //       GESTIÓN CLUBES
  // ===========================

  cargarClubes() {
    this.clubService.getClubes().subscribe({
      next: (data) => {
        this.clubes = data;
        this.clubesFiltrados = [];
      },
      error: (err) => console.error("Error al cargar clubes:", err)
    });
  }

  filtrarClubes() {
    const texto = this.busquedaClub.toLowerCase().trim();
  
    if (texto === "") {
      this.clubesFiltrados = [];
      return;
    }
  
    this.clubesFiltrados = this.clubes.filter(club =>
      club.nombre.toLowerCase().includes(texto)
    );
  }
  

  abrirClub(id: number) {
    this.router.navigate(['/club', id]);
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
      if (value) formData.append(key, value as string);
    });

    if (this.selectedEscudo) {
      formData.append("escudo", this.selectedEscudo);
    }

    if (this.editingClubId) {
      this.clubService.updateClub(this.editingClubId, formData).subscribe({
        next: () => {
          alert("Club actualizado");
          this.resetClubForm();
          this.cargarClubes();
        },
        error: (err) => alert(err.error?.message || "Error al actualizar club")
      });
    } else {
      this.clubService.createClub(formData).subscribe({
        next: () => {
          alert("Club creado");
          this.resetClubForm();
          this.cargarClubes();
        },
        error: (err) => alert(err.error?.message || "Error al crear club")
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
      next: () => this.cargarClubes(),
      error: (err) => alert(err.error?.message || "Error al eliminar club")
    });
  }

  resetClubForm() {
    this.ClubForm.reset();
    this.selectedEscudo = null;
    this.editingClubId = null;
  }

  // ===========================
  //       GESTIÓN CATEGORÍAS
  // ===========================

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error(err)
    });
  }

  guardarCategoria() {
    if (this.CategoriaForm.invalid) {
      this.CategoriaForm.markAllAsTouched();
      return;
    }

    const payload = this.CategoriaForm.value;

    if (this.editingCategoriaId) {
      this.categoriaService.updateCategoria(this.editingCategoriaId, payload).subscribe({
        next: () => {
          alert("Categoría actualizada");
          this.resetCategoriaForm();
          this.cargarCategorias();
        },
        error: (err) => alert(err.error?.message || "Error al actualizar")
      });
    } else {
      this.categoriaService.createCategoria(payload).subscribe({
        next: () => {
          alert("Categoría creada");
          this.resetCategoriaForm();
          this.cargarCategorias();
        },
        error: (err) => alert(err.error?.message || "Error al crear categoría")
      });
    }
  }

  editarCategoria(cat: any) {
    this.editingCategoriaId = cat.id;
    this.CategoriaForm.patchValue({
      nombre: cat.nombre,
      edad_min: cat.edad_min,
      edad_max: cat.edad_max
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarCategoria(id: number) {
    if (!confirm("¿Eliminar esta categoría?")) return;

    this.categoriaService.deleteCategoria(id).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) => alert(err.error?.message || "Error al eliminar categoría")
    });
  }

  resetCategoriaForm() {
    this.CategoriaForm.reset();
    this.editingCategoriaId = null;
  }

  // ===========================
  //       GESTIÓN TEMPORADAS
  // ===========================

  cargarTemporadas() {
    this.temporadaService.getTemporadas().subscribe({
      next: (data) => this.temporadas = data,
      error: (err) => console.error(err)
    });
  }

  crearNuevaTemporada() {
    if (this.TemporadaForm.invalid) {
      this.TemporadaForm.markAllAsTouched();
      return;
    }

    this.temporadaService.createTemporada(this.TemporadaForm.value).subscribe({
      next: () => {
        alert("Temporada creada");
        this.TemporadaForm.reset();
        this.cargarTemporadas();
      },
      error: (err) => alert(err.error?.message || "Error al crear temporada")
    });
  }

  activarTemporada(id: number) {
    this.temporadaService.activarTemporada(id).subscribe({
      next: () => this.cargarTemporadas(),
      error: (err) => alert(err.error?.message || "Error al activar temporada")
    });
  }

  eliminarTemporada(id: number) {
    if (!confirm("¿Eliminar esta temporada?")) return;

    this.temporadaService.deleteTemporada(id).subscribe({
      next: () => this.cargarTemporadas(),
      error: (err) => alert(err.error?.message || "Error al eliminar temporada")
    });
  }
}
