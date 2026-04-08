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
import { PerformanceService } from '../../../../../services/player/performance.service';

@Component({
  selector: 'app-load-rendimiento-modal',
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
  templateUrl: './load-rendimiento-modal.component.html',
  styleUrls: ['./load-rendimiento-modal.component.scss'],
})
export class LoadRendimientoModalComponent implements OnInit {
  players: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private performanceService: PerformanceService,
    private dialogRef: MatDialogRef<LoadRendimientoModalComponent>,
  ) {}

  ngOnInit() {
    this.players = this.data.jugadores.map((j: any) => ({
      jugador_dni: j.DNI,
      nombre: j.nombre,
      foto: j.foto,
      estado_asistencia: 'presente',
      nota_general: 0,
      intensidad: 0,
      actitud: 0,
      observaciones: '',
    }));

    this.performanceService.getPerformance(this.data.eventoId).subscribe((existing) => {
      existing.forEach((r: any) => {
        const player = this.players.find((p) => p.jugador_dni === r.jugador_dni);
        if (player) Object.assign(player, r);
      });
    });
  }

  save() {
    this.performanceService
      .savePerformance(this.data.eventoId, this.players)
      .subscribe(() => this.dialogRef.close(true));
  }

  close(refresh = false) {
    this.dialogRef.close(refresh);
  }

  clampNumber(obj: any, field: string, min: number, max: number) {
    if (obj[field] === null || obj[field] === undefined) return;
    if (obj[field] < min) obj[field] = min;
    if (obj[field] > max) obj[field] = max;
  }
}
