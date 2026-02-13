import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { HeaderComponent } from '../header/header.component';
import { SidebarEquipoComponent } from '../sidebar-equipo/sidebar-equipo.component';

import { EquipoService } from '../../services/equipos.service';
import { EventoService } from '../../services/evento.service';
import { AuthService } from '../../services/auth.service';

import { CreateEventoModalComponent } from
  '../../shared/components/create-evento-modal/create-evento-modal.component';
import { MotivoModalComponent } from
  '../../shared/components/motivo-modal/motivo-modal.component';
  import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-equipo-eventos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarEquipoComponent,MatTooltipModule
  ],
  templateUrl: './equipo-eventos.component.html',
  styleUrls: ['./equipo-eventos.component.css']
})
export class EquipoEventosComponent implements OnInit {

  // ======================
  // ESTADO GENERAL
  // ======================
  equipoId!: number;
  equipo: any = null;

  eventos: any[] = [];
  loadingEventos = false;

  sinEquipo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipoService: EquipoService,
    private eventoService: EventoService,
    private dialog: MatDialog,
    public authService: AuthService
  ) {}

  // ======================
  // INIT
  // ======================
  ngOnInit(): void {
    const user = this.authService.getUser();

    // 🧑‍🦱 Jugador sin equipo
    if (user?.Rol === 'jugador' && !user.equipo_id) {
      this.sinEquipo = true;
      return;
    }

    // 📌 ID equipo desde URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.sinEquipo = true;
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.sinEquipo = true;
      return;
    }

    this.equipoId = id;
    this.cargarEquipo();
  }

  // ======================
  // CARGA DE DATOS
  // ======================
  cargarEquipo() {
    this.equipoService.getEquipoById(this.equipoId).subscribe({
      next: data => {
        this.equipo = data;
        this.cargarEventos();
      },
      error: () => {
        alert('No se pudo cargar el equipo');
      }
    });
  }

  cargarEventos() {
    this.loadingEventos = true;

    this.eventoService.getEventosEquipo(this.equipoId).subscribe({
      next: data => {
        this.eventos = data;
        this.loadingEventos = false;
      },
      error: () => {
        this.loadingEventos = false;
        alert('Error cargando eventos');
      }
    });
  }

  // ======================
  // EVENTOS – ACCIONES
  // ======================
  abrirModalCrearEvento() {
    const ref = this.dialog.open(CreateEventoModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        jugadoresEquipo: this.equipo.jugadores
      }
    });

    ref.afterClosed().subscribe(refresh => {
      if (refresh) {
        this.cargarEventos();
      }
    });
  }

  eliminarEvento(e: any) {
    if (!confirm(`¿Eliminar el evento "${e.titulo}"?`)) return;

    this.eventoService.eliminarEvento(e.id).subscribe({
      next: () => {
        this.eventos = this.eventos.filter(ev => ev.id !== e.id);
      },
      error: () => alert('No se pudo eliminar el evento')
    });
  }

  enviarRecordatorioEvento(e: any) {
    this.eventoService.enviarRecordatorio(e.id).subscribe({
      next: () => alert('Recordatorio enviado'),
      error: () => alert('Error enviando recordatorio')
    });
  }

  // ======================
  // RESPUESTAS JUGADOR
  // ======================
  estaInvitado(evento: any): boolean {
    const user = this.authService.getUser();
    return evento.jugadores?.some((j: any) => j.DNI === user?.DNI);
  }

  estadoJugadorEvento(evento: any) {
    const user = this.authService.getUser();
    return evento.jugadores?.find((j: any) => j.DNI === user?.DNI)?.estado;
  }

  responderEvento(evento: any, estado: string) {
    const user = this.authService.getUser();

    this.eventoService.responderEvento(evento.id, {
      jugador_dni: user.DNI,
      estado
    }).subscribe({
      next: () => this.cargarEventos(),
      error: err => alert(err.error?.message || 'No se pudo responder')
    });
  }

  abrirModalLlegadaTarde(evento: any) {
    const ref = this.dialog.open(MotivoModalComponent, {
      width: '400px',
      data: { titulo: 'Motivo del retraso' }
    });

    ref.afterClosed().subscribe(motivo => {
      if (!motivo) return;

      this.eventoService.responderEvento(evento.id, {
        jugador_dni: this.authService.getUser().DNI,
        estado: 'confirmado_tarde',
        motivo
      }).subscribe(() => this.cargarEventos());
    });
  }

  abrirModalMotivoEvento(evento: any) {
    const ref = this.dialog.open(MotivoModalComponent, {
      width: '400px',
      data: { titulo: 'Motivo de la ausencia' }
    });

    ref.afterClosed().subscribe(motivo => {
      if (!motivo) return;

      this.eventoService.responderEvento(evento.id, {
        jugador_dni: this.authService.getUser().DNI,
        estado: 'rechazado',
        motivo
      }).subscribe(() => this.cargarEventos());
    });
  }

  // ======================
  // UTILIDADES
  // ======================
  esEventoPasado(e: any): boolean {
    return new Date(e.fecha_inicio) < new Date();
  }

  contarPorEstadoEvento(
    evento: any,
    estado: 'confirmado' | 'rechazado' | 'pendiente'
  ): number {
    if (!evento?.jugadores) return 0;

    return evento.jugadores.filter((j: any) => {
      if (estado === 'confirmado') {
        return j.estado === 'confirmado' || j.estado === 'confirmado_tarde';
      }
      return j.estado === estado;
    }).length;
  }

  abrirEditarEvento(e: any) {

    const ref = this.dialog.open(CreateEventoModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        jugadoresEquipo: this.equipo.jugadores,
        evento: e // 👈 clave
      }
    });
  
    ref.afterClosed().subscribe(refresh => {
      if (refresh) this.cargarEventos();
    });
  }
  
}
