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
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private dialog: MatDialog,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

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

  loadTeam() {
    this.loading = true;
    this.errorMessage = '';

    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar el equipo.';
      },
    });
  }

  openAddPlayersModal() {
    console.log('equipo completo:', this.team);
    console.log('temporada:', this.team.temporada);
    console.log('categoria:', this.team.categoria);
    console.log('anioTemporada:', this.team.temporada?.anio);
    console.log('edadMin:', this.team.categoria?.edadMin);
    console.log('edadMax:', this.team.categoria?.edadMax);
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
      if (refresh) this.loadTeam();
    });
  }

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

  removePlayer(dni: string) {
    this.errorMessage = '';
    this.teamService.movePlayer(dni, null).subscribe({
      next: () => this.loadTeam(),
      error: () => (this.errorMessage = 'Error al eliminar jugador.'),
    });
  }

  removeCoach(dni: string) {
    this.errorMessage = '';
    this.teamService.removeCoachFromTeam(dni).subscribe({
      next: () => this.loadTeam(),
      error: () => (this.errorMessage = 'Error al quitar entrenador del equipo.'),
    });
  }

  goBackToClub() {
    this.router.navigate(['/club', this.team.club.id]);
  }

  goToProfile(dni: string) {
    this.router.navigate(['/equipo', this.teamId, 'jugador', dni]);
  }
}
