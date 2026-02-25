import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { HeaderComponent } from '../../../../layout/header/header.component';
import { SidebarEquipoComponent } from '../sidebar-equipo/sidebar-equipo.component';

import { EquipoService } from '../../../../../services/equipo/equipos.service';
import { AuthService } from '../../../../../services/auth/auth.service';

import { AddPlayersTeamModalComponent } from '../../../club/modals/add-players-team-modal/add-players-team-modal.component';

import { AssignCoachTeamModalComponent } from '../../../club/modals/assign-coach-team-modal/assign-coach-team-modal.component';

@Component({
  selector: 'app-plantilla',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarEquipoComponent],
  templateUrl: './plantilla.component.html',
  styleUrls: ['./plantilla.component.scss'],
})
export class PlantillaComponent implements OnInit {
  equipoId!: number;
  equipo: any = null;
  loading = true;
  sinEquipo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipoService: EquipoService,
    private dialog: MatDialog,
    public authService: AuthService,
  ) {}

  /* ================================
        INIT
  =================================*/
  ngOnInit(): void {
    const user = this.authService.getUser();

    // 🧑‍🦱 JUGADOR SIN EQUIPO
    if (user?.Rol === 'jugador' && !user.equipo_id) {
      this.sinEquipo = true;
      this.loading = false;
      return;
    }

    const idParam = this.route.parent?.snapshot.paramMap.get('id');

    if (!idParam) {
      this.sinEquipo = true;
      this.loading = false;
      return;
    }

    const id = Number(idParam);

    if (isNaN(id)) {
      this.sinEquipo = true;
      this.loading = false;
      return;
    }

    this.equipoId = id;
    this.cargarEquipo();
  }

  /* ================================
        CARGAR EQUIPO
  =================================*/
  cargarEquipo() {
    this.loading = true;

    this.equipoService.getEquipoById(this.equipoId).subscribe({
      next: (data) => {
        this.equipo = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('No se pudo cargar el equipo');
      },
    });
  }

  /* ================================
        MODAL AÑADIR JUGADORES
  =================================*/
  abrirModalAddJugadores() {
    const dialogRef = this.dialog.open(AddPlayersTeamModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        clubId: this.equipo.club.id,
        edadMin: this.equipo.categoria.edadMin,
        edadMax: this.equipo.categoria.edadMax,
        anioTemporada: this.equipo.temporada.anio,
      },
    });

    dialogRef.afterClosed().subscribe((refresh) => {
      if (refresh) {
        this.cargarEquipo();
      }
    });
  }

  /* ================================
        MODAL AÑADIR ENTRENADOR
  =================================*/
  abrirModalEntrenadorEquipo() {
    const dialogRef = this.dialog.open(AssignCoachTeamModalComponent, {
      width: '700px',
      data: {
        clubId: this.equipo.club.id,
        equipoId: this.equipoId,
      },
    });

    dialogRef.afterClosed().subscribe((refresh) => {
      if (refresh) this.cargarEquipo();
    });
  }

  /* ================================
        ELIMINAR JUGADOR
  =================================*/
  eliminarJugador(dni: string) {
    this.equipoService.moverJugador(dni, null).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert('Error al eliminar jugador'),
    });
  }

  /* ================================
        ELIMINAR ENTRENADOR
  =================================*/
  eliminarEntrenador(dni: string) {
    this.equipoService.quitarEntrenadorEquipo(dni).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert('Error al quitar entrenador del equipo'),
    });
  }

  /* ================================
        VOLVER AL CLUB (ADMIN)
  =================================*/
  volverAlClub() {
    this.router.navigate(['/club', this.equipo.club.id]);
  }

  irAFicha(dni: string) {
    this.router.navigate(['/equipo', this.equipoId, 'jugador', dni]);
  }
}
