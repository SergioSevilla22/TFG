import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClubService } from '../../../../../services/club/club.service';
import { EquipoService } from '../../../../../services/equipo/equipos.service';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../services/auth/auth.service';
import { TransferUserModalComponent } from '../../modals/transfer-user-modal/transfer-user-modal.component';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FormsModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css'],
})
export class ClubComponent implements OnInit {
  clubId!: number;
  club: any = null;
  equipos: any[] = [];
  loading: boolean = true;
  resumen: any = null;
  equiposFiltrados: any[] = [];
  buscado = false;

  editMode: boolean = false;
  selectedFile: File | null = null;
  escudoPreview: string | ArrayBuffer | null = null;
  editForm: any = {};

  filtrosEquipos = {
    nombre: '',
    categoria: '',
    temporada: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private equipoService: EquipoService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    // 🔐 ADMIN CLUB → IGNORAR URL
    if (user?.Rol === 'admin_club') {
      if (!user.club_id) {
        if (this.isBrowser()) {
          alert('No tienes club asignado.');
        }
        this.router.navigate(['/login']);
        return;
      }

      this.clubId = user.club_id;
      this.loadClubData();
      return;
    }

    // 🔓 ADMIN PLATAFORMA → club por URL
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.clubId = Number(routeId);
      this.loadClubData();
    } else {
      if (this.isBrowser()) {
        alert('Club no válido.');
      }
      this.router.navigate(['/admin']);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  loadClubData() {
    if (!this.isBrowser()) {
      return; // ⛔ NO SSR
    }

    this.loading = true;

    this.clubService.getClubById(this.clubId).subscribe({
      next: (club) => {
        this.club = club;

        this.equipoService.obtenerEquiposPorClub(this.clubId).subscribe({
          next: (equipos) => {
            this.equipos = equipos;
            this.equiposFiltrados = [];
            this.buscado = false;
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          },
        });

        this.clubService.getResumenClub(this.clubId).subscribe({
          next: (data) => (this.resumen = data),
        });
      },
      error: (err) => {
        console.error('Error cargando club', err);
        this.loading = false;
      },
    });
  }

  loadResumen() {
    this.clubService.getResumenClub(this.clubId).subscribe({
      next: (data) => (this.resumen = data),
    });
  }

  abrirModalTraspasos() {
    const dialogRef = this.dialog.open(TransferUserModalComponent, {
      width: '800px',
      data: { clubId: this.clubId },
    });

    dialogRef.afterClosed().subscribe((refresh) => {
      if (refresh) {
        // Refrescamos KPIs y datos del club
        this.loadResumen();
        this.loadClubData();
      }
    });
  }

  loadEquipos() {
    this.equipoService.obtenerEquiposPorClub(this.clubId).subscribe({
      next: (data) => {
        this.equipos = data;
        this.equiposFiltrados = []; // 👈 NO mostrar nada al inicio
        this.buscado = false; // 👈 aún no se ha buscado
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        if (this.isBrowser()) {
          alert('Error al cargar equipos.');
        }
      },
    });
  }

  onInputChange() {
    const { nombre, categoria, temporada } = this.filtrosEquipos;

    if (!nombre && !categoria && !temporada) {
      this.buscado = false;
      this.equiposFiltrados = [];
    }
  }

  editarClub() {
    this.router.navigate(['/admin'], { queryParams: { editClub: this.clubId } });
  }

  abrirEquipo(id: number) {
    this.router.navigate(['/equipo', id]);
  }

  crearEquipo() {
    this.router.navigate(['/equipo/crear'], {
      queryParams: { clubId: this.clubId },
    });
  }

  abrirEquiposClub() {
    this.router.navigate([`/club/${this.clubId}/equipos`]);
  }

  buscarEquipos() {
    const { nombre, categoria, temporada } = this.filtrosEquipos;
    this.buscado = true;

    this.equiposFiltrados = this.equipos.filter(
      (e) =>
        (!nombre || e.nombre.toLowerCase().includes(nombre.toLowerCase())) &&
        (!categoria || e.categoria.toLowerCase().includes(categoria.toLowerCase())) &&
        (!temporada || e.temporada.toLowerCase().includes(temporada.toLowerCase())),
    );
  }

  iniciarEdicion() {
    this.editMode = true;
    // Creamos una copia para no modificar el objeto original hasta guardar
    this.editForm = { ...this.club };
    this.escudoPreview = null;
    this.selectedFile = null;
  }

  cancelarEdicion(event?: Event) {
    if (event) event.stopPropagation();
    this.editMode = false;
    this.selectedFile = null;
    this.escudoPreview = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Vista previa de la imagen
      const reader = new FileReader();
      reader.onload = () => this.escudoPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  guardarCambios(event: Event) {
    event.stopPropagation();
    this.loading = true;
    
    // Añadimos los campos de texto
    const formData = new FormData();
    formData.append('nombre', this.editForm.nombre);
    formData.append('email', this.editForm.email || '');
    formData.append('telefono', this.editForm.telefono || '');
    formData.append('direccion', this.editForm.direccion || '');
    formData.append('poblacion', this.editForm.poblacion || '');
    formData.append('provincia', this.editForm.provincia || '');
    formData.append('codigo_postal', this.editForm.codigo_postal || '');

    // Añadimos el archivo si se ha seleccionado uno nuevo
    if (this.selectedFile) {
      formData.append('escudo', this.selectedFile);
    }

    this.clubService.updateClub(this.clubId, formData).subscribe({
      next: () => {
        this.editMode = false;
        this.loadClubData(); // Recargamos todo para ver los cambios
        if (this.isBrowser()) alert('Club actualizado correctamente');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        if (this.isBrowser()) alert('Error al actualizar el club');
      }
    });
  }
}
