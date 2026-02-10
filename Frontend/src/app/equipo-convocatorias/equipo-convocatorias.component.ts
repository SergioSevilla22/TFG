import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { HeaderComponent } from '../header/header.component';
import { SidebarEquipoComponent } from '../sidebar-equipo/sidebar-equipo.component';

import { AuthService } from '../../services/auth.service';
import { EquipoService } from '../../services/equipos.service';
import { ConvocatoriaService } from '../../services/convocatoria.service';

import { CreateConvocatoriaModalComponent } from '../../shared/components/create-convocatoria-modal/create-convocatoria-modal.component';
import { MotivoModalComponent } from '../../shared/components/motivo-modal/motivo-modal.component';

@Component({
  selector: 'app-equipo-convocatorias',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarEquipoComponent],
  templateUrl: './equipo-convocatorias.component.html',
  styleUrls: ['./equipo-convocatorias.component.css']
})
export class EquipoConvocatoriasComponent implements OnInit {

  equipoId!: number;
  equipo: any = null;

  loading = true;
  loadingConvocatorias = false;

  sinEquipo = false;
  convocatorias: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private equipoService: EquipoService,
    private convocatoriaService: ConvocatoriaService,
    private dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (user?.Rol === 'jugador' && !user.equipo_id) {
      this.sinEquipo = true;
      this.loading = false;
      return;
    }

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
      }
    });
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
        jugadoresEquipo: this.equipo?.jugadores || []
      }
    });

    ref.afterClosed().subscribe(r => {
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
    const u = this.authService.getUser();
    this.convocatoriaService.responderConvocatoria(c.id, {
      jugador_dni: u.DNI,
      estado
    }).subscribe(() => this.cargarConvocatorias());
  }

  abrirModalMotivoConvocatoria(c: any) {
    const ref = this.dialog.open(MotivoModalComponent, {
      width: '400px',
      data: { titulo: 'Motivo de la ausencia' }
    });

    ref.afterClosed().subscribe(motivo => {
      if (!motivo) return;

      this.convocatoriaService.responderConvocatoria(c.id, {
        jugador_dni: this.authService.getUser().DNI,
        estado: 'rechazado',
        motivo
      }).subscribe(() => this.cargarConvocatorias());
    });
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

  convocatoriaCerrada(c: any): boolean {
    if (!c?.fecha_limite_confirmacion) return false;
    return new Date() > new Date(c.fecha_limite_confirmacion);
  }

  estadoLabel(estado: string | null | undefined): string {
    switch (estado) {
      case 'confirmado': return 'Confirmado';
      case 'confirmado_tarde': return 'Confirmado (llega tarde)';
      case 'rechazado': return 'Rechazado';
      case 'pendiente':
      default: return 'Pendiente';
    }
  }
}
