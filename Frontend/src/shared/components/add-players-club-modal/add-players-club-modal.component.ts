import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../services/club.service';
import { JugadorService } from '../../../services/jugador.service';

@Component({
  selector: 'app-add-players-club-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './add-players-club-modal.component.html',
  styleUrls: ['./add-players-club-modal.component.scss']
})
export class AddPlayersClubModalComponent implements OnInit {

  jugadoresClub: any[] = [];
  resultadosBusqueda: any[] = [];
  busqueda = '';
  seleccion = new Set<string>();

  constructor(
    private dialogRef: MatDialogRef<AddPlayersClubModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clubId: number },
    private clubService: ClubService,
    private jugadorService: JugadorService
  ) {}

  ngOnInit(): void {
    this.cargarJugadoresClub();
  }

  cargarJugadoresClub() {
    this.clubService.getJugadoresClub(this.data.clubId).subscribe({
      next: res => this.jugadoresClub = res
    });
  }

  buscar() {
    if (!this.busqueda.trim()) {
      this.resultadosBusqueda = [];
      return;
    }

    this.jugadorService.buscarJugadoresGlobal(this.busqueda).subscribe({
      next: res => this.resultadosBusqueda = res
    });
  }

  toggle(dni: string) {
    this.seleccion.has(dni)
      ? this.seleccion.delete(dni)
      : this.seleccion.add(dni);
  }

  confirmar() {
    const jugadores = Array.from(this.seleccion);
    if (jugadores.length === 0) return;

    this.clubService.addJugadoresClub(this.data.clubId, jugadores).subscribe({
      next: () => this.dialogRef.close(true)
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }

  quitar(dni: string) {
    this.clubService.removeJugadorClub(this.data.clubId, dni).subscribe({
      next: () => this.cargarJugadoresClub()
    });
  }
}
