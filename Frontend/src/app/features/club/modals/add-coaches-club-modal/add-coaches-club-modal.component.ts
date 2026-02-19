import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../../../services/club/club.service';
import { EntrenadorService } from '../../../../../services/entrenador/entrenador.service';

@Component({
  selector: 'app-add-coaches-club-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-coaches-club-modal.component.html',
  styleUrls: ['./add-coaches-club-modal.component.scss'],
})
export class AddCoachesClubModalComponent {
  resultadosBusqueda: any[] = [];
  busqueda = '';

  constructor(
    private dialogRef: MatDialogRef<AddCoachesClubModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clubId: number },
    private clubService: ClubService,
    private entrenadorService: EntrenadorService,
  ) {}

  buscar() {
    if (!this.busqueda.trim()) {
      this.resultadosBusqueda = [];
      return;
    }

    this.entrenadorService.buscarEntrenadoresGlobal(this.busqueda).subscribe({
      next: (res) => (this.resultadosBusqueda = res as any[]),
    });
  }

  accionEntrenador(entrenador: any) {
    if (entrenador.club_id === this.data.clubId) {
      this.clubService.removeEntrenadorClub(this.data.clubId, entrenador.DNI).subscribe({
        next: () => this.buscar(),
        error: () => alert('Error quitando entrenador del club'),
      });
      return;
    }
    this.clubService.addEntrenadoresClub(this.data.clubId, [entrenador.DNI]).subscribe({
      next: () => this.buscar(),
      error: () => alert('Error añadiendo entrenador al club'),
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }
}
