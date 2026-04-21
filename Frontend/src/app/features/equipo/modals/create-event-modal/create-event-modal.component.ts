import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { EventService } from '../../../../../services/team/event.service';
import { AuthService } from '../../../../../services/auth/auth.service';

@Component({
  selector: 'app-create-evento-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './create-event-modal.component.html',
  styleUrls: ['./create-event-modal.component.scss'],
})
export class CreateEventModalComponent implements OnInit {
  eventForm: any = {
    titulo: '',
    descripcion: '',
    tipo: 'otro',
    fecha_inicio: '',
    fecha_fin: '',
    requiere_confirmacion: false,
    fecha_limite_confirmacion: '',
  };
  players: any[] = [];
  selected: Set<string> = new Set();
  loading = false;
  message = '';
  submitted = false;

  mode: 'crear' | 'editar' = 'crear';

  constructor(
    private dialogRef: MatDialogRef<CreateEventModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { equipoId: number; jugadoresEquipo: any[]; evento?: any },
    private eventService: EventService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.players = (this.data?.jugadoresEquipo || [])
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    if (this.data?.evento) {
      this.mode = 'editar';

      const e = this.data.evento;

      this.eventForm = {
        titulo: e.titulo,
        descripcion: e.descripcion,
        tipo: e.tipo,
        fecha_inicio: this.formatDatetimeLocal(e.fecha_inicio),
        fecha_fin: this.formatDatetimeLocal(e.fecha_fin),
        requiere_confirmacion: !!e.requiere_confirmacion,
        fecha_limite_confirmacion: e.fecha_limite_confirmacion
          ? this.formatDatetimeLocal(e.fecha_limite_confirmacion)
          : '',
      };

      e.jugadores?.forEach((j: any) => {
        this.selected.add(j.DNI);
      });
    }
  }

  togglePlayer(dni: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) this.selected.add(dni);
    else this.selected.delete(dni);
  }

  close(refresh = false) {
    this.dialogRef.close(refresh);
  }

  save() {
    this.submitted = true;

    const user = this.authService.getUser();
    if (!user?.DNI) {
      this.message = 'Usuario no encontrado';
      return;
    }

    if (
      !this.eventForm.titulo ||
      !this.eventForm.fecha_inicio ||
      !this.eventForm.fecha_fin ||
      (this.eventForm.requiere_confirmacion && !this.eventForm.fecha_limite_confirmacion)
    ) {
      return;
    }

    const payload = {
      titulo: this.eventForm.titulo,
      descripcion: this.eventForm.descripcion,
      tipo: this.eventForm.tipo,
      fecha_inicio: this.eventForm.fecha_inicio,
      fecha_fin: this.eventForm.fecha_fin,
      requiere_confirmacion: this.eventForm.requiere_confirmacion,
      fecha_limite_confirmacion: this.eventForm.requiere_confirmacion
        ? this.eventForm.fecha_limite_confirmacion
        : null,
      jugadores: Array.from(this.selected),
    };

    this.loading = true;

    if (this.mode === 'editar') {
      this.eventService.editEvent(this.data.evento.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.close(true);
        },
        error: (err) => {
          this.loading = false;
          this.message = err?.error?.message || 'Error actualizando evento';
        },
      });
    } else {
      this.eventService
        .createEvent({
          equipo_id: this.data.equipoId,
          creador_dni: user.DNI,
          ...payload,
        })
        .subscribe({
          next: () => {
            this.loading = false;
            this.close(true);
          },
          error: (err) => {
            this.loading = false;
            this.message = err?.error?.message || 'Error creando evento';
          },
        });
    }
  }

  formatDatetimeLocal(dateString: string) {
    const d = new Date(dateString);
    return d.toISOString().slice(0, 16);
  }
}
