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

  modo: 'crear' | 'editar' = 'crear';


  constructor(
    private dialogRef: MatDialogRef<CreateEventoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { equipoId: number; jugadoresEquipo: any[],   evento?: any; },
    private eventoService: EventoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.jugadores = (this.data?.jugadoresEquipo || [])
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  
    if (this.data?.evento) {
  
      this.modo = 'editar';
  
      const e = this.data.evento;
  
      this.evento = {
        titulo: e.titulo,
        descripcion: e.descripcion,
        tipo: e.tipo,
        fecha_inicio: this.formatDatetimeLocal(e.fecha_inicio),
        fecha_fin: this.formatDatetimeLocal(e.fecha_fin),
        requiere_confirmacion: !!e.requiere_confirmacion,
        fecha_limite_confirmacion: e.fecha_limite_confirmacion
          ? this.formatDatetimeLocal(e.fecha_limite_confirmacion)
          : ''
      };
  
      e.jugadores?.forEach((j: any) => {
        this.seleccionados.add(j.DNI);
      });
    }
  }
  

  toggleJugador(dni: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.checked) this.seleccionados.add(dni);
    else this.seleccionados.delete(dni);
  }

  cerrar(refresh = false) { this.dialogRef.close(refresh); }

  guardar() {
    const user = this.authService.getUser();
    if (!user?.DNI) { this.mensaje = 'Usuario no encontrado'; return; }

    if (!this.evento.titulo || !this.evento.fecha_inicio || !this.evento.fecha_fin) {
      this.mensaje = 'Completa los campos obligatorios';
      return;
    }

    const payload = {
      titulo: this.evento.titulo,
      descripcion: this.evento.descripcion,
      tipo: this.evento.tipo,
      fecha_inicio: this.evento.fecha_inicio,
      fecha_fin: this.evento.fecha_fin,
      requiere_confirmacion: this.evento.requiere_confirmacion,
      fecha_limite_confirmacion: this.evento.requiere_confirmacion
        ? this.evento.fecha_limite_confirmacion
        : null,
      jugadores: Array.from(this.seleccionados)
    };
  
    this.loading = true;
  
    if (this.modo === 'editar') {
  
      this.eventoService
        .editarEvento(this.data.evento.id, payload)
        .subscribe({
          next: () => {
            this.loading = false;
            this.cerrar(true);
          },
          error: (err) => {
            this.loading = false;
            this.mensaje = err?.error?.message || 'Error actualizando evento';
          }
        });
  
    } else {
  
      this.eventoService
        .crearEvento({
          equipo_id: this.data.equipoId,
          creador_dni: user.DNI,
          ...payload
        })
        .subscribe({
          next: () => {
            this.loading = false;
            this.cerrar(true);
          },
          error: (err) => {
            this.loading = false;
            this.mensaje = err?.error?.message || 'Error creando evento';
          }
        });
    }
  }

  formatDatetimeLocal(dateString: string) {
    const d = new Date(dateString);
    return d.toISOString().slice(0, 16);
  }
  
}
