import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../../../services/club/club.service';
import { EquipoService } from '../../../../../services/equipo/equipos.service';

@Component({
  selector: 'app-add-players-team-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-players-team-modal.component.html',
  styleUrls: ['./add-players-team-modal.component.scss'],
})
export class AddPlayersTeamModalComponent implements OnInit {
  jugadoresClub: any[] = [];
  busqueda = '';

  constructor(
    private dialogRef: MatDialogRef<AddPlayersTeamModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      equipoId: number;
      clubId: number;
      edadMin: number;
      edadMax: number;
      anioTemporada: number;
    },
    private clubService: ClubService,
    private equipoService: EquipoService,
  ) {}

  ngOnInit(): void {
    this.cargarJugadoresEdadClub();
  }

  cargarJugadoresEdadClub() {
    this.clubService
      .getJugadoresClubCategoria(
        this.data.clubId,
        this.data.anioTemporada,
        this.data.edadMin,
        this.data.edadMax,
      )
      .subscribe({
        next: (res) => (this.jugadoresClub = res),
        error: () => alert('Error cargando jugadores del club'),
      });
  }

  get jugadoresFiltrados() {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) return this.jugadoresClub;

    return this.jugadoresClub.filter(
      (j) => j.nombre.toLowerCase().includes(q) || j.DNI.toLowerCase().includes(q),
    );
  }

  asignarJugador(dni: string) {
    this.equipoService.asignarJugadores(this.data.equipoId, [dni]).subscribe({
      next: () => {
        this.cargarJugadoresEdadClub();
      },
      error: (err) => alert(err.error?.message || 'Error asignando jugador'),
    });
  }

  cerrar() {
    this.dialogRef.close(true);
  }
}
