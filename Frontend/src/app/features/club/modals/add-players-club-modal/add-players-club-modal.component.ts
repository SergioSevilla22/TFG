import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../../../services/club/club.service';
import { PlayerService } from '../../../../../services/player/player.service';

@Component({
  selector: 'app-add-players-club-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-players-club-modal.component.html',
  styleUrls: ['./add-players-club-modal.component.scss'],
})
export class AddPlayersClubModalComponent implements OnInit {
  clubPlayers: any[] = [];
  searchResults: any[] = [];
  searchQuery = '';
  selection = new Set<string>();
  errorMessage: string = '';

  constructor(
    private dialogRef: MatDialogRef<AddPlayersClubModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clubId: number },
    private clubService: ClubService,
    private playerService: PlayerService,
  ) {}

  ngOnInit(): void {
    this.loadClubPlayers();
  }

  loadClubPlayers() {
    this.clubService.getClubPlayers(this.data.clubId).subscribe({
      next: (res) => (this.clubPlayers = res),
    });
  }

  search() {
    this.errorMessage = '';
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.playerService.searchPlayersGlobal(this.searchQuery).subscribe({
      next: (res) => (this.searchResults = res),
    });
  }

  toggle(dni: string) {
    this.selection.has(dni) ? this.selection.delete(dni) : this.selection.add(dni);
  }

  handlePlayerAction(player: any) {
    this.errorMessage = '';

    if (player.club_id === this.data.clubId) {
      this.clubService.removeClubPlayer(this.data.clubId, player.DNI).subscribe({
        next: () => this.search(),
        error: () => (this.errorMessage = 'Error quitando jugador del club.'),
      });
      return;
    }

    this.clubService.addClubPlayers(this.data.clubId, [player.DNI]).subscribe({
      next: () => this.search(),
      error: () => (this.errorMessage = 'Error añadiendo jugador al club.'),
    });
  }

  close() {
    this.dialogRef.close(false);
  }

  remove(dni: string) {
    this.clubService.removeClubPlayer(this.data.clubId, dni).subscribe({
      next: () => this.loadClubPlayers(),
    });
  }
}
