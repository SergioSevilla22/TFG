import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { HeaderComponent } from '../../../../layout/header/header.component';
import { SidebarEquipoComponent } from '../sidebar-equipo/sidebar-equipo.component';

import { AuthService } from '../../../../../services/auth/auth.service';
import { EquipoService } from '../../../../../services/equipo/equipos.service';
import { ConvocatoriaService } from '../../../../../services/equipo/convocatoria.service';

import { CreateConvocatoriaModalComponent } from '../../modals/create-convocatoria-modal/create-convocatoria-modal.component';
import { MotivoModalComponent } from '../../modals/motivo-modal/motivo-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadEstadisticasModalComponent } from '../../modals/load-estadisticas-modal/load-estadisticas-modal.component';
import { EstadisticasService } from '../../../../../services/jugador/estadisticas.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-equipo-convocatorias',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarEquipoComponent,
    MatTooltipModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './equipo-convocatorias.component.html',
  styleUrls: ['./equipo-convocatorias.component.css'],
})
export class EquipoConvocatoriasComponent implements OnInit {
  equipoId!: number;
  equipo: any = null;

  loading = true;
  loadingConvocatorias = false;

  sinEquipo = false;
  convocatorias: any[] = [];
  estadisticasJugador: { [key: number]: any } = {};
  statsAbiertas: { [key: number]: boolean } = {};

  filtroEstado: 'todas' | 'abiertas' | 'cerradas' = 'todas';
  filtroMes: number | null = null;
  filtroAnio: number | null = new Date().getFullYear();
  filtroTexto: string = '';

  paginaActual = 1;
  itemsPorPagina = 5;

  constructor(
    private route: ActivatedRoute,
    private equipoService: EquipoService,
    private convocatoriaService: ConvocatoriaService,
    private dialog: MatDialog,
    public authService: AuthService,
    private estadisticasService: EstadisticasService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (user?.Rol === 'jugador' && !user.equipo_id) {
      this.sinEquipo = true;
      this.loading = false;
      return;
    }

    const idParam = this.route.parent?.snapshot.paramMap.get('id');
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

  cargarEquipo() {
    this.loading = true;

    this.equipoService.getEquipoById(this.equipoId).subscribe({
      next: (data) => {
        this.equipo = data;
        this.loading = false;
        this.cargarConvocatorias();
      },
      error: () => {
        this.loading = false;
        alert('No se pudo cargar el equipo');
      },
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
        jugadoresEquipo: this.equipo?.jugadores || [],
      },
    });

    ref.afterClosed().subscribe((r) => {
      if (r) this.cargarConvocatorias();
    });
  }

  estaInvitado(item: any): boolean {
    const user = this.authService.getUser();
    if (!user || !item.jugadores) return false;
    return item.jugadores.some((j: any) => j.DNI === user.DNI);
  }

  estadoJugador(c: any) {
    const u = this.authService.getUser();
    return c.jugadores?.find((j: any) => j.DNI === u?.DNI)?.estado;
  }

  responderConvocatoria(c: any, estado: string) {
    console.log('Convocatoria:', c);
    const u = this.authService.getUser();
    this.convocatoriaService
      .responderConvocatoria(c.id, {
        jugador_dni: u.DNI,
        estado,
      })
      .subscribe(() => this.cargarConvocatorias());
  }

  abrirModalMotivoConvocatoria(c: any) {
    const ref = this.dialog.open(MotivoModalComponent, {
      width: '400px',
      data: { titulo: 'Motivo de la ausencia' },
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

  enviarRecordatorio(c: any) {
    this.convocatoriaService
      .enviarRecordatorio(c.id)
      .subscribe(() => alert('Recordatorio enviado'));
  }

  contarPorEstado(convocatoria: any, estado: 'confirmado' | 'rechazado' | 'pendiente'): number {
    if (!convocatoria?.jugadores) return 0;
    return convocatoria.jugadores.filter((j: any) => j.estado === estado).length;
  }

  convocatoriaCerrada(c: any): boolean {
    if (!c.fecha_limite_confirmacion) return false;

    const ahora = new Date();
    const limite = new Date(c.fecha_limite_confirmacion);

    return ahora > limite;
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

  abrirEditarConvocatoria(c: any) {
    const ref = this.dialog.open(CreateConvocatoriaModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        jugadoresEquipo: this.equipo?.jugadores || [],
        convocatoria: c,
      },
    });

    ref.afterClosed().subscribe((r) => {
      if (r) this.cargarConvocatorias();
    });
  }

  abrirModalEstadisticas(c: any) {
    const ref = this.dialog.open(LoadEstadisticasModalComponent, {
      width: '1100px',
      maxWidth: '98vw',
      height: 'auto',
      autoFocus: false,
      panelClass: 'stats-dialog',
      data: {
        convocatoriaId: c.id,
        jugadores: c.jugadores,
      },
    });
    console.log(c.jugadores);
    ref.afterClosed().subscribe();
  }

  toggleEstadisticasJugador(convocatoriaId: number) {
    const user = this.authService.getUser();

    if (this.statsAbiertas[convocatoriaId]) {
      this.statsAbiertas[convocatoriaId] = false;
      return;
    }

    if (!this.estadisticasJugador[convocatoriaId]) {
      this.estadisticasService
        .getEstadisticasJugadorConvocatoria(convocatoriaId, user.DNI)
        .subscribe((data) => {
          this.estadisticasJugador[convocatoriaId] = data;
          this.statsAbiertas[convocatoriaId] = true;
        });
    } else {
      this.statsAbiertas[convocatoriaId] = true;
    }
  }

  get convocatoriasFiltradas() {
    let data = [...this.convocatorias];

    if (this.filtroEstado === 'abiertas') {
      data = data.filter((c) => !this.convocatoriaCerrada(c));
    }

    if (this.filtroEstado === 'cerradas') {
      data = data.filter((c) => this.convocatoriaCerrada(c));
    }

    if (this.filtroMes !== null) {
      data = data.filter((c) => {
        const fecha = new Date(c.fecha_partido);
        return fecha.getMonth() === this.filtroMes;
      });
    }

    if (this.filtroAnio) {
      data = data.filter((c) => {
        const fecha = new Date(c.fecha_partido);
        return fecha.getFullYear() === this.filtroAnio;
      });
    }

    if (this.filtroTexto.trim()) {
      data = data.filter((c) => c.rival?.toLowerCase().includes(this.filtroTexto.toLowerCase()));
    }

    return data;
  }

  get totalPaginas() {
    return Math.ceil(this.convocatoriasFiltradas.length / this.itemsPorPagina);
  }

  get convocatoriasPaginadas() {
    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.convocatoriasFiltradas.slice(start, start + this.itemsPorPagina);
  }

  cambiarPagina(p: number) {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
    }
  }
}
