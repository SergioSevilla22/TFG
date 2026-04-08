import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../../../services/club/club.service';
import { UserService } from '../../../../../services/user/user.service';

@Component({
  selector: 'app-transfer-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './transfer-user-modal.component.html',
  styleUrls: ['./transfer-user-modal.component.scss'],
})
export class TransferUserModalComponent implements OnInit {
  userType: 'jugador' | 'entrenador' = 'jugador';

  users: any[] = [];
  selectedUser: any = null;

  clubs: any[] = [];
  targetClubId: number | null = null;

  constructor(
    private dialogRef: MatDialogRef<TransferUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clubId: number },
    private clubService: ClubService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadClubs();
    this.loadUsers();
  }

  changeType(type: 'jugador' | 'entrenador') {
    this.userType = type;
    this.selectedUser = null;
    this.targetClubId = null;
    this.loadUsers();
  }

  loadUsers() {
    if (this.userType === 'jugador') {
      this.clubService.getClubPlayers(this.data.clubId).subscribe((res) => (this.users = res));
    } else {
      this.clubService.getClubCoaches(this.data.clubId).subscribe((res) => (this.users = res));
    }
  }

  loadClubs() {
    this.clubService.getClubs().subscribe((res) => {
      this.clubs = res.filter((c) => c.id !== this.data.clubId);
    });
  }

  select(user: any) {
    this.selectedUser = user;
    this.targetClubId = null;
  }

  transfer() {
    if (!this.selectedUser || !this.targetClubId) return;

    this.userService.transferUser(this.selectedUser.DNI, this.targetClubId).subscribe({
      next: () => {
        this.selectedUser = null;
        this.loadUsers();
      },
      error: () => alert('Error al traspasar usuario'),
    });
  }

  delete() {
    if (!confirm('¿Seguro que quieres eliminar este usuario de la plataforma?')) {
      return;
    }

    this.userService.deleteUser(this.selectedUser.DNI).subscribe({
      next: () => {
        this.selectedUser = null;
        this.loadUsers();
      },
      error: () => alert('Error eliminando usuario'),
    });
  }

  close() {
    this.dialogRef.close(true);
  }
}
