import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { HeaderComponent } from '../../../../layout/header/header.component';
import { TeamSidebarComponent } from '../team-sidebar/team-sidebar.component';

import { TeamService } from '../../../../../services/team/team.service';
import { AuthService } from '../../../../../services/auth/auth.service';

import { AddPlayersTeamModalComponent } from '../../../club/modals/add-players-team-modal/add-players-team-modal.component';
import { AssignCoachTeamModalComponent } from '../../../club/modals/assign-coach-team-modal/assign-coach-team-modal.component';

@Component({
  selector: 'app-plantilla',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TeamSidebarComponent],
  templateUrl: './squad.component.html',
  styleUrls: ['./squad.component.scss'],
})
export class SquadComponent implements OnInit {
  teamId!: number;
  team: any = null;
  loading = true;
  noTeam = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
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
      this.noTeam = true;
      this.loading = false;
      return;
    }

    const idParam = this.route.parent?.snapshot.paramMap.get('id');

    if (!idParam) {
      this.noTeam = true;
      this.loading = false;
      return;
    }

    const id = Number(idParam);

    if (isNaN(id)) {
      this.noTeam = true;
      this.loading = false;
      return;
    }

    this.teamId = id;
    this.loadTeam();
  }

  /* ================================
        CARGAR EQUIPO
  =================================*/
  loadTeam() {
    this.loading = true;

    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
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
  openAddPlayersModal() {
    const dialogRef = this.dialog.open(AddPlayersTeamModalComponent, {
      width: '700px',
      data: {
        equipoId: this.teamId,
        clubId: this.team.club.id,
        edadMin: this.team.categoria.edadMin,
        edadMax: this.team.categoria.edadMax,
        anioTemporada: this.team.temporada.anio,
      },
    });

    dialogRef.afterClosed().subscribe((refresh) => {
      if (refresh) {
        this.loadTeam();
      }
    });
  }

  /* ================================
        MODAL AÑADIR ENTRENADOR
  =================================*/
  openAssignCoachModal() {
    const dialogRef = this.dialog.open(AssignCoachTeamModalComponent, {
      width: '700px',
      data: {
        clubId: this.team.club.id,
        equipoId: this.teamId,
      },
    });

    dialogRef.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadTeam();
    });
  }

  /* ================================
        ELIMINAR JUGADOR
  =================================*/
  removePlayer(dni: string) {
    this.teamService.movePlayer(dni, null).subscribe({
      next: () => this.loadTeam(),
      error: () => alert('Error al eliminar jugador'),
    });
  }

  /* ================================
        ELIMINAR ENTRENADOR
  =================================*/
  removeCoach(dni: string) {
    this.teamService.removeCoachFromTeam(dni).subscribe({
      next: () => this.loadTeam(),
      error: () => alert('Error al quitar entrenador del equipo'),
    });
  }

  /* ================================
        VOLVER AL CLUB (ADMIN)
  =================================*/
  goBackToClub() {
    this.router.navigate(['/club', this.team.club.id]);
  }

  goToProfile(dni: string) {
    this.router.navigate(['/equipo', this.teamId, 'jugador', dni]);
  }
}
