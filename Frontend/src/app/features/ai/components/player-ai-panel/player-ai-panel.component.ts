import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';

import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AiService } from '../../../../../services/ai/ai.service';

@Component({
  selector: 'app-player-ai-panel',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './player-ai-panel.component.html',
  styleUrls: ['./player-ai-panel.component.scss'],
})
export class PlayerAiPanelComponent implements OnInit {
  @Input() dni!: string;

  loading = true;
  score: number | null = null;
  attendanceRatio: number | null = null;
  dropoutProbability: number | null = null;
  trend: string | null = null;
  attendanceHistory: any[] = [];
  isBrowser = false;
  clusterData: any = null;
  clusterIcon: string = '👤';
  clusterColor: string = '#bdc3c7';

  insights: string[] = [];

  constructor(
    private aiService: AiService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.dni) {
      this.loadAI();
    }
  }

  loadAI() {
    this.loading = true;

    this.aiService.getPlayerAnalysis(this.dni).subscribe({
      next: (res) => {
        this.score = res.performance_score;

        // =============================
        // RADAR CON DATOS REALES
        // =============================

        if (res.metrics) {
          this.radarChartData.datasets[0].data = [
            res.metrics.goles,
            res.metrics.asistencias,
            res.metrics.minutos,
            res.metrics.disciplina,
            res.metrics.participacion,
          ];
        }

        this.loading = false;
      },

      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });

    // ==============================
    // MODELO 2 (ASISTENCIA)
    // ==============================

    this.aiService.getAttendanceAnalysis(this.dni).subscribe({
      next: (res: any) => {
        this.attendanceRatio = res.attendance_ratio;
        this.dropoutProbability = res.dropout_probability;
        this.trend = res.trend;

        // HISTORIAL DE PARTIDOS
        this.attendanceHistory = res.history;

        this.lineChartData.labels = this.attendanceHistory.map((h: any) => `${h.match}`);

        this.lineChartData.datasets[0].data = this.attendanceHistory.map((h: any) => h.value);

        this.loading = false;
      },

      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });

    this.aiService.getClusteringAnalysis(this.dni).subscribe({
      next: (res) => {
        if (res && res.cluster_id !== undefined) { 
          this.clusterData = res;
          this.setClusterStyling(res.cluster_id);
        } else {
          console.warn("La IA no ha podido clasificar a este jugador (datos insuficientes)");
          this.clusterData = null;
        }
      },
      error: (err) => console.error("Error cargando clustering:", err)
    });
  }

  setClusterStyling(clusterId: number) {
    switch (clusterId) {
      case 0: 
        this.clusterIcon = '⭐'; 
        this.clusterColor = '#f39c12'; // Naranja (Cracks)
        break;
      case 1: 
        this.clusterIcon = '⚠️'; 
        this.clusterColor = '#e74c3c'; // Rojo (Riesgo)
        break;
      case 2: 
        this.clusterIcon = '🛡️'; 
        this.clusterColor = '#3498db'; // Azul (Defensivos)
        break;
      case 3: 
        this.clusterIcon = '⚡'; 
        this.clusterColor = '#9b59b6'; // Morado (Revulsivos)
        break;
      default: 
        this.clusterIcon = '👤'; 
        this.clusterColor = '#bdc3c7'; // Gris por defecto
    }
  }
  getInterpretation(): string {
    if (this.score === null) return '';

    if (this.score >= 80) return '🔥 Rendimiento excelente';
    if (this.score >= 60) return '✅ Buen rendimiento';
    if (this.score >= 40) return '⚠ Rendimiento medio';

    return '❗ Rendimiento bajo';
  }

  // RADAR CHART

  public radarChartType: ChartType = 'radar';

  public radarChartData: ChartConfiguration<'radar'>['data'] = {
    labels: ['Goles', 'Asistencias', 'Minutos', 'Disciplina', 'Participación'],

    datasets: [
      {
        label: 'Jugador',
        data: [0, 0, 0, 0, 0],
        fill: true,
      },
    ],
  };

  public lineChartType: ChartType = 'line';

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],

    datasets: [
      {
        label: 'Asistencia (%)',
        data: [],
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  public lineChartOptions = {
    responsive: true,

    scales: {
      y: {
        min: 0,
        max: 3,

        ticks: {
          stepSize: 1,

          callback: function (value: any) {
            if (value === 3) return 'Presente';
            if (value === 2) return 'Tarde';
            if (value === 1) return 'Excusado';
            if (value === 0) return 'Ausente';

            return '';
          },
        },
      },
    },
  };
  getRiskColor(): string {
    if (this.dropoutProbability === null) return '#999';

    const p = this.dropoutProbability;

    if (p < 0.3) return '#2ecc71';
    if (p < 0.6) return '#f1c40f';

    return '#e74c3c';
  }
}
