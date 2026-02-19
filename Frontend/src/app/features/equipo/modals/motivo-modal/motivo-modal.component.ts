import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-motivo-modal',
  templateUrl: './motivo-modal.component.html',
  styleUrls: ['./motivo-modal.component.scss'],
  imports: [MatDialogContent, MatDialogActions,CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule]
})
export class MotivoModalComponent {

  motivo = '';

  constructor(
    public dialogRef: MatDialogRef<MotivoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      titulo: string;
      placeholder?: string;
    }
  ) {}

  confirmar() {
    if (!this.motivo.trim()) return;
    this.dialogRef.close(this.motivo.trim());
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
