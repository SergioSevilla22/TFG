import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ObservationsService } from '../../../../../services/team/observations.service';

@Component({
  selector: 'app-create-observacion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './create-observation-modal.component.html',
  styleUrls: ['./create-observation-modal.component.scss'],
})
export class CreateObservationModalComponent implements OnInit {
  observationForm: any = {
    titulo: '',
    contenido: '',
    categoria: 'general',
    visibilidad: 'jugador',
  };
  players: any[] = [];
  selected: Set<string> = new Set();
  loading = false;
  message = '';
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<CreateObservationModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { equipoId: number; jugadoresEquipo: any[]; dniIndividual?: string },
    private observationsService: ObservationsService,
  ) {}

  ngOnInit(): void {
    this.players = this.data.jugadoresEquipo || [];
    if (this.data.dniIndividual) {
      this.selected.add(this.data.dniIndividual);
    }
  }

  togglePlayer(dni: string) {
    if (this.selected.has(dni)) this.selected.delete(dni);
    else this.selected.add(dni);
  }

  save() {
    this.submitted = true;

    if (
      !this.observationForm.titulo ||
      !this.observationForm.contenido ||
      this.selected.size === 0
    ) {
      return;
    }

    this.loading = true;
    const payload = {
      ...this.observationForm,
      equipo_id: this.data.equipoId,
      dnis: Array.from(this.selected),
    };

    this.observationsService.create(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.loading = false;
        this.message = err.error?.message || 'Error al guardar';
      },
    });
  }
}
