import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogModule,
} from '@angular/material/dialog';

@Component({
  selector: 'app-motivo-modal',
  templateUrl: './reason-modal.component.html',
  styleUrls: ['./reason-modal.component.scss'],
  imports: [
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
  ],
})
export class ReasonModalComponent {
  reason = '';

  constructor(
    public dialogRef: MatDialogRef<ReasonModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      titulo: string;
      placeholder?: string;
    },
  ) {}

  confirm() {
    if (!this.reason.trim()) return;
    this.dialogRef.close(this.reason.trim());
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
