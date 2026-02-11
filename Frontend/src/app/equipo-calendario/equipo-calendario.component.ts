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
import { CalendarioService } from '../../services/calendario.service';
import { HeaderComponent } from '../header/header.component';
import { CreateConvocatoriaModalComponent } from '../../shared/components/create-convocatoria-modal/create-convocatoria-modal.component';
import { CreateEventoModalComponent } from '../../shared/components/create-evento-modal/create-evento-modal.component';
import { EquipoService } from '../../services/equipos.service';
import { AuthService } from '../../services/auth.service';
import { DetallesEventoModalComponent } from '../../shared/components/detalles-evento-modal/detalles-evento-modal.component';
import { SidebarEquipoComponent } from "../sidebar-equipo/sidebar-equipo.component";

@Component({
  selector: 'app-equipo-calendario',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FullCalendarModule, SidebarEquipoComponent],
  templateUrl: './equipo-calendario.component.html',
  styleUrls: ['./equipo-calendario.component.scss']
})
export class EquipoCalendarioComponent implements OnInit {

  equipoId!: number;
  loading = true;
  isBrowser = false;
  equipo: any = null;

  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: [],
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventClick: (info: EventClickArg) => this.gestionarClickEvento(info)
    
  };

  constructor(
    private route: ActivatedRoute,
    private calendarioService: CalendarioService,
    private equipoService: EquipoService,
    private dialog: MatDialog,
    public authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
    if (!this.isBrowser) return;
  
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.equipoId = id;
    this.cargarDatosEquipo();
    this.cargarCalendario();
  }
  
  gestionarClickEvento(info: EventClickArg) {
    
    const idOriginal = info.event.id;
    const esConvocatoria = idOriginal.startsWith('conv-');
    const idNumerico = Number(idOriginal.split('-')[1]);

    this.dialog.open(DetallesEventoModalComponent, {
      width: '500px',
      data: { 
        id: idNumerico, 
        tipo: esConvocatoria ? 'convocatoria' : 'evento' ,
        equipoId: this.equipoId
      }
    }).afterClosed().subscribe(refresh => {
      if (refresh) {
        this.cargarCalendario(); // Recargamos si el jugador confirmó/rechazó
      }
    });
  }
  cargarDatosEquipo() {
    this.equipoService.getEquipoById(this.equipoId).subscribe({
      next: (data) => {
        this.equipo = data;
      },
      error: (err) => console.error('Error al cargar info del equipo', err)
    });
  }

  cargarCalendario() {
    this.loading = true;
  
    this.calendarioService.getCalendarioEquipo(this.equipoId).subscribe({
      next: (data) => {
        console.log('Eventos recibidos del backend:', data);
        console.log(data);
        const eventos = data.map(e => ({
          id: e.id,
          title: e.titulo,
          start: new Date(e.inicio.replace('Z','')),
          end: new Date(e.fin.replace('Z','')),
          allDay: false,          
          className: `tipo-${e.tipo}`
        
        }));
  
        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos
        };
  
        this.loading = false; // 👈 OBLIGATORIO
      },
      error: (err) => {
        console.error('Error cargando calendario', err);
        this.loading = false; // 👈 OBLIGATORIO
      }
    });
  }
  
  

  descargarICal() {
    window.open(this.calendarioService.getICalEquipo(this.equipoId), '_blank');
  }

  abrirModalCrearConvocatoria() {
    // Verificación de seguridad
    if (!this.equipo) {
      alert('Cargando datos del equipo, por favor espera...');
      return;
    }
    
    const ref = this.dialog.open(CreateConvocatoriaModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        jugadoresEquipo: this.equipo.jugadores // Ahora ya no será null
      }
    });

    ref.afterClosed().subscribe(r => {
      if (r) this.cargarCalendario(); // Recargamos el calendario completo
    });
  }

  abrirModalCrearEvento() {
    if (!this.equipo) return;

    const ref = this.dialog.open(CreateEventoModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        jugadoresEquipo: this.equipo.jugadores
      }
    });

    ref.afterClosed().subscribe(refresh => {
      if (refresh) this.cargarCalendario(); // Recargamos el calendario completo
    });
  }
}
