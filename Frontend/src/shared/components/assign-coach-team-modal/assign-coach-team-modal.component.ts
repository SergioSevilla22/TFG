import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../services/club.service';
import { EquipoService } from '../../../services/equipos.service';

@Component({
  selector: 'app-assign-coach-team-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './assign-coach-team-modal.component.html',
  styleUrls: ['./assign-coach-team-modal.component.scss']
})
export class AssignCoachTeamModalComponent implements OnInit {

  entrenadoresClub: any[] = [];
  busqueda = '';

  constructor(
    private dialogRef: MatDialogRef<AssignCoachTeamModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clubId: number; equipoId: number },
    private clubService: ClubService,
    private equipoService: EquipoService
  ) {}

  ngOnInit(): void {
    this.cargarEntrenadores();
  }

  cargarEntrenadores() {
    this.clubService.getEntrenadoresClub(this.data.clubId).subscribe({
      next: res => this.entrenadoresClub = res as any[]
    });
  }

  get entrenadoresFiltrados() {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) return this.entrenadoresClub;
    return this.entrenadoresClub.filter(e =>
      e.nombre.toLowerCase().includes(q) || e.DNI.toLowerCase().includes(q)
    );
  }

  asignar(dni: string) {
    this.equipoService.asignarEntrenador(this.data.equipoId, dni).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => alert(err.error?.message || 'Error asignando entrenador')
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}
