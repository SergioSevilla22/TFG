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
  isBrowser = false;

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
}
