import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { StatsService } from '../../../../../services/player/stats.service';

@Component({
  selector: 'app-load-estadisticas-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogActions,
    MatIcon,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './load-stats-modal.component.html',
  styleUrls: ['./load-stats-modal.component.scss'],
})
export class LoadStatsModalComponent implements OnInit {
  players: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private statsService: StatsService,
    private dialogRef: MatDialogRef<LoadStatsModalComponent>,
  ) {}

  ngOnInit() {
    this.players = this.data.jugadores.map((j: any) => {
      let attendanceStatus = 'presente';

      switch (j.estado) {
        case 'confirmado':
          attendanceStatus = 'presente';
          break;
        case 'confirmado_tarde':
          attendanceStatus = 'tarde';
          break;
        case 'rechazado':
          attendanceStatus = 'ausente';
          break;
        case 'pendiente':
        default:
          attendanceStatus = 'ausente';
      }

      return {
        jugador_dni: j.DNI,
        nombre: j.nombre,
        foto: j.foto,
        estado_convocatoria: j.estado,
        estado_asistencia: attendanceStatus,
        minutos: 0,
        goles: 0,
        asistencias: 0,
        amarillas: 0,
        rojas: 0,
      };
    });

    this.statsService.getMatchCallStats(this.data.convocatoriaId).subscribe((existing) => {
      existing.forEach((s: any) => {
        const player = this.players.find((p) => p.jugador_dni === s.jugador_dni);
        if (player) Object.assign(player, s);
      });
    });
  }

  save() {
    this.statsService
      .saveMatchCallStats(this.data.convocatoriaId, this.players)
      .subscribe(() => this.dialogRef.close(true));
  }

  close(refresh = false) {
    this.dialogRef.close(refresh);
  }
}
