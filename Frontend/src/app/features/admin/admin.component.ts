import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { ClubService } from '../../../services/club/club.service';
import { CategoryService } from '../../../services/admin/category.service';
import { SeasonService } from '../../../services/admin/season.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent, HttpClientModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  activeTab: string = 'eliminar';

  // ---------- USER MANAGEMENT ----------
  dniToDelete: string = '';
  result: string = '';

  searchDni = '';
  foundUser: any = null;
  searchResult = '';

  newRole: string = '';
  roleResult: string = '';

  RegisterForm = new FormGroup({
    DNI: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{8}[A-Za-z]$/)]),
    nombre: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    anioNacimiento: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1900),
      Validators.max(new Date().getFullYear()),
    ]),
    Rol: new FormControl('usuario'),
    club_id: new FormControl<number | null>(null),
  });

  selectedFile: File | null = null;

  // ---- USER PROFILE EDITING (ADMIN) ----
  editUserMode = false;
  editUser: any = null;
  editResult = '';

  // ---------- CLUB MANAGEMENT ----------
  clubs: any[] = [];
  filteredClubs: any[] = [];
  clubSearch: string = '';

  editingClubId: number | null = null;
  selectedEscudo: File | null = null;

  ClubForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    email: new FormControl(''),
    direccion: new FormControl(''),
    poblacion: new FormControl(''),
    provincia: new FormControl(''),
    codigo_postal: new FormControl(''),
  });

  // ---------- CATEGORY MANAGEMENT ----------
  categories: any[] = [];
  editingCategoryId: number | null = null;

  CategoryForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    edad_min: new FormControl<number | null>(null),
    edad_max: new FormControl<number | null>(null),
  });

  // ---------- SEASON MANAGEMENT ----------
  seasons: any[] = [];

  SeasonForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
  });

  userRole: 'admin_plataforma' | 'admin_club' | null = null;
  clubAdminClubId: number | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly clubService: ClubService,
    private readonly categoryService: CategoryService,
    private readonly seasonService: SeasonService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userRole = user?.Rol || null;
    this.clubAdminClubId = user?.club_id || null;

    // 🔒 If admin club, force registrar tab
    if (this.userRole === 'admin_club') {
      this.activeTab = 'registrar';
    }

    if (this.userRole === 'admin_plataforma') {
      this.loadClubs();
    }
    this.loadCategories();
    this.loadSeasons();

    const dniControl = this.RegisterForm.get('DNI');
    if (dniControl) {
      dniControl.valueChanges.subscribe((value) => {
        if (!value) return;
        if (value.length > 8) {
          const numbers = value.slice(0, 8);
          const letter = value.slice(8).toUpperCase();
          const newValue = numbers + letter;
          if (newValue !== value) {
            dniControl.setValue(newValue, { emitEvent: false });
          }
        }
      });
    }
  }

  // ===========================
  //       USER MANAGEMENT
  // ===========================

  onDniChange() {
    if (!this.foundUser) return;

    if (this.searchDni !== this.foundUser.DNI) {
      this.foundUser = null;
      this.roleResult = '';
    }
  }

  deleteUserById(dni: string) {
    if (!confirm(`¿Seguro que quieres eliminar al usuario con DNI ${dni}?`)) return;

    this.authService.deleteUser(dni).subscribe({
      next: (res: any) => {
        this.result = res.message;
        this.searchDni = '';
        this.foundUser = null;
      },
      error: (err: any) => {
        this.result = err.error?.message || 'Error al eliminar usuario';
      },
    });
  }

  deleteUser() {
    if (!this.dniToDelete) {
      this.result = 'Debes introducir un DNI';
      return;
    }

    if (!confirm(`¿Seguro que quieres eliminar al usuario con DNI ${this.dniToDelete}?`)) return;

    this.authService.deleteUser(this.dniToDelete).subscribe({
      next: (res: any) => {
        this.result = res.message;
        this.dniToDelete = '';
      },
      error: (err: any) => {
        this.result = err.error?.message || 'Error al eliminar usuario';
      },
    });
  }

  searchUser() {
    if (!this.searchDni) {
      this.searchResult = 'Introduce un DNI';
      return;
    }

    this.authService.getUserByDni(this.searchDni).subscribe({
      next: (user: any) => {
        this.foundUser = user;
        this.searchResult = '';
      },
      error: (err) => {
        this.foundUser = null;
        this.searchResult = err.error?.message || 'Error al buscar usuario';
      },
    });
  }

  changeRole() {
    if (!this.newRole) {
      this.roleResult = 'Debes seleccionar un rol';
      return;
    }

    this.authService
      .updateUserRole({
        dni: this.foundUser.DNI,
        nuevoRol: this.newRole,
      })
      .subscribe({
        next: (res: any) => {
          this.roleResult = res.message;
          this.foundUser.Rol = this.newRole;
          this.newRole = '';
        },
        error: (err) => {
          this.roleResult = err.error?.message || 'Error al actualizar rol';
        },
      });
  }

  enableUserEdit() {
    this.editUserMode = true;
    this.editResult = '';
    this.editUser = { ...this.foundUser };
  }

  cancelUserEdit() {
    this.editUserMode = false;
    this.editUser = null;
    this.editResult = '';
  }

  saveUserEdit() {
    if (!this.editUser) return;

    if (!/^[0-9]{9}$/.test(this.editUser.telefono)) {
      this.editResult = 'El teléfono debe tener 9 dígitos';
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
        this.foundUser = res.user;
        this.editUserMode = false;
        this.editResult = 'Usuario actualizado correctamente';
      },
      error: (err) => {
        this.editResult = err.error?.message || 'Error al actualizar usuario';
      },
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
    if (this.userRole === 'admin_plataforma') {
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
        Rol: raw.Rol as string,
      };

      if (raw.Rol !== 'admin_plataforma' && raw.club_id) {
        payload.club_id = raw.club_id;
      }

      this.authService.registerByPlatformAdmin(payload).subscribe({
        next: () => alert('Usuario creado correctamente'),
        error: (err) => alert(err.error?.message || 'Error al crear usuario'),
      });
    }

    // ============================
    // ADMIN CLUB
    // ============================
    if (this.userRole === 'admin_club') {
      const rol = raw.Rol;

      // 🔒 Strict validation
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
        Rol: rol,
      };

      this.authService.registerByClubAdmin(payload).subscribe({
        next: () => alert('Usuario creado en tu club'),
        error: (err) => alert(err.error?.message || 'Error al crear usuario'),
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
      alert('Selecciona un archivo CSV.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // 🔴 ADMIN PLATAFORMA (LEGACY)
    if (this.userRole === 'admin_plataforma') {
      this.authService.registerMassive(formData).subscribe({
        next: (res) => alert(res.message),
        error: (err) => alert(err.error?.message || 'Error'),
      });
    }

    // 🔵 ADMIN CLUB
    if (this.userRole === 'admin_club') {
      this.authService.bulkRegisterByClubAdmin(formData).subscribe({
        next: (res) => alert(res.message),
        error: (err) => alert(err.error?.message || 'Error'),
      });
    }
  }

  // ===========================
  //       CLUB MANAGEMENT
  // ===========================

  loadClubs() {
    this.clubService.getClubs().subscribe({
      next: (data) => {
        this.clubs = data;
        this.filteredClubs = [];
      },
      error: (err) => console.error('Error al cargar clubes:', err),
    });
  }

  filterClubs() {
    const text = this.clubSearch.toLowerCase().trim();

    if (text === '') {
      this.filteredClubs = [];
      return;
    }

    this.filteredClubs = this.clubs.filter((club) => club.nombre.toLowerCase().includes(text));
  }

  openClub(id: number) {
    this.router.navigate(['/club', id]);
  }

  onEscudoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedEscudo = input.files[0];
    }
  }

  saveClub() {
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
      formData.append('escudo', this.selectedEscudo);
    }

    if (this.editingClubId) {
      this.clubService.updateClub(this.editingClubId, formData).subscribe({
        next: () => {
          alert('Club actualizado');
          this.resetClubForm();
          this.loadClubs();
        },
        error: (err) => alert(err.error?.message || 'Error al actualizar club'),
      });
    } else {
      this.clubService.createClub(formData).subscribe({
        next: () => {
          alert('Club creado');
          this.resetClubForm();
          this.loadClubs();
        },
        error: (err) => alert(err.error?.message || 'Error al crear club'),
      });
    }
  }

  editClub(club: any) {
    this.editingClubId = club.id;

    this.ClubForm.patchValue({
      nombre: club.nombre,
      telefono: club.telefono,
      email: club.email,
      direccion: club.direccion,
      poblacion: club.poblacion,
      provincia: club.provincia,
      codigo_postal: club.codigo_postal,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteClub(id: number) {
    if (!confirm('¿Eliminar este club?')) return;

    this.clubService.deleteClub(id).subscribe({
      next: () => this.loadClubs(),
      error: (err) => alert(err.error?.message || 'Error al eliminar club'),
    });
  }

  resetClubForm() {
    this.ClubForm.reset();
    this.selectedEscudo = null;
    this.editingClubId = null;
  }

  // ===========================
  //       CATEGORY MANAGEMENT
  // ===========================

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error(err),
    });
  }

  saveCategory() {
    if (this.CategoryForm.invalid) {
      this.CategoryForm.markAllAsTouched();
      return;
    }

    const payload = this.CategoryForm.value;

    if (this.editingCategoryId) {
      this.categoryService.updateCategory(this.editingCategoryId, payload).subscribe({
        next: () => {
          alert('Categoría actualizada');
          this.resetCategoryForm();
          this.loadCategories();
        },
        error: (err) => alert(err.error?.message || 'Error al actualizar'),
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: () => {
          alert('Categoría creada');
          this.resetCategoryForm();
          this.loadCategories();
        },
        error: (err) => alert(err.error?.message || 'Error al crear categoría'),
      });
    }
  }

  editCategory(cat: any) {
    this.editingCategoryId = cat.id;
    this.CategoryForm.patchValue({
      nombre: cat.nombre,
      edad_min: cat.edad_min,
      edad_max: cat.edad_max,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCategory(id: number) {
    if (!confirm('¿Eliminar esta categoría?')) return;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => alert(err.error?.message || 'Error al eliminar categoría'),
    });
  }

  resetCategoryForm() {
    this.CategoryForm.reset();
    this.editingCategoryId = null;
  }

  // ===========================
  //       SEASON MANAGEMENT
  // ===========================

  loadSeasons() {
    this.seasonService.getSeasons().subscribe({
      next: (data) => (this.seasons = data),
      error: (err) => console.error(err),
    });
  }

  createNewSeason() {
    if (this.SeasonForm.invalid) {
      this.SeasonForm.markAllAsTouched();
      return;
    }

    this.seasonService.createSeason(this.SeasonForm.value).subscribe({
      next: () => {
        alert('Temporada creada');
        this.SeasonForm.reset();
        this.loadSeasons();
      },
      error: (err) => alert(err.error?.message || 'Error al crear temporada'),
    });
  }

  activateSeason(id: number) {
    this.seasonService.activateSeason(id).subscribe({
      next: () => this.loadSeasons(),
      error: (err) => alert(err.error?.message || 'Error al activar temporada'),
    });
  }

  deleteSeason(id: number) {
    if (!confirm('¿Eliminar esta temporada?')) return;

    this.seasonService.deleteSeason(id).subscribe({
      next: () => this.loadSeasons(),
      error: (err) => alert(err.error?.message || 'Error al eliminar temporada'),
    });
  }
}
