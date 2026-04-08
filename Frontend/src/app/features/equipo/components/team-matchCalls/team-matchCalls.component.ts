import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { HeaderComponent } from '../../../../layout/header/header.component';
import { TeamSidebarComponent } from '../team-sidebar/team-sidebar.component';

import { AuthService } from '../../../../../services/auth/auth.service';
import { TeamService } from '../../../../../services/team/team.service';
import { MatchCallService } from '../../../../../services/team/matchCall.service';

import { CreateMatchCallModalComponent } from '../../modals/create-match-call-modal/create-match-call-modal.component';
import { ReasonModalComponent } from '../../modals/reason-modal/reason-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadStatsModalComponent } from '../../modals/load-stats-modal/load-stats-modal.component';
import { StatsService } from '../../../../../services/player/stats.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-equipo-convocatorias',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    TeamSidebarComponent,
    MatTooltipModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './team-matchCalls.component.html',
  styleUrls: ['./team-matchCalls.component.css'],
})
export class TeamMatchCallsComponent implements OnInit {
  teamId!: number;
  team: any = null;

  loading = true;
  loadingMatchCalls = false;

  noTeam = false;
  matchCalls: any[] = [];
  playerStats: { [key: number]: any } = {};
  openStats: { [key: number]: boolean } = {};

  statusFilter: 'todas' | 'abiertas' | 'cerradas' = 'todas';
  monthFilter: number | null = null;
  yearFilter: number | null = new Date().getFullYear();
  textFilter: string = '';

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private matchCallService: MatchCallService,
    private dialog: MatDialog,
    public authService: AuthService,
    private statsService: StatsService,
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

    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
        this.loading = false;
        this.loadMatchCalls();
      },
      error: () => {
        this.loading = false;
        alert('No se pudo cargar el equipo');
      },
    });
  }

  loadMatchCalls() {
    this.loadingMatchCalls = true;

    this.matchCallService.getTeamMatchCalls(this.teamId).subscribe({
      next: (data) => {
        this.matchCalls = data;
        this.loadingMatchCalls = false;
      },
      error: () => (this.loadingMatchCalls = false),
    });
  }

  openCreateMatchCallModal() {
    const ref = this.dialog.open(CreateMatchCallModalComponent, {
      width: '700px',
      data: {
        equipoId: this.teamId,
        jugadoresEquipo: this.team?.jugadores || [],
      },
    });

    ref.afterClosed().subscribe((r) => {
      if (r) this.loadMatchCalls();
    });
  }

  isInvited(item: any): boolean {
    const user = this.authService.getUser();
    if (!user || !item.jugadores) return false;
    return item.jugadores.some((j: any) => j.DNI === user.DNI);
  }

  getPlayerStatus(matchCall: any) {
    const user = this.authService.getUser();
    return matchCall.jugadores?.find((j: any) => j.DNI === user?.DNI)?.estado;
  }

  respondMatchCall(matchCall: any, status: string) {
    console.log('Convocatoria:', matchCall);
    const user = this.authService.getUser();
    this.matchCallService
      .respondMatchCall(matchCall.id, {
        jugador_dni: user.DNI,
        estado: status,
      })
      .subscribe(() => this.loadMatchCalls());
  }

  openReasonModal(matchCall: any) {
    const ref = this.dialog.open(ReasonModalComponent, {
      width: '400px',
      data: { titulo: 'Motivo de la ausencia' },
    });

    ref.afterClosed().subscribe((reason) => {
      if (!reason) return;

      this.matchCallService
        .respondMatchCall(matchCall.id, {
          jugador_dni: this.authService.getUser().DNI,
          estado: 'rechazado',
          motivo: reason,
        })
        .subscribe(() => this.loadMatchCalls());
    });
  }

  sendReminder(matchCall: any) {
    this.matchCallService.sendReminder(matchCall.id).subscribe(() => alert('Recordatorio enviado'));
  }

  countByStatus(matchCall: any, status: 'confirmado' | 'rechazado' | 'pendiente'): number {
    if (!matchCall?.jugadores) return 0;
    return matchCall.jugadores.filter((j: any) => j.estado === status).length;
  }

  isMatchCallClosed(matchCall: any): boolean {
    if (!matchCall.fecha_limite_confirmacion) return false;

    const now = new Date();
    const deadline = new Date(matchCall.fecha_limite_confirmacion);

    return now > deadline;
  }

  statusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'confirmado_tarde':
        return 'Confirmado (llega tarde)';
      case 'rechazado':
        return 'Rechazado';
      case 'pendiente':
      default:
        return 'Pendiente';
    }
  }

  openEditMatchCallModal(matchCall: any) {
    const ref = this.dialog.open(CreateMatchCallModalComponent, {
      width: '700px',
      data: {
        equipoId: this.teamId,
        jugadoresEquipo: this.team?.jugadores || [],
        convocatoria: matchCall,
      },
    });

    ref.afterClosed().subscribe((r) => {
      if (r) this.loadMatchCalls();
    });
  }

  openStatsModal(matchCall: any) {
    const ref = this.dialog.open(LoadStatsModalComponent, {
      width: '1100px',
      maxWidth: '98vw',
      height: 'auto',
      autoFocus: false,
      panelClass: 'stats-dialog',
      data: {
        convocatoriaId: matchCall.id,
        jugadores: matchCall.jugadores,
      },
    });
    console.log(matchCall.jugadores);
    ref.afterClosed().subscribe();
  }

  togglePlayerStats(matchCallId: number) {
    const user = this.authService.getUser();

    if (this.openStats[matchCallId]) {
      this.openStats[matchCallId] = false;
      return;
    }

    if (!this.playerStats[matchCallId]) {
      this.statsService.getPlayerMatchCallStats(matchCallId, user.DNI).subscribe((data) => {
        this.playerStats[matchCallId] = data;
        this.openStats[matchCallId] = true;
      });
    } else {
      this.openStats[matchCallId] = true;
    }
  }

  get filteredMatchCalls() {
    let data = [...this.matchCalls];

    if (this.statusFilter === 'abiertas') {
      data = data.filter((c) => !this.isMatchCallClosed(c));
    }

    if (this.statusFilter === 'cerradas') {
      data = data.filter((c) => this.isMatchCallClosed(c));
    }

    if (this.monthFilter !== null) {
      data = data.filter((c) => {
        const date = new Date(c.fecha_partido);
        return date.getMonth() === this.monthFilter;
      });
    }

    if (this.yearFilter) {
      data = data.filter((c) => {
        const date = new Date(c.fecha_partido);
        return date.getFullYear() === this.yearFilter;
      });
    }

    if (this.textFilter.trim()) {
      data = data.filter((c) => c.rival?.toLowerCase().includes(this.textFilter.toLowerCase()));
    }

    return data;
  }

  get totalPages() {
    return Math.ceil(this.filteredMatchCalls.length / this.itemsPerPage);
  }

  get paginatedMatchCalls() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMatchCalls.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  deleteMatchCall(matchCall: any) {
    if (!confirm('¿Eliminar esta convocatoria?')) return;

    this.matchCallService.deleteMatchCall(matchCall.id).subscribe({
      next: () => (this.matchCalls = this.matchCalls.filter((x) => x.id !== matchCall.id)),
      error: () => alert('No se pudo eliminar la convocatoria'),
    });
  }
}
