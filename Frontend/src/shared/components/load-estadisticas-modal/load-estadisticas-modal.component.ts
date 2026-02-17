import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { EstadisticasService } from '../../../services/estadisticas.service';

@Component({
    selector: 'app-load-estadisticas-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogActions, MatIcon,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule],
    templateUrl: './load-estadisticas-modal.component.html',
    styleUrls: ['./load-estadisticas-modal.component.scss']
  })
  export class LoadEstadisticasModalComponent implements OnInit {
  
    jugadores: any[] = [];
  
    constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      private estadisticasService: EstadisticasService,
      private dialogRef: MatDialogRef<LoadEstadisticasModalComponent>
    ) {}
  
    ngOnInit() {
        this.jugadores = this.data.jugadores.map((j: any) => {

            let estadoAsistencia = 'presente';
          
            switch (j.estado) {
              case 'confirmado':
                estadoAsistencia = 'presente';
                break;
          
              case 'confirmado_tarde':
                estadoAsistencia = 'tarde';
                break;
          
              case 'rechazado':
                estadoAsistencia = 'ausente';
                break;
          
              case 'pendiente':
              default:
                estadoAsistencia = 'ausente';
            }
          
            return {
              jugador_dni: j.DNI,
              nombre: j.nombre,
              foto: j.foto,
              estado_convocatoria: j.estado,
              estado_asistencia: estadoAsistencia,
              minutos: 0,
              goles: 0,
              asistencias: 0,
              amarillas: 0,
              rojas: 0
            };
          });
          
      
        this.estadisticasService
          .getEstadisticasConvocatoria(this.data.convocatoriaId)
          .subscribe(existing => {
            existing.forEach((s: any) => {
              const jugador = this.jugadores.find(j => j.jugador_dni === s.jugador_dni);
              if (jugador) Object.assign(jugador, s);
            });
          });
      }
      
  
    guardar() {
      this.estadisticasService
        .guardarEstadisticasConvocatoria(this.data.convocatoriaId, this.jugadores)
        .subscribe(() => this.dialogRef.close(true));
    }

    cerrar(refresh = false) {
        this.dialogRef.close(refresh);
      }
  }
  