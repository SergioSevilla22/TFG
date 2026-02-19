import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { ClubService } from '../../../../../services/club/club.service';
import { UsuarioService } from '../../../../../services/usuario/usuario.service';

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
  tipoUsuario: 'jugador' | 'entrenador' = 'jugador';

  usuarios: any[] = [];
  usuarioSeleccionado: any = null;

  clubes: any[] = [];
  clubDestinoId: number | null = null;

  constructor(
    private dialogRef: MatDialogRef<TransferUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { clubId: number },
    private clubService: ClubService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    this.cargarClubes();
    this.cargarUsuarios();
  }

  cambiarTipo(tipo: 'jugador' | 'entrenador') {
    this.tipoUsuario = tipo;
    this.usuarioSeleccionado = null;
    this.clubDestinoId = null;
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    if (this.tipoUsuario === 'jugador') {
      this.clubService.getJugadoresClub(this.data.clubId).subscribe((res) => (this.usuarios = res));
    } else {
      this.clubService
        .getEntrenadoresClub(this.data.clubId)
        .subscribe((res) => (this.usuarios = res));
    }
  }

  cargarClubes() {
    this.clubService.getClubes().subscribe((res) => {
      this.clubes = res.filter((c) => c.id !== this.data.clubId);
    });
  }

  seleccionar(u: any) {
    this.usuarioSeleccionado = u;
    this.clubDestinoId = null;
  }

  traspasar() {
    if (!this.usuarioSeleccionado || !this.clubDestinoId) return;

    this.usuarioService
      .traspasarUsuario(this.usuarioSeleccionado.DNI, this.clubDestinoId)
      .subscribe({
        next: () => {
          this.usuarioSeleccionado = null;
          this.cargarUsuarios();
        },
        error: () => alert('Error al traspasar usuario'),
      });
  }

  eliminar() {
    if (!confirm('¿Seguro que quieres eliminar este usuario de la plataforma?')) {
      return;
    }

    this.usuarioService.eliminarUsuario(this.usuarioSeleccionado.DNI).subscribe({
      next: () => {
        this.usuarioSeleccionado = null;
        this.cargarUsuarios();
      },
      error: () => alert('Error eliminando usuario'),
    });
  }

  cerrar() {
    this.dialogRef.close(true);
  }
}
