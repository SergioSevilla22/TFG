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

  // ---------- MENSAJES ----------
  deleteUserError: string = '';
  deleteUserSuccess: string = '';
  searchResult: string = '';
  roleResult: string = '';
  editResult: string = '';
  registerResult: string = '';
  registerError: string = '';
  csvResult: string = '';
  csvError: string = '';
  clubResult: string = '';
  clubError: string = '';
  categoryResult: string = '';
  categoryError: string = '';
  seasonResult: string = '';
  seasonError: string = '';
  foundUserToDelete: any = null;

  // CONFIRMACIONES
  confirmingDeleteUserId: string | null = null;
  confirmingDeleteClubId: number | null = null;
  confirmingDeleteCategoryId: number | null = null;
  confirmingDeleteSeasonId: number | null = null;

  // ---------- USER MANAGEMENT ----------
  dniToDelete: string = '';
  result: string = '';

  searchDni = '';
  foundUser: any = null;

  newRole: string = '';

  RegisterForm = new FormGroup({
    DNI: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{8}[A-Za-z]$/)]),
    nombre: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    anioNacimiento: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1800),
      Validators.max(new Date().getFullYear()),
    ]),
    Rol: new FormControl('', Validators.required),
    club_id: new FormControl<number | null>(null),
  });

  selectedFile: File | null = null;

  // ---- USER PROFILE EDITING (ADMIN) ----
  editUserMode = false;
  editUser: any = null;

  // ---------- CLUB MANAGEMENT ----------
  clubs: any[] = [];
  filteredClubs: any[] = [];
  clubSearch: string = '';

  editingClubId: number | null = null;
  selectedEscudo: File | null = null;

  ClubForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
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
    edad_min: new FormControl('', Validators.required),
    edad_max: new FormControl('', Validators.required),
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
    this.confirmingDeleteUserId = dni;
  }

  cancelDeleteUser() {
    this.confirmingDeleteUserId = null;
  }

  confirmDeleteUser(dni: string) {
    this.confirmingDeleteUserId = null;
    this.deleteUserError = '';
    this.deleteUserSuccess = '';

    this.authService.deleteUser(dni).subscribe({
      next: (res: any) => {
        this.deleteUserSuccess = res.message || 'Usuario eliminado correctamente.';
        this.searchDni = '';
        this.foundUser = null;
        this.foundUserToDelete = null;
        this.dniToDelete = '';
      },
      error: (err: any) => {
        this.deleteUserError = err.error?.message || 'Error al eliminar usuario.';
      },
    });
  }

  deleteUser() {
    this.deleteUserError = '';
    this.deleteUserSuccess = '';

    if (!this.dniToDelete) {
      this.deleteUserError = 'Debes introducir un DNI.';
      return;
    }

    this.authService.getUserByDni(this.dniToDelete).subscribe({
      next: (user: any) => {
        this.foundUserToDelete = user;
        this.deleteUserError = '';
      },
      error: (err) => {
        this.foundUserToDelete = null;
        this.deleteUserError = err.error?.message || 'Usuario no encontrado.';
      },
    });
  }

  clearDeleteSearch() {
    this.dniToDelete = '';
    this.foundUserToDelete = null;
    this.deleteUserError = '';
    this.deleteUserSuccess = '';
    this.confirmingDeleteUserId = null;
  }

  searchUser() {
    this.searchResult = '';
    if (!this.searchDni) {
      this.searchResult = 'Introduce un DNI.';
      return;
    }

    this.authService.getUserByDni(this.searchDni).subscribe({
      next: (user: any) => {
        this.foundUser = user;
        this.searchResult = '';
      },
      error: (err) => {
        this.foundUser = null;
        this.searchResult = err.error?.message || 'Error al buscar usuario.';
      },
    });
  }

  changeRole() {
    this.roleResult = '';
    if (!this.newRole) {
      this.roleResult = 'Debes seleccionar un rol.';
      return;
    }

    this.authService.updateUserRole({ dni: this.foundUser.DNI, nuevoRol: this.newRole }).subscribe({
      next: (res: any) => {
        this.roleResult = res.message || 'Rol actualizado correctamente.';
        this.foundUser.Rol = this.newRole;
        this.newRole = '';
      },
      error: (err) => {
        this.roleResult = err.error?.message || 'Error al actualizar rol.';
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
    this.editResult = '';
    if (!this.editUser) return;

    if (!/^[0-9]{9}$/.test(this.editUser.telefono)) {
      this.editResult = 'El teléfono debe tener 9 dígitos.';
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
        this.editResult = 'Usuario actualizado correctamente.';
      },
      error: (err) => {
        this.editResult = err.error?.message || 'Error al actualizar usuario.';
      },
    });
  }

  onSubmit() {
    this.registerResult = '';
    this.registerError = '';

    if (this.RegisterForm.invalid) {
      this.RegisterForm.markAllAsTouched();
      return;
    }

    const raw = this.RegisterForm.getRawValue();

    if (this.userRole === 'admin_plataforma') {
      const payload: any = {
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
        next: () => {
          this.registerResult = 'Usuario creado correctamente.';
          this.RegisterForm.reset();
        },
        error: (err) => (this.registerError = err.error?.message || 'Error al crear usuario.'),
      });
    }

    if (this.userRole === 'admin_club') {
      const rol = raw.Rol;

      if (rol !== 'jugador' && rol !== 'entrenador' && rol !== 'tutor') {
        this.registerError = 'Rol no válido para admin de club.';
        return;
      }

      const payload: any = {
        DNI: raw.DNI!,
        nombre: raw.nombre!,
        email: raw.email!,
        telefono: raw.telefono!,
        anioNacimiento: raw.anioNacimiento!,
        Rol: rol,
      };

      this.authService.registerByClubAdmin(payload).subscribe({
        next: () => {
          this.registerResult = 'Usuario creado en tu club.';
          this.RegisterForm.reset();
        },
        error: (err) => (this.registerError = err.error?.message || 'Error al crear usuario.'),
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
    this.csvResult = '';
    this.csvError = '';

    if (!this.selectedFile) {
      this.csvError = 'Selecciona un archivo CSV.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    if (this.userRole === 'admin_plataforma') {
      this.authService.registerMassive(formData).subscribe({
        next: (res: any) => (this.csvResult = res.message || 'Usuarios registrados correctamente.'),
        error: (err) => (this.csvError = err.error?.message || 'Error al procesar CSV.'),
      });
    }

    if (this.userRole === 'admin_club') {
      this.authService.bulkRegisterByClubAdmin(formData).subscribe({
        next: (res: any) => (this.csvResult = res.message || 'Usuarios registrados correctamente.'),
        error: (err) => (this.csvError = err.error?.message || 'Error al procesar CSV.'),
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
    this.clubResult = '';
    this.clubError = '';

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
          this.clubResult = 'Club actualizado correctamente.';
          this.resetClubForm();
          this.loadClubs();
        },
        error: (err) => (this.clubError = err.error?.message || 'Error al actualizar club.'),
      });
    } else {
      this.clubService.createClub(formData).subscribe({
        next: () => {
          this.clubResult = 'Club creado correctamente.';
          this.resetClubForm();
          this.loadClubs();
        },
        error: (err) => (this.clubError = err.error?.message || 'Error al crear club.'),
      });
    }
  }

  editClub(club: any) {
    this.editingClubId = club.id;
    this.clubResult = '';
    this.clubError = '';
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

  askDeleteClub(id: number) {
    this.confirmingDeleteClubId = id;
    this.clubError = '';
  }

  cancelDeleteClub() {
    this.confirmingDeleteClubId = null;
  }

  deleteClub(id: number) {
    this.confirmingDeleteClubId = null;
    this.clubError = '';

    this.clubService.deleteClub(id).subscribe({
      next: () => {
        this.clubResult = 'Club eliminado correctamente.';
        this.loadClubs();
      },
      error: (err) => (this.clubError = err.error?.message || 'Error al eliminar club.'),
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
    this.categoryResult = '';
    this.categoryError = '';

    if (this.CategoryForm.invalid) {
      this.CategoryForm.markAllAsTouched();
      return;
    }

    const payload = this.CategoryForm.value;

    if (this.editingCategoryId) {
      this.categoryService.updateCategory(this.editingCategoryId, payload).subscribe({
        next: () => {
          this.categoryResult = 'Categoría actualizada correctamente.';
          this.resetCategoryForm();
          this.loadCategories();
        },
        error: (err) =>
          (this.categoryError = err.error?.message || 'Error al actualizar categoría.'),
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: () => {
          this.categoryResult = 'Categoría creada correctamente.';
          this.resetCategoryForm();
          this.loadCategories();
        },
        error: (err) => (this.categoryError = err.error?.message || 'Error al crear categoría.'),
      });
    }
  }

  editCategory(cat: any) {
    this.editingCategoryId = cat.id;
    this.categoryResult = '';
    this.categoryError = '';
    this.CategoryForm.patchValue({
      nombre: cat.nombre,
      edad_min: cat.edad_min,
      edad_max: cat.edad_max,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  askDeleteCategory(id: number) {
    this.confirmingDeleteCategoryId = id;
    this.categoryError = '';
  }

  cancelDeleteCategory() {
    this.confirmingDeleteCategoryId = null;
  }

  deleteCategory(id: number) {
    this.confirmingDeleteCategoryId = null;
    this.categoryError = '';

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categoryResult = 'Categoría eliminada correctamente.';
        this.loadCategories();
      },
      error: (err) => (this.categoryError = err.error?.message || 'Error al eliminar categoría.'),
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
    this.seasonResult = '';
    this.seasonError = '';

    if (this.SeasonForm.invalid) {
      this.SeasonForm.markAllAsTouched();
      return;
    }

    this.seasonService.createSeason(this.SeasonForm.value).subscribe({
      next: () => {
        this.seasonResult = 'Temporada creada correctamente.';
        this.SeasonForm.reset();
        this.loadSeasons();
      },
      error: (err) => (this.seasonError = err.error?.message || 'Error al crear temporada.'),
    });
  }

  activateSeason(id: number) {
    this.seasonResult = '';
    this.seasonError = '';

    this.seasonService.activateSeason(id).subscribe({
      next: () => {
        this.seasonResult = 'Temporada activada correctamente.';
        this.loadSeasons();
      },
      error: (err) => (this.seasonError = err.error?.message || 'Error al activar temporada.'),
    });
  }

  askDeleteSeason(id: number) {
    this.confirmingDeleteSeasonId = id;
    this.seasonError = '';
  }

  cancelDeleteSeason() {
    this.confirmingDeleteSeasonId = null;
  }

  deleteSeason(id: number) {
    this.confirmingDeleteSeasonId = null;
    this.seasonError = '';

    this.seasonService.deleteSeason(id).subscribe({
      next: () => {
        this.seasonResult = 'Temporada eliminada correctamente.';
        this.loadSeasons();
      },
      error: (err) => (this.seasonError = err.error?.message || 'Error al eliminar temporada.'),
    });
  }
}
