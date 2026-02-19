import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EquipoService } from '../../../../../services/equipo/equipos.service';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AddPlayersTeamModalComponent } from '../../../club/modals/add-players-team-modal/add-players-team-modal.component';
import { AssignCoachTeamModalComponent } from '../../../club/modals/assign-coach-team-modal/assign-coach-team-modal.component';
import { AuthService } from '../../../../../services/auth/auth.service';
import { ConvocatoriaService } from '../../../../../services/equipo/convocatoria.service';
import { CreateConvocatoriaModalComponent } from '../../modals/create-convocatoria-modal/create-convocatoria-modal.component';
import { EventoService } from '../../../../../services/equipo/evento.service';
import { CreateEventoModalComponent } from '../../modals/create-evento-modal/create-evento-modal.component';
import { MotivoModalComponent } from '../../modals/motivo-modal/motivo-modal.component';
import { SidebarEquipoComponent } from '../sidebar-equipo/sidebar-equipo.component';
import { MiniCalendarioComponent } from '../mini-calendario/mini-calendario.component';

interface Jugador {
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
    SidebarEquipoComponent,
    MiniCalendarioComponent,
    MatIconModule,
  ],
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.css'],
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

  diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipoService: EquipoService,
    private convocatoriaService: ConvocatoriaService,
    private eventoService: EventoService,
    private dialog: MatDialog,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Escuchamos los cambios de parámetros en la URL de forma activa
    this.route.paramMap.subscribe((params) => {
      const user = this.authService.getUser();
      const idParam = params.get('id');
      const id = Number(idParam);

      // 1. Resetear estados para evitar glitches visuales
      this.loading = true;
      this.equipo = null;
      this.sinEquipo = false;

      // 2. Seguridad básica
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      // 3. Validar ID
      if (!idParam || isNaN(id)) {
        this.sinEquipo = true;
        this.loading = false;
        return;
      }

      // 4. 🛡️ SEGURIDAD: Validación por Rol
      if (user.Rol === 'jugador') {
        if (!user.equipo_id) {
          this.sinEquipo = true;
          this.loading = false;
          return;
        }

        if (id !== user.equipo_id) {
          console.warn('Acceso denegado. Redirigiendo a su equipo...');
          this.router.navigate(['/equipo', user.equipo_id]);
          return;
          // Al navegar, el subscribe volverá a saltar con el ID correcto
        }
      }

      // 5. Carga de datos
      this.equipoId = id;
      this.cargarEquipo();
    });
  }

  cargarConvocatorias() {
    this.loadingConvocatorias = true;
    this.convocatoriaService.getConvocatoriasEquipo(this.equipoId).subscribe({
      next: (data) => {
        this.convocatorias = data;
        this.loadingConvocatorias = false;
      },
      error: () => (this.loadingConvocatorias = false),
    });
  }

  abrirModalCrearConvocatoria() {
    const ref = this.dialog.open(CreateConvocatoriaModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        jugadoresEquipo: this.equipo.jugadores,
      },
    });

    ref.afterClosed().subscribe((r) => {
      if (r) this.cargarConvocatorias();
    });
  }

  estaInvitado(item: any): boolean {
    const user = this.authService.getUser();
    if (!user || !item.jugadores) return false;

    // Comprobamos si el DNI del usuario está en el array de jugadores del evento/convocatoria
    return item.jugadores.some((j: any) => j.DNI === user.DNI);
  }
  estadoJugador(c: any) {
    const u = this.authService.getUser();
    return c.jugadores?.find((j: any) => j.DNI === u?.DNI)?.estado;
  }

  responderConvocatoria(c: any, estado: string) {
    const u = this.authService.getUser();
    this.convocatoriaService
      .responderConvocatoria(c.id, {
        jugador_dni: u.DNI,
        estado,
      })
      .subscribe(() => this.cargarConvocatorias());
  }

  enviarRecordatorio(c: any) {
    this.convocatoriaService
      .enviarRecordatorio(c.id)
      .subscribe(() => alert('Recordatorio enviado'));
  }

  contarPorEstado(convocatoria: any, estado: 'confirmado' | 'rechazado' | 'pendiente'): number {
    if (!convocatoria?.jugadores) return 0;
    return convocatoria.jugadores.filter((j: any) => j.estado === estado).length;
  }

  cargarEventos() {
    this.loadingEventos = true;
    this.eventoService.getEventosEquipo(this.equipoId).subscribe({
      next: (data) => {
        this.eventos = data;
        this.loadingEventos = false;
      },
      error: () => (this.loadingEventos = false),
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
        jugadoresEquipo: this.equipo.jugadores,
      },
    });

    ref.afterClosed().subscribe((refresh) => {
      if (refresh) this.cargarEventos();
    });
  }

  responderEvento(e: any, estado: string) {
    this.eventoService
      .responderEvento(e.id, {
        jugador_dni: this.authService.getUser().DNI,
        estado,
      })
      .subscribe({
        next: () => {
          alert('Respuesta registrada');
          this.cargarEventos();
        },
        error: (err) => {
          alert(err.error?.message || 'No se pudo responder');
        },
      });
  }

  contarPorEstadoEvento(evento: any, estado: 'confirmado' | 'rechazado' | 'pendiente'): number {
    if (!evento?.jugadores) return 0;

    return evento.jugadores.filter((j: any) => {
      if (estado === 'confirmado') {
        return j.estado === 'confirmado' || j.estado === 'confirmado_tarde';
      }
      return j.estado === estado;
    }).length;
  }

  eliminarEvento(e: any) {
    if (
      !confirm(
        `¿Estás seguro de eliminar el evento "${e.titulo}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    this.eventoService.eliminarEvento(e.id).subscribe({
      next: () => {
        // Quitar el evento de la lista local
        this.eventos = this.eventos.filter((ev) => ev.id !== e.id);
      },
      error: (err) => {
        console.error('Error al eliminar evento:', err);
        alert('No se pudo eliminar el evento. Revisa la consola para más información.');
      },
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
        alert('Error enviando recordatorio');
      },
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
        anioTemporada: this.equipo.temporada.anio,
      },
    });

    dialogRef.afterClosed().subscribe((refresh) => {
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
        equipoId: this.equipoId,
      },
    });

    dialogRef.afterClosed().subscribe((refresh) => {
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
      },
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
      error: () => alert('Error al asignar entrenador'),
    });
  }

  /* ================================
      ASIGNAR JUGADORES
  =================================*/
  asignarJugador(dni: string) {
    this.equipoService.asignarJugadores(this.equipoId, [dni]).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert('Error al asignar jugador'),
    });
  }

  eliminarJugador(dni: string) {
    this.equipoService.moverJugador(dni, null).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert('Error al eliminar jugador'),
    });
  }

  /* ================================
      DRAG & DROP
  =================================*/
  onDropJugador(event: any) {
    const jugadorDNI = event.dataTransfer.getData('text/dni');

    this.equipoService.moverJugador(jugadorDNI, this.equipoId).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert('Error moviendo jugador'),
    });
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  dragJugador(event: any, dni: string) {
    event.dataTransfer.setData('text/dni', dni);
  }

  eliminarEntrenador(dni: string) {
    this.equipoService.quitarEntrenadorEquipo(dni).subscribe({
      next: () => this.cargarEquipo(),
      error: () => alert('Error al quitar entrenador del equipo'),
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
      case 'confirmado_tarde':
        return 'Confirmado (llega tarde)';
      case 'rechazado':
        return 'Rechazado';
      case 'pendiente':
      default:
        return 'Pendiente';
    }
  }

  abrirModalMotivoConvocatoria(c: any) {
    const ref = this.dialog.open(MotivoModalComponent, {
      width: '400px',
      data: {
        titulo: 'Motivo de la ausencia',
      },
    });

    ref.afterClosed().subscribe((motivo) => {
      if (!motivo) return;

      this.convocatoriaService
        .responderConvocatoria(c.id, {
          jugador_dni: this.authService.getUser().DNI,
          estado: 'rechazado',
          motivo,
        })
        .subscribe(() => this.cargarConvocatorias());
    });
  }

  abrirModalLlegadaTarde(e: any) {
    const ref = this.dialog.open(MotivoModalComponent, {
      width: '400px',
      data: {
        titulo: 'Indica el motivo del retraso',
      },
    });

    ref.afterClosed().subscribe((motivo) => {
      if (!motivo) return;

      this.eventoService
        .responderEvento(e.id, {
          jugador_dni: this.authService.getUser().DNI,
          estado: 'confirmado_tarde',
          motivo,
        })
        .subscribe(() => this.cargarEventos());
    });
  }

  abrirModalMotivoEvento(e: any) {
    const ref = this.dialog.open(MotivoModalComponent, {
      width: '400px',
      data: {
        titulo: 'Motivo de la ausencia',
      },
    });

    ref.afterClosed().subscribe((motivo) => {
      if (!motivo) return;

      this.eventoService
        .responderEvento(e.id, {
          jugador_dni: this.authService.getUser().DNI,
          estado: 'rechazado',
          motivo,
        })
        .subscribe(() => this.cargarEventos());
    });
  }

  hayPendientes(): boolean {
    const u = this.authService.getUser();

    return (
      this.convocatorias.some((c) =>
        c.jugadores?.some((j: any) => j.DNI === u?.DNI && j.estado === 'pendiente'),
      ) ||
      this.eventos.some((e) =>
        e.jugadores?.some((j: any) => j.DNI === u?.DNI && j.estado === 'pendiente'),
      )
    );
  }

  contarConfirmados(): number {
    return this.convocatorias.reduce((acc, c) => acc + this.contarPorEstado(c, 'confirmado'), 0);
  }

  contarPendientes(): number {
    return this.convocatorias.reduce((acc, c) => acc + this.contarPorEstado(c, 'pendiente'), 0);
  }

  contarRechazados(): number {
    return this.convocatorias.reduce((acc, c) => acc + this.contarPorEstado(c, 'rechazado'), 0);
  }

  get jugadoresPreview(): Jugador[] {
    if (!this.equipo?.jugadores) return [];
    return this.equipo.jugadores.slice(0, 10);
  }

  get jugadoresExtra(): number {
    if (!this.equipo?.jugadores) return 0;
    return Math.max(this.equipo.jugadores.length - 8, 0);
  }

  get proximoEvento() {
    const ahora = new Date();
    return this.eventos
      .filter((e) => new Date(e.fecha_inicio) > ahora)
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())[0];
  }

  get proximaConvocatoria() {
    const ahora = new Date();
    return this.convocatorias
      .filter((c) => new Date(c.fecha_partido) > ahora)
      .sort((a, b) => new Date(a.fecha_partido).getTime() - new Date(b.fecha_partido).getTime())[0];
  }

  hayEventosPendientes(): boolean {
    if (!this.authService.hasRole('jugador')) return false;
    return this.eventos.some(
      (e) =>
        e.requiere_confirmacion &&
        this.estaInvitado(e) &&
        this.estadoJugadorEvento(e) === 'pendiente',
    );
  }

  hayConvocatoriasPendientes(): boolean {
    if (!this.authService.hasRole('jugador')) return false;
    return this.convocatorias.some(
      (c) =>
        this.estaInvitado(c) &&
        this.estadoJugador(c) === 'pendiente' &&
        !this.convocatoriaCerrada(c),
    );
  }
}
