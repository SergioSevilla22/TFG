import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../../../services/club/club.service';
import { TeamService } from '../../../../../services/team/team.service';

@Component({
  selector: 'app-assign-coach-team-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './assign-coach-team-modal.component.html',
  styleUrls: ['./assign-coach-team-modal.component.scss'],
})
export class AssignCoachTeamModalComponent implements OnInit {
  clubCoaches: any[] = [];
  searchQuery = '';

  constructor(
    private dialogRef: MatDialogRef<AssignCoachTeamModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clubId: number; equipoId: number },
    private clubService: ClubService,
    private teamService: TeamService,
  ) {}

  ngOnInit(): void {
    this.loadCoaches();
  }

  loadCoaches() {
    this.clubService.getClubCoaches(this.data.clubId).subscribe({
      next: (res) => (this.clubCoaches = res as any[]),
    });
  }

  get filteredCoaches() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.clubCoaches;
    return this.clubCoaches.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.DNI.toLowerCase().includes(q),
    );
  }

  assign(dni: string) {
    this.teamService.assignCoach(this.data.equipoId, dni).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => alert(err.error?.message || 'Error asignando entrenador'),
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}
