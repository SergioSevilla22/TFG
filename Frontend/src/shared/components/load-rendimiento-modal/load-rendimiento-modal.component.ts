import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RendimientoService } from '../../../services/rendimiento.service';

@Component({
    selector: 'app-load-rendimiento-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogActions, MatIcon,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule],
    templateUrl: './load-rendimiento-modal.component.html',
    styleUrls: ['./load-rendimiento-modal.component.scss']
  })

export class LoadRendimientoModalComponent implements OnInit {

    jugadores: any[] = [];
  
    constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      private rendimientoService: RendimientoService,
      private dialogRef: MatDialogRef<LoadRendimientoModalComponent>
    ) {}
  
    ngOnInit() {
  
      this.jugadores = this.data.jugadores.map((j: any) => ({
        jugador_dni: j.DNI,
        nombre: j.nombre,
        foto: j.foto,
  
        estado_asistencia: 'presente',
        nota_general: 0,
        intensidad: 0,
        actitud: 0,
        observaciones: ''
      }));
  
      this.rendimientoService
        .getRendimiento(this.data.eventoId)
        .subscribe(existing => {
          existing.forEach((r: any) => {
            const jugador = this.jugadores.find(j => j.jugador_dni === r.jugador_dni);
            if (jugador) Object.assign(jugador, r);
          });
        });
    }
  
    guardar() {
      this.rendimientoService
        .guardarRendimiento(this.data.eventoId, this.jugadores)
        .subscribe(() => this.dialogRef.close(true));
    }
  
    cerrar(refresh = false) {
        this.dialogRef.close(refresh);
    }

    limitarNumero(obj: any, campo: string, min: number, max: number) {
        if (obj[campo] === null || obj[campo] === undefined) return;
      
        if (obj[campo] < min) obj[campo] = min;
        if (obj[campo] > max) obj[campo] = max;
      }
      
  }
  