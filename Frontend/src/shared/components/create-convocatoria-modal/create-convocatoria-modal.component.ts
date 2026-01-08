import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ConvocatoriaService } from '../../../services/convocatoria.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-convocatoria-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './create-convocatoria-modal.component.html',
  styleUrls: ['./create-convocatoria-modal.component.scss']
})
export class CreateConvocatoriaModalComponent implements OnInit {

  convocatoria: any = {
    rival: '',
    lugar: '',
    fecha_partido: '',
    hora_inicio: '',
    hora_quedada: '',
    fecha_limite_confirmacion: ''
  };

  jugadores: any[] = [];
  seleccionados: Set<string> = new Set();

  mensaje = '';
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<CreateConvocatoriaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { equipoId: number; equipoNombre: string; jugadoresEquipo: any[] },
    private convocatoriaService: ConvocatoriaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.jugadores = (this.data?.jugadoresEquipo || []).slice().sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  }

  toggleJugador(dni: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.seleccionados.add(dni);
    } else {
      this.seleccionados.delete(dni);
    }
  }

  cerrar(refresh = false) {
    this.dialogRef.close(refresh);
  }

  publicar() {
    const user = this.authService.getUser();
    if (!user?.DNI) {
      this.mensaje = 'No se encontró el usuario en sesión.';
      return;
    }

    if (!this.convocatoria.fecha_partido || !this.convocatoria.hora_inicio || !this.convocatoria.hora_quedada || !this.convocatoria.fecha_limite_confirmacion) {
      this.mensaje = 'Completa los campos obligatorios.';
      return;
    }

    if (this.seleccionados.size === 0) {
      this.mensaje = 'Selecciona al menos un jugador.';
      return;
    }

    this.loading = true;
    this.mensaje = '';

    const payload = {
      equipo_id: this.data.equipoId,
      creador_dni: user.DNI,
      rival: this.convocatoria.rival,
      lugar: this.convocatoria.lugar,
      fecha_partido: this.convocatoria.fecha_partido,
      hora_inicio: this.convocatoria.hora_inicio,
      hora_quedada: this.convocatoria.hora_quedada,
      fecha_limite_confirmacion: this.convocatoria.fecha_limite_confirmacion,
      jugadores: Array.from(this.seleccionados)
    };

    this.convocatoriaService.crearConvocatoria(payload).subscribe({
      next: () => {
        this.loading = false;
        this.cerrar(true);
      },
      error: (err) => {
        this.loading = false;
        this.mensaje = err?.error?.message || 'Error al crear la convocatoria';
      }
    });
  }
}
