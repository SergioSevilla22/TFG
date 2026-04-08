import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../../../layout/header/header.component';
import { TeamSidebarComponent } from '../team-sidebar/team-sidebar.component';

import { TeamService } from '../../../../../services/team/team.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, TeamSidebarComponent],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  teamId!: number;
  team: any = null;
  loading = true;
  noTeam = false;
  activeDni?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || isNaN(Number(idParam))) {
      this.noTeam = true;
      return;
    }

    this.teamId = Number(idParam);

    const user = this.authService.getUser();
    this.activeDni = user?.DNI ?? undefined;
    this.loadTeam();
  }

  loadTeam() {
    this.loading = true;

    this.teamService.getTeamById(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('No se pudo cargar el equipo');
      },
    });
  }
}
