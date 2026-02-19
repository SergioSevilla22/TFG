import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule, RouterModule, HeaderComponent, FormsModule],
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
}
