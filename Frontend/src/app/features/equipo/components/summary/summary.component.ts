import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TeamService } from '../../../../../services/team/team.service';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AddPlayersTeamModalComponent } from '../../../club/modals/add-players-team-modal/add-players-team-modal.component';
import { AssignCoachTeamModalComponent } from '../../../club/modals/assign-coach-team-modal/assign-coach-team-modal.component';
import { AuthService } from '../../../../../services/auth/auth.service';
import { MatchCallService } from '../../../../../services/team/matchCall.service';
import { CreateMatchCallModalComponent } from '../../modals/create-match-call-modal/create-match-call-modal.component';
import { EventService } from '../../../../../services/team/event.service';
import { CreateEventModalComponent } from '../../modals/create-event-modal/create-event-modal.component';
import { ReasonModalComponent } from '../../modals/reason-modal/reason-modal.component';
import { TeamSidebarComponent } from '../team-sidebar/team-sidebar.component';
import { MiniCalendarComponent } from '../mini-calendar/mini-calendar.component';

interface Player {
  DNI: string;
  nombre: string;
  foto?: string | null;
  telefono?: string;
  email?: string;
}

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    TeamSidebarComponent,
    MiniCalendarComponent,
    MatIconModule,
  ],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  teamId!: number;
  team: any = null;
  loading = true;
  isAdmin = false;
  isCoach = false;
  isPlayer = false;
  matchCalls: any[] = [];
  loadingMatchCalls = false;
  events: any[] = [];
  loadingEvents = false;
  noTeam = false;

  errorMessage: string = '';
  successMessage: string = '';

  availablePlayers: any[] = [];
  availableCoaches: any[] = [];

  weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private matchCallService: MatchCallService,
    private eventService: EventService,
    private dialog: MatDialog,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const user = this.authService.getUser();
      const idParam = params.get('id');
      const id = Number(idParam);

      this.loading = true;
      this.team = null;
      this.noTeam = false;
      this.errorMessage = '';
      this.successMessage = '';

      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      if (!idParam || isNaN(id)) {
        this.noTeam = true;
        this.loading = false;
        return;
      }

      if (user.Rol === 'jugador') {
        if (!user.equipo_id) {
          this.noTeam = true;
          this.loading = false;
          return;
        }

        if (id !== user.equipo_id) {
          console.warn('Acceso denegado. Redirigiendo a su equipo...');
          this.router.navigate(['/equipo', user.equipo_id]);
          return;
        }
      }

      this.teamId = id;
      this.loadTeam();
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
        jugadoresEquipo: this.team.jugadores,
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
    const user = this.authService.getUser();
    this.matchCallService
      .respondMatchCall(matchCall.id, {
        jugador_dni: user.DNI,
        estado: status,
      })
      .subscribe(() => this.loadMatchCalls());
  }

  sendReminder(matchCall: any) {
    this.errorMessage = '';
    this.matchCallService.sendReminder(matchCall.id).subscribe({
      next: () => (this.successMessage = 'Recordatorio enviado.'),
      error: () => (this.errorMessage = 'Error enviando recordatorio.'),
    });
  }

  countByStatus(matchCall: any, status: 'confirmado' | 'rechazado' | 'pendiente'): number {
    if (!matchCall?.jugadores) return 0;
    return matchCall.jugadores.filter((j: any) => j.estado === status).length;
  }

  loadEvents() {
    this.loadingEvents = true;
    this.eventService.getTeamEvents(this.teamId).subscribe({
      next: (data) => {
        this.events = data;
        this.loadingEvents = false;
      },
      error: () => (this.loadingEvents = false),
    });
  }

  getPlayerEventStatus(event: any) {
    const user = this.authService.getUser();
    return event.jugadores?.find((j: any) => j.DNI === user?.DNI)?.estado;
  }

  openCreateEventModal() {
    const ref = this.dialog.open(CreateEventModalComponent, {
      width: '700px',
      data: {
        equipoId: this.teamId,
        jugadoresEquipo: this.team.jugadores,
      },
    });

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadEvents();
    });
  }

  respondToEvent(event: any, status: string) {
    this.errorMessage = '';
    this.eventService
      .respondToEvent(event.id, {
        jugador_dni: this.authService.getUser().DNI,
        estado: status,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Respuesta registrada.';
          this.loadEvents();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'No se pudo responder.';
        },
      });
  }

  countByEventStatus(event: any, status: 'confirmado' | 'rechazado' | 'pendiente'): number {
    if (!event?.jugadores) return 0;
    return event.jugadores.filter((j: any) => {
      if (status === 'confirmado') {
        return j.estado === 'confirmado' || j.estado === 'confirmado_tarde';
      }
      return j.estado === status;
    }).length;
  }

  confirmingDeleteEvent: any = null;

  askDeleteEvent(event: any) {
    this.confirmingDeleteEvent = event;
  }

  cancelDeleteEvent() {
    this.confirmingDeleteEvent = null;
  }

  deleteEvent(event: any) {
    this.errorMessage = '';
    this.confirmingDeleteEvent = null;
    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.events = this.events.filter((ev) => ev.id !== event.id);
      },
      error: (err) => {
        console.error('Error al eliminar evento:', err);
        this.errorMessage = 'No se pudo eliminar el evento.';
      },
    });
  }

  sendEventReminder(event: any) {
    this.errorMessage = '';
    this.eventService.sendReminder(event.id).subscribe({
      next: () => (this.successMessage = 'Recordatorio enviado.'),
      error: () => (this.errorMessage = 'Error enviando recordatorio.'),
    });
  }

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

  loadTeam() {
    this.loading = true;
    this.errorMessage = '';

    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
        this.loading = false;
        this.loadMatchCalls();
        this.loadEvents();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar el equipo.';
        this.loadMatchCalls();
        this.loadEvents();
      },
    });
  }

  goBackToClub() {
    this.router.navigate(['/club', this.team.club.id]);
  }

  assignCoach(dni: string) {
    this.errorMessage = '';
    this.teamService.assignCoach(this.teamId, dni).subscribe({
      next: () => this.loadTeam(),
      error: () => (this.errorMessage = 'Error al asignar entrenador.'),
    });
  }

  assignPlayer(dni: string) {
    this.errorMessage = '';
    this.teamService.assignPlayers(this.teamId, [dni]).subscribe({
      next: () => this.loadTeam(),
      error: () => (this.errorMessage = 'Error al asignar jugador.'),
    });
  }

  removePlayer(dni: string) {
    this.errorMessage = '';
    this.teamService.movePlayer(dni, null).subscribe({
      next: () => this.loadTeam(),
      error: () => (this.errorMessage = 'Error al eliminar jugador.'),
    });
  }

  onDropPlayer(event: any) {
    const playerDNI = event.dataTransfer.getData('text/dni');
    this.errorMessage = '';
    this.teamService.movePlayer(playerDNI, this.teamId).subscribe({
      next: () => this.loadTeam(),
      error: () => (this.errorMessage = 'Error moviendo jugador.'),
    });
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  dragPlayer(event: any, dni: string) {
    event.dataTransfer.setData('text/dni', dni);
  }

  removeCoach(dni: string) {
    this.errorMessage = '';
    this.teamService.removeCoachFromTeam(dni).subscribe({
      next: () => this.loadTeam(),
      error: () => (this.errorMessage = 'Error al quitar entrenador del equipo.'),
    });
  }

  isPastEvent(event: any): boolean {
    return new Date(event.fecha_inicio) < new Date();
  }

  isMatchCallClosed(matchCall: any): boolean {
    if (!matchCall?.fecha_limite_confirmacion) return false;
    return new Date() > new Date(matchCall.fecha_limite_confirmacion);
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

  openMatchCallReasonModal(matchCall: any) {
    const ref = this.dialog.open(ReasonModalComponent, {
      width: '600px',
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

  openLateArrivalModal(event: any) {
    const ref = this.dialog.open(ReasonModalComponent, {
      width: '400px',
      data: { titulo: 'Indica el motivo del retraso' },
    });

    ref.afterClosed().subscribe((reason) => {
      if (!reason) return;
      this.eventService
        .respondToEvent(event.id, {
          jugador_dni: this.authService.getUser().DNI,
          estado: 'confirmado_tarde',
          motivo: reason,
        })
        .subscribe(() => this.loadEvents());
    });
  }

  openEventReasonModal(event: any) {
    const ref = this.dialog.open(ReasonModalComponent, {
      width: '600px',
      data: { titulo: 'Motivo de la ausencia' },
    });

    ref.afterClosed().subscribe((reason) => {
      if (!reason) return;
      this.eventService
        .respondToEvent(event.id, {
          jugador_dni: this.authService.getUser().DNI,
          estado: 'rechazado',
          motivo: reason,
        })
        .subscribe(() => this.loadEvents());
    });
  }

  hasPending(): boolean {
    const user = this.authService.getUser();
    return (
      this.matchCalls.some((c) =>
        c.jugadores?.some((j: any) => j.DNI === user?.DNI && j.estado === 'pendiente'),
      ) ||
      this.events.some((e) =>
        e.jugadores?.some((j: any) => j.DNI === user?.DNI && j.estado === 'pendiente'),
      )
    );
  }

  countConfirmed(): number {
    return this.matchCalls.reduce((acc, c) => acc + this.countByStatus(c, 'confirmado'), 0);
  }

  countPending(): number {
    return this.matchCalls.reduce((acc, c) => acc + this.countByStatus(c, 'pendiente'), 0);
  }

  countRejected(): number {
    return this.matchCalls.reduce((acc, c) => acc + this.countByStatus(c, 'rechazado'), 0);
  }

  get playersPreview(): Player[] {
    if (!this.team?.jugadores) return [];
    return this.team.jugadores.slice(0, 10);
  }

  get extraPlayers(): number {
    if (!this.team?.jugadores) return 0;
    return Math.max(this.team.jugadores.length - 8, 0);
  }

  get nextEvent() {
    const now = new Date();
    return this.events
      .filter((e) => new Date(e.fecha_inicio) > now)
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())[0];
  }

  get nextMatchCall() {
    const now = new Date();
    return this.matchCalls
      .filter((c) => new Date(c.fecha_partido) > now)
      .sort((a, b) => new Date(a.fecha_partido).getTime() - new Date(b.fecha_partido).getTime())[0];
  }

  hasPendingEvents(): boolean {
    if (!this.authService.hasRole('jugador')) return false;
    return this.events.some(
      (e) =>
        e.requiere_confirmacion &&
        this.isInvited(e) &&
        this.getPlayerEventStatus(e) === 'pendiente',
    );
  }

  hasPendingMatchCalls(): boolean {
    if (!this.authService.hasRole('jugador')) return false;
    return this.matchCalls.some(
      (c) =>
        this.isInvited(c) && this.getPlayerStatus(c) === 'pendiente' && !this.isMatchCallClosed(c),
    );
  }
}
