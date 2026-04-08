import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatchCallService } from '../../../../../services/team/matchCall.service';
import { EventService } from '../../../../../services/team/event.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalles-evento-modal',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './event-details-modal.component.html',
  styleUrls: ['./event-details-modal.component.scss'],
})
export class EventDetailsModalComponent implements OnInit {
  details: any = null;
  loading = true;
  user: any;
  isPast = false;
  isClosed = false;
  isInvited = false;
  reason = '';
  typeBadge!: string;

  constructor(
    public dialogRef: MatDialogRef<EventDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: number; tipo: 'convocatoria' | 'evento'; equipoId: number },
    private matchCallService: MatchCallService,
    private eventService: EventService,
    public authService: AuthService,
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails() {
    this.loading = true;
    const teamId = this.data.equipoId;

    const observer = {
      next: (list: any[]) => {
        this.details = list.find((item: any) => item.id === this.data.id);
        if (this.data.tipo === 'convocatoria') {
          this.typeBadge = 'partido';
        } else {
          switch (this.details?.tipo) {
            case 'partido':
              this.typeBadge = 'partido';
              break;
            case 'entrenamiento':
              this.typeBadge = 'entrenamiento';
              break;
            case 'reunion':
              this.typeBadge = 'reunion';
              break;
            default:
              this.typeBadge = 'otro';
          }
        }

        this.checkUserStatus();
        this.checkDates();
        this.loading = false;
      },

      error: () => (this.loading = false),
    };

    if (this.data.tipo === 'convocatoria') {
      this.matchCallService.getTeamMatchCalls(teamId).subscribe(observer);
    } else {
      this.eventService.getTeamEvents(teamId).subscribe(observer);
    }
  }

  checkUserStatus() {
    if (!this.details || !this.details.jugadores) {
      this.isInvited = false;
      return;
    }
    this.isInvited = this.details.jugadores.some((j: any) => j.DNI === this.user.DNI);
  }

  checkDates() {
    if (!this.details) return;

    const now = new Date();

    if (this.data.tipo === 'convocatoria') {
      this.isPast = new Date(this.details.fecha_partido) < now;
      this.isClosed = now > new Date(this.details.fecha_limite_confirmacion);
    } else {
      this.isPast = new Date(this.details.fecha_inicio) < now;
      this.isClosed = false;
    }
  }

  get currentStatus() {
    return this.details?.jugadores?.find((j: any) => j.DNI === this.user?.DNI)?.estado;
  }

  count(status: string): number {
    return this.details?.jugadores?.filter((j: any) => j.estado === status).length || 0;
  }

  respond(newStatus: string) {
    this.loading = true;
    const payload: any = {
      jugador_dni: this.user.DNI,
      estado: newStatus,
    };

    if (this.reason?.trim()) {
      payload.motivo = this.reason.trim();
    }

    const request =
      this.data.tipo === 'convocatoria'
        ? this.matchCallService.respondMatchCall(this.details.id, payload)
        : this.eventService.respondToEvent(this.details.id, payload);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        alert(err.error?.message || 'Error al responder');
        this.loading = false;
      },
    });
  }
}
