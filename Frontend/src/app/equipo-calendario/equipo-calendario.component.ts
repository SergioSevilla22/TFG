import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';


import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { CalendarioService } from '../../services/calendario.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-equipo-calendario',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FullCalendarModule],
  templateUrl: './equipo-calendario.component.html',
  styleUrls: ['./equipo-calendario.component.scss']
})
export class EquipoCalendarioComponent implements OnInit {

  equipoId!: number;
  loading = true;
  isBrowser = false;


  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
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
    }
  };

  constructor(
    private route: ActivatedRoute,
    private calendarioService: CalendarioService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
    if (!this.isBrowser) return;
  
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.equipoId = id;
    this.cargarCalendario();
  }
  
  

  cargarCalendario() {
    this.loading = true;
  
    this.calendarioService.getCalendarioEquipo(this.equipoId).subscribe({
      next: (data) => {
        console.log('Eventos recibidos del backend:', data);
  
        const eventos = data.map(e => ({
          id: e.id,
          title: e.titulo,
          start: e.inicio,
          end: e.fin,
          className: e.tipo
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
  
}
