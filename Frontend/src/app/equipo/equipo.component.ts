import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EquipoService } from '../../services/equipos.service';
import { HeaderComponent } from '../header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { AddPlayersTeamModalComponent } from
  '../../shared/components/add-players-team-modal/add-players-team-modal.component';
import { AssignCoachTeamModalComponent } from '../../shared/components/assign-coach-team-modal/assign-coach-team-modal.component';
import { AuthService } from '../../services/auth.service';
import { ConvocatoriaService } from '../../services/convocatoria.service';
import { CreateConvocatoriaModalComponent } from '../../shared/components/create-convocatoria-modal/create-convocatoria-modal.component';
import { EventoService } from '../../services/evento.service';
import { CreateEventoModalComponent } from '../../shared/components/create-evento-modal/create-evento-modal.component';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.css']
})
export class EquipoComponent implements OnInit {

  equipoId!: number;
  equipo: any = null;
  loading = true;
  esAdmin = false;
  esEntrenador = false;
  esJugador = false;
  convocatorias: any[] = [];
  loadingConvocatorias = false;
  eventos: any[] = [];
  loadingEventos = false;
  sinEquipo = false;

  jugadoresDisponibles: any[] = [];
  entrenadoresDisponibles: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipoService: EquipoService,
    private convocatoriaService: ConvocatoriaService,
    private eventoService: EventoService,
    private dialog: MatDialog,
    public authService: AuthService
    
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
  
    // 🧑‍🦱 JUGADOR SIN EQUIPO
    if (user?.Rol === 'jugador' && !user.equipo_id) {
      this.sinEquipo = true;
      this.loading = false;
      return;
    }
  
    // 🔗 Equipo por URL
    const idParam = this.route.snapshot.paramMap.get('id');
  
    if (!idParam) {
      this.sinEquipo = true;
      this.loading = false;
      return;
    }
  
    const id = Number(idParam);
  
    if (isNaN(id)) {
      this.sinEquipo = true;
      this.loading = false;
      return;
    }
  
