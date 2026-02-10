import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}

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
  
      const hayEvento = this.eventos.some(e =>
        this.mismaFecha(e.fecha_inicio, fecha)
      );
  
      const hayConvocatoria = this.convocatorias.some(c =>
        this.mismaFecha(c.fecha_partido, fecha)
      );
  
      this.dias.push({
        numero: i,
        esHoy:
          i === hoy.getDate() &&
          mes === hoy.getMonth() &&
          this.anio === hoy.getFullYear(),
        hayEvento,
        hayConvocatoria
      });
    }
  }
  
}
