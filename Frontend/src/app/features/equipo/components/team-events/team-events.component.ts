import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { HeaderComponent } from '../../../../layout/header/header.component';
import { TeamSidebarComponent } from '../team-sidebar/team-sidebar.component';

import { AuthService } from '../../../../../services/auth/auth.service';
import { TeamService } from '../../../../../services/team/team.service';
import { EventService } from '../../../../../services/team/event.service';

import { CreateEventModalComponent } from '../../modals/create-event-modal/create-event-modal.component';
import { ReasonModalComponent } from '../../modals/reason-modal/reason-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadRendimientoModalComponent } from '../../modals/load-rendimiento-modal/load-rendimiento-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-equipo-eventos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    TeamSidebarComponent,
    MatTooltipModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './team-events.component.html',
  styleUrls: ['./team-events.component.css'],
})
export class TeamsEventsComponent implements OnInit {
  // ======================
  // ESTADO GENERAL
  // ======================
  teamId!: number;
  team: any = null;

  events: any[] = [];
  loadingEvents = false;

  noTeam = false;
  currentPage = 1;
  itemsPerPage = 5;

  typeFilter: 'todos' | 'partido' | 'entrenamiento' | 'reunion' = 'todos';
  monthFilter: number | null = null;
  yearFilter: number | null = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private eventService: EventService,
    private dialog: MatDialog,
    public authService: AuthService,
  ) {}

  // ======================
  // INIT
  // ======================
  ngOnInit(): void {
    const user = this.authService.getUser();

    // 🧑‍🦱 Jugador sin equipo
    if (user?.Rol === 'jugador' && !user.equipo_id) {
      this.noTeam = true;
      return;
    }

    // 📌 ID equipo desde URL
    const idParam = this.route.parent?.snapshot.paramMap.get('id');
    if (!idParam) {
      this.noTeam = true;
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.noTeam = true;
      return;
    }

    this.teamId = id;
    this.loadTeam();
  }

  // ======================
  // CARGA DE DATOS
  // ======================
  loadTeam() {
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
        this.loadEvents();
      },
      error: () => {
        alert('No se pudo cargar el equipo');
      },
    });
  }

  loadEvents() {
    this.loadingEvents = true;

    this.eventService.getTeamEvents(this.teamId).subscribe({
      next: (data) => {
        this.events = data;
        this.loadingEvents = false;
      },
      error: () => {
        this.loadingEvents = false;
        alert('Error cargando eventos');
      },
    });
  }

  // ======================
  // EVENTOS – ACCIONES
  // ======================
  openCreateEventModal() {
    const ref = this.dialog.open(CreateEventModalComponent, {
      width: '700px',
      data: {
        equipoId: this.teamId,
        jugadoresEquipo: this.team.jugadores,
      },
    });

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) {
        this.loadEvents();
      }
    });
  }

  deleteEvent(event: any) {
    if (!confirm(`¿Eliminar el evento "${event.titulo}"?`)) return;

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.events = this.events.filter((ev) => ev.id !== event.id);
      },
      error: () => alert('No se pudo eliminar el evento'),
    });
  }

  sendEventReminder(event: any) {
    this.eventService.sendReminder(event.id).subscribe({
      next: () => alert('Recordatorio enviado'),
      error: () => alert('Error enviando recordatorio'),
    });
  }

  // ======================
  // RESPUESTAS JUGADOR
  // ======================
  isInvited(event: any): boolean {
    const user = this.authService.getUser();
    return event.jugadores?.some((j: any) => j.DNI === user?.DNI);
  }

  getPlayerEventStatus(event: any) {
    const user = this.authService.getUser();
    return event.jugadores?.find((j: any) => j.DNI === user?.DNI)?.estado;
  }

  respondToEvent(event: any, status: string) {
    const user = this.authService.getUser();

    this.eventService
      .respondToEvent(event.id, {
        jugador_dni: user.DNI,
        estado: status,
      })
      .subscribe({
        next: () => this.loadEvents(),
        error: (err) => alert(err.error?.message || 'No se pudo responder'),
      });
  }

  openLateArrivalModal(event: any) {
    const ref = this.dialog.open(ReasonModalComponent, {
      width: '400px',
      data: { titulo: 'Motivo del retraso' },
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

  openReasonModal(event: any) {
    const ref = this.dialog.open(ReasonModalComponent, {
      width: '400px',
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

  // ======================
  // UTILIDADES
  // ======================
  isPastEvent(event: any): boolean {
    return new Date(event.fecha_inicio) < new Date();
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

  openEditEventModal(event: any) {
    const ref = this.dialog.open(CreateEventModalComponent, {
      width: '700px',
      data: {
        equipoId: this.teamId,
        jugadoresEquipo: this.team.jugadores,
        evento: event, // 👈 clave
      },
    });

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadEvents();
    });
  }

  openPerformanceModal(event: any) {
    const ref = this.dialog.open(LoadRendimientoModalComponent, {
      width: '900px',
      maxWidth: '90vw',
      height: 'auto',
      data: {
        eventoId: event.id,
        jugadores: event.jugadores,
      },
    });

    ref.afterClosed().subscribe();
  }

  get filteredEvents() {
    let data = [...this.events];

    // Filtrar por tipo
    if (this.typeFilter !== 'todos') {
      data = data.filter((e) => e.tipo === this.typeFilter);
    }

    // Filtrar por mes
    if (this.monthFilter !== null) {
      data = data.filter((e) => {
        const date = new Date(e.fecha_inicio);
        return date.getMonth() === this.monthFilter;
      });
    }

    // Filtrar por año
    if (this.yearFilter) {
      data = data.filter((e) => {
        const date = new Date(e.fecha_inicio);
        return date.getFullYear() === this.yearFilter;
      });
    }

    return data;
  }

  get totalPages() {
    return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  }

  get paginatedEvents() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEvents.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
