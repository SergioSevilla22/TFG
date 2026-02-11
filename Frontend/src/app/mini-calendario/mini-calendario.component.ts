import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DetallesEventoModalComponent } from '../../shared/components/detalles-evento-modal/detalles-evento-modal.component';


@Component({
  selector: 'app-mini-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-calendario.component.html',
  styleUrls: ['./mini-calendario.component.scss']
})
export class MiniCalendarioComponent implements OnInit, OnChanges  {

  @Input() eventos: any[] = [];
  @Input() convocatorias: any[] = [];
  @Input() equipoId!: number;

  diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  dias: any[] = [];

  nombreMes = '';
  anio!: number;

  constructor(private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    this.generarCalendario();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['eventos'] || changes['convocatorias']) {
      this.generarCalendario();
    }
  }
  
  mismaFecha(fecha1: string | Date, fecha2: Date): boolean {
    const f1 = new Date(fecha1);
    return (
      f1.getDate() === fecha2.getDate() &&
      f1.getMonth() === fecha2.getMonth() &&
      f1.getFullYear() === fecha2.getFullYear()
    );
  }

  irACalendario() {
    this.router.navigate(['/equipo', this.equipoId, 'calendario']);
  }

  generarCalendario() {
    this.dias = [];
  
    const hoy = new Date();
    const mes = hoy.getMonth();
    this.anio = hoy.getFullYear();
    this.nombreMes = hoy.toLocaleString('es', { month: 'long' });
  
    const ultimoDia = new Date(this.anio, mes + 1, 0).getDate();
  
    for (let i = 1; i <= ultimoDia; i++) {
      const fecha = new Date(this.anio, mes, i);
  
      const eventosDelDia = this.eventos.filter(e =>
        this.mismaFecha(e.fecha_inicio, fecha)
      );
  
      const convocatoriasDelDia = this.convocatorias.filter(c =>
        this.mismaFecha(c.fecha_partido, fecha)
      );
  
      let tipo: string | null = null;
      let id: number | null = null;
      let esConvocatoria = false;
  
      if (convocatoriasDelDia.length > 0) {
        tipo = 'partido';
        id = convocatoriasDelDia[0].id;
        esConvocatoria = true;
      } else if (eventosDelDia.length > 0) {
        const evento = eventosDelDia[0];
        id = evento.id;
  
        switch (evento.tipo) {
          case 'entrenamiento':
            tipo = 'entrenamiento';
            break;
          case 'reunion':
            tipo = 'reunion';
            break;
          case 'partido':
            tipo = 'partido';
            break;
          default:
            tipo = 'otro';
        }
      }
  
      this.dias.push({
        numero: i,
        esHoy:
          i === hoy.getDate() &&
          mes === hoy.getMonth() &&
          this.anio === hoy.getFullYear(),
        tipo,
        id,
        esConvocatoria,
        tieneEvento: !!id
      });
    }
  }

  abrirDetalleDia(event: MouseEvent, dia: any) {
    event.stopPropagation();
    
    if (!dia.tieneEvento) return;
  
    this.dialog.open(DetallesEventoModalComponent, {
      width: '500px',
      data: {
        id: dia.id,
        tipo: dia.esConvocatoria ? 'convocatoria' : 'evento',
        equipoId: this.equipoId
      }
    });
  }
  
  
  
  
  
}
