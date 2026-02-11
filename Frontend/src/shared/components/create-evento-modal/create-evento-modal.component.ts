import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { EventoService } from '../../../services/evento.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-evento-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    
    MatInputModule
  ],
  templateUrl: './create-evento-modal.component.html',
  styleUrls: ['./create-evento-modal.component.scss']
})

export class CreateEventoModalComponent implements OnInit {
  evento: any = {
    titulo: '',
    descripcion: '',
    tipo: 'otro',
    fecha_inicio: '',
    fecha_fin: '',
    requiere_confirmacion: false,
    fecha_limite_confirmacion: ''
  };
  jugadores: any[] = [];
  seleccionados: Set<string> = new Set();
  loading = false;
  mensaje = '';

  constructor(
    private dialogRef: MatDialogRef<CreateEventoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { equipoId: number; jugadoresEquipo: any[] },
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.jugadores = (this.data?.jugadoresEquipo || []).slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  toggleJugador(dni: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) this.seleccionados.add(dni);
    else this.seleccionados.delete(dni);
  }

  cerrar(refresh = false) { this.dialogRef.close(refresh); }

  crear() {
    const user = this.authService.getUser();
    if (!user?.DNI) { this.mensaje = 'Usuario no encontrado'; return; }

    if (!this.evento.titulo || !this.evento.fecha_inicio || !this.evento.fecha_fin) {
      this.mensaje = 'Completa los campos obligatorios';
      return;
    }

    const payload = {
      equipo_id: this.data.equipoId,
      creador_dni: user.DNI,
      titulo: this.evento.titulo,
      descripcion: this.evento.descripcion,
      tipo: this.evento.tipo,
      fecha_inicio: this.evento.fecha_inicio,
      fecha_fin: this.evento.fecha_fin,
      requiere_confirmacion: this.evento.requiere_confirmacion,
      fecha_limite_confirmacion: this.evento.requiere_confirmacion ? this.evento.fecha_limite_confirmacion : null,
      jugadores: Array.from(this.seleccionados)
    };

    this.loading = true;
    this.eventoService.crearEvento(payload).subscribe({
      next: () => { this.loading = false; this.cerrar(true); },
      error: (err) => { this.loading = false; this.mensaje = err?.error?.message || 'Error al crear evento'; }
    });
  }
}
