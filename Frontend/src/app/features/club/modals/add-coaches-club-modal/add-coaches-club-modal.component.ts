import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../../../services/club/club.service';
import { CoachService } from '../../../../../services/coach/coach.service';

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
  searchResults: any[] = [];
  searchQuery = '';
  errorMessage: string = '';

  constructor(
    private dialogRef: MatDialogRef<AddCoachesClubModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clubId: number },
    private clubService: ClubService,
    private coachService: CoachService,
  ) {}

  search() {
    this.errorMessage = '';
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.coachService.searchCoachesGlobal(this.searchQuery).subscribe({
      next: (res) => (this.searchResults = res as any[]),
    });
  }

  handleCoachAction(coach: any) {
    this.errorMessage = '';

    if (coach.club_id === this.data.clubId) {
      this.clubService.removeClubCoach(this.data.clubId, coach.DNI).subscribe({
        next: () => this.search(),
        error: () => (this.errorMessage = 'Error quitando entrenador del club.'),
      });
      return;
    }

    this.clubService.addClubCoaches(this.data.clubId, [coach.DNI]).subscribe({
      next: () => this.search(),
      error: () => (this.errorMessage = 'Error añadiendo entrenador al club.'),
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}