    this.equipoId = id;
    this.cargarEquipo();
  }
  

  cargarConvocatorias() {
    this.loadingConvocatorias = true;
    this.convocatoriaService.getConvocatoriasEquipo(this.equipoId).subscribe({
      next: data => {
        this.convocatorias = data;
        this.loadingConvocatorias = false;
      },
      error: () => this.loadingConvocatorias = false
    });
  }

  abrirModalCrearConvocatoria() {
    const ref = this.dialog.open(CreateConvocatoriaModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        jugadoresEquipo: this.equipo.jugadores
      }
    });
  
    ref.afterClosed().subscribe(r => {
      if (r) this.cargarConvocatorias();
    });
  }

  estadoJugador(c: any) {
    const u = this.authService.getUser();
    return c.jugadores?.find((j: any) => j.DNI === u?.DNI)?.estado;
  }
  
  responderConvocatoria(c: any, estado: string) {
    const u = this.authService.getUser();
    this.convocatoriaService.responderConvocatoria(c.id, {
      jugador_dni: u.DNI,
      estado
    }).subscribe(() => this.cargarConvocatorias());
  }
  
  enviarRecordatorio(c: any) {
    this.convocatoriaService.enviarRecordatorio(c.id).subscribe(() =>
      alert('Recordatorio enviado')
    );
  }

  contarPorEstado(convocatoria: any, estado: 'confirmado' | 'rechazado' | 'pendiente'): number {
    if (!convocatoria?.jugadores) return 0;
    return convocatoria.jugadores.filter((j: any) => j.estado === estado).length;
  }

  cargarEventos() {
    this.loadingEventos = true;
    this.eventoService.getEventosEquipo(this.equipoId).subscribe({
      next: data => { this.eventos = data; this.loadingEventos = false; },
      error: () => this.loadingEventos = false
    });
  }

  estadoJugadorEvento(e: any) {
    const u = this.authService.getUser();
    return e.jugadores?.find((j: any) => j.DNI === u?.DNI)?.estado;
  }

  abrirModalCrearEvento() {
    const ref = this.dialog.open(CreateEventoModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        jugadoresEquipo: this.equipo.jugadores
      }
    });

    ref.afterClosed().subscribe(refresh => {
      if (refresh) this.cargarEventos();
    });
  }

  responderEvento(e: any, estado: string) {
    this.eventoService.responderEvento(e.id, {
      jugador_dni: this.authService.getUser().DNI,
      estado
    }).subscribe({
      next: () => {
        alert('Respuesta registrada');
        this.cargarEventos();
      },
      error: err => {
        alert(err.error?.message || 'No se pudo responder');
      }
    });
  }



  contarPorEstadoEvento(evento: any, estado: 'confirmado' | 'rechazado' | 'pendiente'): number {
    if (!evento?.jugadores) return 0;
    return evento.jugadores.filter((j: any) => j.estado === estado).length;
  }

  eliminarEvento(e: any) {
    if (!confirm(`¿Estás seguro de eliminar el evento "${e.titulo}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.eventoService.eliminarEvento(e.id).subscribe({
      next: () => {
        // Quitar el evento de la lista local
        this.eventos = this.eventos.filter(ev => ev.id !== e.id);
      },
      error: (err) => {
        console.error("Error al eliminar evento:", err);
        alert("No se pudo eliminar el evento. Revisa la consola para más información.");
      }
    });
  }

  // evento.component.ts
  enviarRecordatorioEvento(evento: any) {
    this.eventoService.enviarRecordatorio(evento.id).subscribe({
      next: () => {
        alert('Recordatorio enviado'); // mensaje de éxito
      },
      error: (err) => {
        console.error(err);
        alert("Error enviando recordatorio");
      }
    });
  }

  abrirModalAddJugadores() {

    const dialogRef = this.dialog.open(AddPlayersTeamModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        clubId: this.equipo.club.id,
        edadMin: this.equipo.categoria.edadMin,
        edadMax: this.equipo.categoria.edadMax,
        anioTemporada: this.equipo.temporada.anio
      }
    });
  
    dialogRef.afterClosed().subscribe(refresh => {
      if (refresh) {
        this.cargarEquipo();
      }
    });
  }

  abrirModalEntrenadorEquipo() {
    const dialogRef = this.dialog.open(AssignCoachTeamModalComponent, {
      width: '700px',
      data: {
        clubId: this.equipo.club.id,
        equipoId: this.equipoId
      }
    });
  
    dialogRef.afterClosed().subscribe(refresh => {
      if (refresh) this.cargarEquipo();
    });
  }

  cargarEquipo() {
    this.loading = true;

    this.equipoService.getEquipoById(this.equipoId).subscribe({
      next: (data) => {
        this.equipo = data;
        this.loading = false;
        this.cargarConvocatorias();
        this.cargarEventos();

      },
      error: () => {
        this.loading = false;
        this.cargarConvocatorias();
        this.cargarEventos();

        alert('No se pudo cargar el equipo');
      }
    });
  }

  volverAlClub() {
    this.router.navigate(['/club', this.equipo.club.id]);
  }

  /* ================================
      ASIGNAR ENTRENADOR
  =================================*/
  asignarEntrenador(dni: string) {
    this.equipoService.asignarEntrenador(this.equipoId, dni).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert("Error al asignar entrenador")
    });
  }

  /* ================================
      ASIGNAR JUGADORES
  =================================*/
  asignarJugador(dni: string) {
    this.equipoService.asignarJugadores(this.equipoId, [dni]).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert("Error al asignar jugador")
    });
  }

  eliminarJugador(dni: string) {
    this.equipoService.moverJugador(dni, null).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert("Error al eliminar jugador")
    });
  }

  /* ================================
      DRAG & DROP
  =================================*/
  onDropJugador(event: any) {
    const jugadorDNI = event.dataTransfer.getData("text/dni");

    this.equipoService.moverJugador(jugadorDNI, this.equipoId).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert("Error moviendo jugador")
    });
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  dragJugador(event: any, dni: string) {
    event.dataTransfer.setData("text/dni", dni);
  }

  eliminarEntrenador(dni: string) {
    this.equipoService.quitarEntrenadorEquipo(dni).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert('Error al quitar entrenador del equipo')
    });
  }

  esEventoPasado(e: any): boolean {
    return new Date(e.fecha_inicio) < new Date();
  }
  convocatoriaCerrada(c: any): boolean {
    if (!c?.fecha_limite_confirmacion) return false;
    return new Date() > new Date(c.fecha_limite_confirmacion);
  }

  estadoLabel(estado: string | null | undefined): string {
    switch (estado) {
      case 'confirmado':
        return 'Confirmado';
      case 'rechazado':
        return 'Rechazado';
      case 'sin_respuesta':
        return 'Sin respuesta';
      case 'pendiente':
      default:
        return 'Pendiente';
    }
  }
  
}
