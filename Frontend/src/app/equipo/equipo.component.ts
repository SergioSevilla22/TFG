import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { EquipoService } from '../../services/equipos.service';
import { HeaderComponent } from '../header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { AddPlayersTeamModalComponent } from
  '../../shared/components/add-players-team-modal/add-players-team-modal.component';

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

  jugadoresDisponibles: any[] = [];
  entrenadoresDisponibles: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipoService: EquipoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.equipoId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarEquipo();
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

  cargarEquipo() {
    this.loading = true;

    this.equipoService.getEquipoById(this.equipoId).subscribe({
      next: (data) => {
        this.equipo = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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
}
