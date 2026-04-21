import { StatsService } from '../../../../services/player/stats.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../layout/header/header.component';
import { TeamSidebarComponent } from '../../equipo/components/team-sidebar/team-sidebar.component';
import { AuthService } from '../../../../services/auth/auth.service';
import { TeamService } from '../../../../services/team/team.service';
import { signal } from '@angular/core';
import { ObservationsService } from '../../../../services/team/observations.service';
import { MatIconModule } from '@angular/material/icon';
import { CreateObservationModalComponent } from '../../equipo/modals/create-observation-modal/create-observation-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PlayerAiPanelComponent } from '../../ai/components/player-ai-panel/player-ai-panel.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-jugador-ficha',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    RouterModule,
    TeamSidebarComponent,
    MatIconModule,
    MatDialogModule,
    PlayerAiPanelComponent,
  ],
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.scss'],
})
export class PlayerProfileComponent implements OnInit {
  player: any = null;
  teamId!: number;
  loading = true;
  team: any = null;
  totals: any = {};
  observations = signal<any[]>([]);

  showAllObservations = false;
  readonly OBSERVATIONS_LIMIT = 2;

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private teamService: TeamService,
    private statsService: StatsService,
    private observationsService: ObservationsService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.teamId = Number(this.route.parent?.snapshot.paramMap.get('id'));

    this.route.paramMap.subscribe((params) => {
      const dni = params.get('dni');
      if (!dni) return;

      this.loading = true;
      this.player = null;
      this.observations.set([]);

      this.teamService.getTeamById(this.teamId).subscribe({
        next: (data) => (this.team = data),
      });

      this.authService.getUserByDni(dni).subscribe({
        next: (data) => {
          this.player = data;
          this.loading = false;
          this.loadObservations(dni);
        },
        error: () => {
          this.loading = false;
          alert('Error cargando jugador');
        },
      });

      this.statsService.getPlayerTotals(dni).subscribe({
        next: (data) => (this.totals = data),
        error: (err) => console.error('Error estadísticas:', err),
      });
    });
  }

  get visibleObservations() {
    const obs = this.observations();
    return this.showAllObservations ? obs : obs.slice(0, this.OBSERVATIONS_LIMIT);
  }

  toggleObservations() {
    this.showAllObservations = !this.showAllObservations;
  }

  get age(): number {
    if (!this.player?.anio_nacimiento) return 0;
    return new Date().getFullYear() - this.player.anio_nacimiento;
  }

  loadObservations(dni: string) {
    this.observationsService.getByPlayer(dni).subscribe({
      next: (data) => this.observations.set(data),
      error: (err) => console.error('Error observaciones:', err),
    });
  }

  openObservationModal() {
    const dialogRef = this.dialog.open(CreateObservationModalComponent, {
      width: '600px',
      data: {
        equipoId: this.player.equipo_id,
        jugadoresEquipo: [this.player],
        dniIndividual: this.player.DNI,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadObservations(this.player.DNI);
      }
    });
  }
}
