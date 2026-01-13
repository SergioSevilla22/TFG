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

  jugadoresDisponibles: any[] = [];
  entrenadoresDisponibles: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipoService: EquipoService,
    private convocatoriaService: ConvocatoriaService,
    private dialog: MatDialog,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.equipoId = Number(this.route.snapshot.paramMap.get('id'));
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

  abrirModalAddJugadores() {
    const dialogRef = this.dialog.open(AddPlayersTeamModalComponent, {
      width: '700px',
      data: {
        equipoId: this.equipoId,
        clubId: this.equipo.club.id
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
      },
      error: () => {
        this.loading = false;
        this.cargarConvocatorias();
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
