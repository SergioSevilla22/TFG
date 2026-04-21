import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AiService } from '../../../../../services/ai/ai.service';
import { AuthService } from '../../../../..//services/auth/auth.service';
import { TeamService } from '../../../../../services/team/team.service';
import { TeamSidebarComponent } from '../../../equipo/components/team-sidebar/team-sidebar.component';
import { HeaderComponent } from '../../../../layout/header/header.component';

@Component({
  selector: 'app-player-ai-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    NgChartsModule,
    TeamSidebarComponent,
    HeaderComponent,
  ],
  templateUrl: './player-ai-panel.component.html',
  styleUrls: ['./player-ai-panel.component.scss'],
})
export class PlayerAiPanelComponent implements OnInit {
  dni!: string;
  teamId!: number;
  team: any = null;
  player: any = null;
  isBrowser = false;

  loading = true;
  loadingAttendance = true;
  loadingCluster = true;

  score: number | null = null;
  attendanceRatio: number | null = null;
  dropoutProbability: number | null = null;
  trend: string | null = null;
  attendanceHistory: any[] = [];
  clusterData: any = null;
  clusterIcon = '👤';
  clusterColor = '#bdc3c7';
  similarPlayers: { nombre: string; foto: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private aiService: AiService,
    public authService: AuthService,
    private teamService: TeamService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.teamId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.dni = this.route.snapshot.paramMap.get('dni')!;

    this.teamService.getTeamById(this.teamId).subscribe({ next: (d) => (this.team = d) });
    this.authService.getUserByDni(this.dni).subscribe({ next: (d) => (this.player = d) });

    this.loadPerformance();
    this.loadAttendance();
    this.loadClustering();
  }

  loadPerformance() {
    this.loading = true;
    this.aiService.getPlayerAnalysis(this.dni).subscribe({
      next: (res) => {
        this.score = res.performance_score;
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
      error: () => (this.loading = false),
    });
  }

  loadAttendance() {
    this.loadingAttendance = true;
    this.aiService.getAttendanceAnalysis(this.dni).subscribe({
      next: (res: any) => {
        this.attendanceRatio = res.attendance_ratio;
        this.dropoutProbability = res.dropout_probability;
        this.trend = res.trend;
        this.attendanceHistory = res.history;
        this.lineChartData.labels = this.attendanceHistory.map((h: any) => `${h.match}`);
        this.lineChartData.datasets[0].data = this.attendanceHistory.map((h: any) => h.value);
        this.loadingAttendance = false;
      },
      error: () => (this.loadingAttendance = false),
    });
  }

  loadClustering() {
    this.loadingCluster = true;
    this.aiService.getClusteringAnalysis(this.dni).subscribe({
      next: (res) => {
        if (res && res.cluster_id !== undefined) {
          this.clusterData = res;
          this.setClusterStyling(res.cluster_id);

          this.similarPlayers = [];
          const dnis: string[] = res.jugadores_similares ?? [];
          dnis.forEach((dni) => {
            this.authService.getUserByDni(dni).subscribe({
              next: (user) => {
                this.similarPlayers.push({
                  nombre: user.nombre,
                  foto: user.foto ? 'http://localhost:3000' + user.foto : '',
                });
              },
              error: () => {},
            });
          });
        }
        this.loadingCluster = false;
      },
      error: () => (this.loadingCluster = false),
    });
  }

  setClusterStyling(clusterId: number) {
    const map: Record<number, [string, string]> = {
      0: ['⭐', '#f39c12'],
      1: ['⚠️', '#e74c3c'],
      2: ['🛡️', '#3498db'],
      3: ['⚡', '#9b59b6'],
    };
    [this.clusterIcon, this.clusterColor] = map[clusterId] ?? ['👤', '#bdc3c7'];
  }

  getInterpretation(): { text: string; color: string } {
    if (this.score === null) return { text: '', color: '#999' };
    if (this.score >= 80) return { text: '🔥 Rendimiento excelente', color: '#1e7c45' };
    if (this.score >= 60) return { text: '✅ Buen rendimiento', color: '#2980b9' };
    if (this.score >= 40) return { text: '⚠ Rendimiento medio', color: '#f39c12' };
    return { text: '❗ Rendimiento bajo', color: '#e74c3c' };
  }

  getScoreGradient(): string {
    if (this.score === null) return 'linear-gradient(135deg, #bdc3c7, #95a5a6)';
    if (this.score >= 80) return 'linear-gradient(135deg, #1e7c45, #2dbd6e)';
    if (this.score >= 60) return 'linear-gradient(135deg, #2980b9, #3498db)';
    if (this.score >= 40) return 'linear-gradient(135deg, #e67e22, #f39c12)';
    return 'linear-gradient(135deg, #c0392b, #e74c3c)';
  }

  getRiskColor(): string {
    if (this.dropoutProbability === null) return '#999';
    if (this.dropoutProbability < 0.3) return '#2ecc71';
    if (this.dropoutProbability < 0.6) return '#f1c40f';
    return '#e74c3c';
  }

  getRiskLabel(): string {
    if (this.dropoutProbability === null) return '';
    if (this.dropoutProbability < 0.3) return 'Riesgo bajo';
    if (this.dropoutProbability < 0.6) return 'Riesgo medio';
    return 'Riesgo alto';
  }

  getTrendIcon(): string {
    if (this.trend === 'mejorando') return '📈';
    if (this.trend === 'empeorando') return '📉';
    return '➡️';
  }

  public radarChartType: ChartType = 'radar';
  public radarChartData: ChartConfiguration<'radar'>['data'] = {
    labels: ['Goles', 'Asistencias', 'Minutos', 'Disciplina', 'Participación'],
    datasets: [{ label: 'Jugador', data: [0, 0, 0, 0, 0], fill: true }],
  };

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ label: 'Asistencia', data: [], borderWidth: 3, tension: 0.4, fill: true }],
  };

  public lineChartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 3,
        ticks: {
          stepSize: 1,
          callback: (v: any) => ['Ausente', 'Excusado', 'Tarde', 'Presente'][v] ?? '',
        },
      },
    },
  };
}
