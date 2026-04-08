import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MatchCallService } from '../../../../../services/team/matchCall.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { AiService } from '../../../../../services/ai/ai.service';

@Component({
  selector: 'app-create-convocatoria-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './create-match-call-modal.component.html',
  styleUrls: ['./create-match-call-modal.component.scss'],
})
export class CreateMatchCallModalComponent implements OnInit {
  convocatoria: any = {
    rival: '',
    lugar: '',
    fecha_partido: '',
    hora_inicio: '',
    hora_quedada: '',
    fecha_limite_confirmacion: '',
  };

  jugadores: any[] = [];
  seleccionados: Set<string> = new Set();
  errores: string[] = [];

  mensaje = '';
  loading = false;
  loadingAttendance = false;

  modo: 'crear' | 'editar' = 'crear';
  ordenSeleccionado: 'nombre' | 'mejor' | 'peor' | 'rendimiento' = 'nombre';

  jugadoresFiltrados: any[] = [];

  attendanceMap: Record<
    string,
    {
      attendance_ratio: number;
      dropout_probability: number;
      trend: string;
    }
  > = {};

  performanceMap: Record<string, number> = {};

  constructor(
    private dialogRef: MatDialogRef<CreateMatchCallModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      equipoId: number;
      equipoNombre: string;
      jugadoresEquipo: any[];
      convocatoria?: any;
    },
    private convocatoriaService: MatchCallService,
    private authService: AuthService,
    private aiService: AiService,
  ) {}

  ngOnInit(): void {
    this.jugadores = (this.data?.jugadoresEquipo || [])
      .slice()
      .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

    this.jugadoresFiltrados = [...this.jugadores];

    if (this.data?.convocatoria) {
      this.modo = 'editar';

      const c = this.data.convocatoria;

      this.convocatoria = {
        rival: c.rival || '',
        lugar: c.lugar || '',
        fecha_partido: c.fecha_partido?.split('T')[0],
        hora_inicio: c.hora_inicio,
        hora_quedada: c.hora_quedada,
        fecha_limite_confirmacion: this.formatDatetimeLocal(c.fecha_limite_confirmacion),
      };

      c.jugadores?.forEach((j: any) => {
        this.seleccionados.add(j.DNI);
      });
    }

    this.loadAttendanceTrends();
    this.loadPerformanceScores();
  }

  loadAttendanceTrends() {
    if (!this.jugadores.length) return;

    this.loadingAttendance = true;

    const requests = this.jugadores.map((jugador) =>
      this.aiService.getAttendanceAnalysis(jugador.DNI).pipe(
        catchError(() =>
          of({
            attendance_ratio: 0,
            dropout_probability: 0,
            trend: 'sin datos',
            history: [],
          }),
        ),
      ),
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach((res, index) => {
          const dni = this.jugadores[index].DNI;
          this.attendanceMap[dni] = {
            attendance_ratio: res.attendance_ratio,
            dropout_probability: res.dropout_probability,
            trend: res.trend,
          };
        });

        this.loadingAttendance = false;
      },
      error: () => {
        this.loadingAttendance = false;
      },
    });
    this.ordenarJugadores();
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

  guardar() {
    const user = this.authService.getUser();
    if (!user?.DNI) {
      this.mensaje = 'No se encontró el usuario en sesión.';
      return;
    }

    if (
      !this.convocatoria.fecha_partido ||
      !this.convocatoria.hora_inicio ||
      !this.convocatoria.hora_quedada ||
      !this.convocatoria.fecha_limite_confirmacion
    ) {
      this.mensaje = 'Completa los campos obligatorios.';
      return;
    }

    if (this.seleccionados.size === 0) {
      this.mensaje = 'Selecciona al menos un jugador.';
      return;
    }

    const errores: string[] = [];

    const inicio = new Date(`${this.convocatoria.fecha_partido}T${this.convocatoria.hora_inicio}`);
    const quedada = new Date(
      `${this.convocatoria.fecha_partido}T${this.convocatoria.hora_quedada}`,
    );
    const limite = new Date(this.convocatoria.fecha_limite_confirmacion);
    const ahora = new Date();

    if (inicio < ahora) {
      errores.push('No se puede crear una convocatoria en una fecha u hora pasada.');
    }

    if (quedada > inicio) {
      errores.push('La hora de quedada no puede ser posterior al inicio del partido.');
    }

    if (limite > inicio) {
      errores.push('El límite de confirmación no puede ser posterior al inicio del partido.');
    }

    if (limite > quedada) {
      errores.push('El límite de confirmación no puede ser posterior a la hora de quedada.');
    }

    if (errores.length > 0) {
      this.errores = errores;
      return;
    }

    this.loading = true;
    this.errores = [];
    this.mensaje = '';

    const payload = {
      rival: this.convocatoria.rival,
      lugar: this.convocatoria.lugar,
      fecha_partido: this.convocatoria.fecha_partido,
      hora_inicio: this.convocatoria.hora_inicio,
      hora_quedada: this.convocatoria.hora_quedada,
      fecha_limite_confirmacion: this.convocatoria.fecha_limite_confirmacion,
      jugadores: Array.from(this.seleccionados),
    };

    this.loading = true;
    this.errores = [];

    if (this.modo === 'editar') {
      this.convocatoriaService.editMatchCall(this.data.convocatoria.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.cerrar(true);
        },
        error: (err) => {
          this.loading = false;
          this.errores = err?.error?.errors || [err?.error?.message];
        },
      });
    } else {
      this.convocatoriaService
        .createMatchCall({
          equipo_id: this.data.equipoId,
          creador_dni: user.DNI,
          ...payload,
        })
        .subscribe({
          next: () => {
            this.loading = false;
            this.cerrar(true);
          },
          error: (err) => {
            this.loading = false;
            this.errores = err?.error?.errors || [err?.error?.message];
          },
        });
    }
  }

  formatDatetimeLocal(dateString: string) {
    const d = new Date(dateString);
    return d.toISOString().slice(0, 16);
  }

  getAttendanceInfo(dni: string) {
    return this.attendanceMap[dni] || null;
  }

  getAttendanceIcon(dni: string): string {
    const info = this.getAttendanceInfo(dni);
    if (!info) return 'help_outline';

    if (info.trend === 'estable') return 'trending_up';
    if (info.trend === 'riesgo moderado') return 'trending_flat';
    if (info.trend === 'alto riesgo') return 'trending_down';

    return 'help_outline';
  }

  getAttendanceClass(dni: string): string {
    const info = this.getAttendanceInfo(dni);
    if (!info) return 'trend-unknown';

    if (info.trend === 'estable') return 'trend-good';
    if (info.trend === 'riesgo moderado') return 'trend-medium';
    if (info.trend === 'alto riesgo') return 'trend-bad';

    return 'trend-unknown';
  }

  getAttendanceLabel(dni: string): string {
    const info = this.getAttendanceInfo(dni);
    if (!info) return 'Sin datos';

    if (info.trend === 'estable') return 'Estable';
    if (info.trend === 'riesgo moderado') return 'Riesgo medio';
    if (info.trend === 'alto riesgo') return 'Alto riesgo';

    return 'Sin datos';
  }

  getAttendanceTooltip(dni: string): string {
    const info = this.getAttendanceInfo(dni);
    if (!info) return 'Sin datos de asistencia';

    const asistencia = Math.round((info.attendance_ratio || 0) * 100);
    const riesgo = Math.round((info.dropout_probability || 0) * 100);

    return `Asistencia media: ${asistencia}% · Riesgo IA: ${riesgo}%`;
  }

  ordenarJugadores() {
    const jugadores = [...this.jugadores];

    if (this.ordenSeleccionado === 'nombre') {
      jugadores.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }

    if (this.ordenSeleccionado === 'mejor') {
      jugadores.sort((a, b) => {
        const aVal = this.getAttendanceInfo(a.DNI)?.attendance_ratio ?? -1;
        const bVal = this.getAttendanceInfo(b.DNI)?.attendance_ratio ?? -1;
        return bVal - aVal;
      });
    }

    if (this.ordenSeleccionado === 'peor') {
      jugadores.sort((a, b) => {
        const aVal = this.getAttendanceInfo(a.DNI)?.attendance_ratio ?? 999;
        const bVal = this.getAttendanceInfo(b.DNI)?.attendance_ratio ?? 999;
        return aVal - bVal;
      });
    }

    if (this.ordenSeleccionado === 'rendimiento') {
      jugadores.sort((a, b) => {
        return this.getPerformance(b.DNI) - this.getPerformance(a.DNI);
      });
    }

    this.jugadoresFiltrados = jugadores;
  }

  getPerformance(dni: string): number {
    return this.performanceMap[dni] ?? 0;
  }

  loadPerformanceScores() {
    if (!this.jugadores.length) return;

    const requests = this.jugadores.map((jugador) =>
      this.aiService.getPlayerAnalysis(jugador.DNI).pipe(
        catchError(() =>
          of({
            performance_score: 0,
          }),
        ),
      ),
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach((res, index) => {
          const dni = this.jugadores[index].DNI;
          this.performanceMap[dni] = res.performance_score;
        });

        this.ordenarJugadores();
      },
    });
  }

  getPerformanceTooltip(dni: string): string {
    const score = this.getPerformance(dni);

    if (!score) return 'Sin datos de rendimiento';

    let nivel = '';

    if (score >= 70) nivel = 'Alto rendimiento';
    else if (score >= 40) nivel = 'Rendimiento medio';
    else nivel = 'Rendimiento bajo';

    return `Nivel: ${nivel}`;
  }

  getPerformanceClass(dni: string): string {
    const score = this.getPerformance(dni);

    if (!score) return 'perf-unknown';

    if (score >= 70) return 'perf-high';
    if (score >= 40) return 'perf-medium';

    return 'perf-low';
  }
}
