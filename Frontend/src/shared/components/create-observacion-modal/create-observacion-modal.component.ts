import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ObservacionesService } from '../../../services/observaciones.service';

@Component({
  selector: 'app-create-observacion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './create-observacion-modal.component.html',
  styleUrls: ['./create-observacion-modal.component.scss']
})
export class CreateObservacionModalComponent implements OnInit {
  obs: any = { titulo: '', contenido: '', categoria: 'general', visibilidad: 'jugador' };
  jugadores: any[] = [];
  seleccionados: Set<string> = new Set();
  loading = false;
  mensaje = '';

  constructor(
    public dialogRef: MatDialogRef<CreateObservacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { equipoId: number; jugadoresEquipo: any[]; dniIndividual?: string },
    private obsService: ObservacionesService
  ) {}

  ngOnInit(): void {
    this.jugadores = this.data.jugadoresEquipo || [];
    if (this.data.dniIndividual) {
      this.seleccionados.add(this.data.dniIndividual);
    }
  }

  toggleJugador(dni: string) {
    if (this.seleccionados.has(dni)) this.seleccionados.delete(dni);
    else this.seleccionados.add(dni);
  }

  guardar() {
    if (!this.obs.titulo || !this.obs.contenido || this.seleccionados.size === 0) {
      this.mensaje = 'Rellena los campos y selecciona al menos un jugador';
      return;
    }

    this.loading = true;
    const payload = { ...this.obs, equipo_id: this.data.equipoId, dnis: Array.from(this.seleccionados) };

    this.obsService.crear(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.loading = false;
        this.mensaje = err.error?.message || 'Error al guardar';
      }
    });
  }
}