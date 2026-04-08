import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';

import { MatDialog } from '@angular/material/dialog';
import { CalendarService } from '../../../../../services/team/calendar.service';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { CreateMatchCallModalComponent } from '../../modals/create-match-call-modal/create-match-call-modal.component';
import { CreateEventModalComponent } from '../../modals/create-event-modal/create-event-modal.component';
import { TeamService } from '../../../../../services/team/team.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { EventDetailsModalComponent } from '../../modals/event-details-modal/event-details-modal.component';
import { TeamSidebarComponent } from '../team-sidebar/team-sidebar.component';

@Component({
  selector: 'app-equipo-calendario',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FullCalendarModule, TeamSidebarComponent],
  templateUrl: './team-calendar.component.html',
  styleUrls: ['./team-calendar.component.scss'],
})
export class TeamCalendarComponent implements OnInit {
  teamId!: number;
  loading = true;
  isBrowser = false;
  team: any = null;

  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    events: [],
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    eventClick: (info: EventClickArg) => this.handleEventClick(info),
  };

  constructor(
    private route: ActivatedRoute,
    private calendarService: CalendarService,
    private teamService: TeamService,
    private dialog: MatDialog,
    public authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const id = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.teamId = id;
    this.loadTeamData();
    this.loadCalendar();
  }

  handleEventClick(info: EventClickArg) {
    const originalId = info.event.id;
    const isConvocatoria = originalId.startsWith('conv-');
    const numericId = Number(originalId.split('-')[1]);

    this.dialog
      .open(EventDetailsModalComponent, {
        width: '500px',
        data: {
          id: numericId,
          tipo: isConvocatoria ? 'convocatoria' : 'evento',
          equipoId: this.teamId,
        },
      })
      .afterClosed()
      .subscribe((refresh) => {
        if (refresh) {
          this.loadCalendar(); // Recargamos si el jugador confirmó/rechazó
        }
      });
  }

  loadTeamData() {
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
      },
      error: (err) => console.error('Error al cargar info del equipo', err),
    });
  }

  loadCalendar() {
    this.loading = true;

    this.calendarService.getTeamCalendar(this.teamId).subscribe({
      next: (data) => {
        console.log('Eventos recibidos del backend:', data);
        console.log(data);
        const events = data.map((e) => ({
          id: e.id,
          title: e.titulo,
          start: new Date(e.inicio.replace('Z', '')),
          end: new Date(e.fin.replace('Z', '')),
          allDay: false,
          className: `tipo-${e.tipo}`,
        }));

        this.calendarOptions = {
          ...this.calendarOptions,
          events: events,
        };

        this.loading = false; // 👈 OBLIGATORIO
      },
      error: (err) => {
        console.error('Error cargando calendario', err);
        this.loading = false; // 👈 OBLIGATORIO
      },
    });
  }

  downloadICal() {
    window.open(this.calendarService.getTeamICal(this.teamId), '_blank');
  }

  openCreateConvocatoriaModal() {
    // Verificación de seguridad
    if (!this.team) {
      alert('Cargando datos del equipo, por favor espera...');
      return;
    }

    const ref = this.dialog.open(CreateMatchCallModalComponent, {
      width: '700px',
      data: {
        equipoId: this.teamId,
        jugadoresEquipo: this.team.jugadores, // Ahora ya no será null
      },
    });

    ref.afterClosed().subscribe((r) => {
      if (r) this.loadCalendar(); // Recargamos el calendario completo
    });
  }

  openCreateEventModal() {
    if (!this.team) return;

    const ref = this.dialog.open(CreateEventModalComponent, {
      width: '700px',
      data: {
        equipoId: this.teamId,
        jugadoresEquipo: this.team.jugadores,
      },
    });

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) this.loadCalendar(); // Recargamos el calendario completo
    });
  }
}
