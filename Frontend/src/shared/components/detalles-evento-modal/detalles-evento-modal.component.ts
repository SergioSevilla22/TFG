import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConvocatoriaService } from '../../../services/convocatoria.service';
import { EventoService } from '../../../services/evento.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalles-evento-modal',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions,CommonModule,
  FormsModule,
  MatDialogModule,
  MatButtonModule],
  templateUrl: './detalles-evento-modal.component.html',
  styleUrls: ['./detalles-evento-modal.component.scss']
})
export class DetallesEventoModalComponent implements OnInit {
  detalles: any = null;
  loading = true;
  user: any;
  esPasado = false;
  cerrada = false;
  estaConvocado = false; // Nueva propiedad
  motivo = '';


  constructor(
    public dialogRef: MatDialogRef<DetallesEventoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; tipo: 'convocatoria' | 'evento'; equipoId: number;},
    private convocatoriaService: ConvocatoriaService,
    private eventoService: EventoService,
    public authService: AuthService
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.cargarInformacion();
  }

  cargarInformacion() {
    this.loading = true;
    const equipoId = this.data.equipoId;

    const observer = {
      next: (list: any[]) => {
        this.detalles = list.find((item: any) => item.id === this.data.id);
        this.verificarEstadoUsuario(); // Verificamos si está en la lista
        this.verificarFechas();
        this.loading = false;
      },
      error: () => this.loading = false
    };

    if (this.data.tipo === 'convocatoria') {
      this.convocatoriaService.getConvocatoriasEquipo(equipoId).subscribe(observer);
    } else {
      this.eventoService.getEventosEquipo(equipoId).subscribe(observer);
    }
  }

  verificarEstadoUsuario() {
    if (!this.detalles || !this.detalles.jugadores) {
      this.estaConvocado = false;
      return;
    }
    // Comprobamos si el DNI del usuario está en la lista de jugadores del evento
    this.estaConvocado = this.detalles.jugadores.some((j: any) => j.DNI === this.user.DNI);
  }

  verificarFechas() {
    if (!this.detalles) return;
  
    const ahora = new Date();
  
    if (this.data.tipo === 'convocatoria') {
      this.esPasado = new Date(this.detalles.fecha_partido) < ahora;
      this.cerrada = ahora > new Date(this.detalles.fecha_limite_confirmacion);
    } else {
      this.esPasado = new Date(this.detalles.fecha_inicio) < ahora;
      this.cerrada = false;
    }
  }

  get estadoActual() {
    return this.detalles?.jugadores?.find((j: any) => j.DNI === this.user?.DNI)?.estado;
  }

  // Nombre unificado para el HTML: contar
  contar(estado: string): number {
    return this.detalles?.jugadores?.filter((j: any) => j.estado === estado).length || 0;
  }

  responder(nuevoEstado: string) {
    this.loading = true;
    const payload: any = {
      jugador_dni: this.user.DNI,
      estado: nuevoEstado
    };
    
    if (this.motivo?.trim()) {
      payload.motivo = this.motivo.trim();
    }
    

    const peticion = this.data.tipo === 'convocatoria' 
      ? this.convocatoriaService.responderConvocatoria(this.detalles.id, payload)
      : this.eventoService.responderEvento(this.detalles.id, payload);

    peticion.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        alert(err.error?.message || 'Error al responder');
        this.loading = false;
      }
    });
  }
}