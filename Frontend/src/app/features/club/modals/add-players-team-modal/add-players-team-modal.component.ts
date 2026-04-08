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
  selector: 'app-add-players-team-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-players-team-modal.component.html',
  styleUrls: ['./add-players-team-modal.component.scss'],
})
export class AddPlayersTeamModalComponent implements OnInit {
  clubPlayers: any[] = [];
  searchQuery = '';

  constructor(
    private dialogRef: MatDialogRef<AddPlayersTeamModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      equipoId: number;
      clubId: number;
      edadMin: number;
      edadMax: number;
      anioTemporada: number;
    },
    private clubService: ClubService,
    private teamService: TeamService,
  ) {}

  ngOnInit(): void {
    this.loadClubPlayersByAge();
  }

  loadClubPlayersByAge() {
    this.clubService
      .getClubPlayersByCategory(
        this.data.clubId,
        this.data.anioTemporada,
        this.data.edadMin,
        this.data.edadMax,
      )
      .subscribe({
        next: (res) => (this.clubPlayers = res),
        error: () => alert('Error cargando jugadores del club'),
      });
  }

  get filteredPlayers() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.clubPlayers;

    return this.clubPlayers.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.DNI.toLowerCase().includes(q),
    );
  }

  assignPlayer(dni: string) {
    this.teamService.assignPlayers(this.data.equipoId, [dni]).subscribe({
      next: () => this.loadClubPlayersByAge(),
      error: (err) => alert(err.error?.message || 'Error asignando jugador'),
    });
  }

  close() {
    this.dialogRef.close(true);
  }
}
