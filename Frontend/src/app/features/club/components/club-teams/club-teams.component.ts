import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../../../services/team/team.service';
import { CategoryService } from '../../../../../services/admin/category.service';
import { SeasonService } from '../../../../../services/admin/season.service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-equipos-club',
  templateUrl: './club-teams.component.html',
  styleUrls: ['./club-teams.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, MatIcon],
})
export class ClubTeamsComponent implements OnInit {
  clubId!: number;
  teams: any[] = [];
  categories: any[] = [];
  activeSeason!: number;

  newTeam: {
    nombre: string;
    club_id: number | null;
    categoria_id: number | null;
    temporada_id: number | null;
  } = {
    nombre: '',
    club_id: null,
    categoria_id: null,
    temporada_id: null,
  };

  teamsByCategory: {
    categoria: string;
    equipos: any[];
  }[] = [];

  openCategory: string | null = null;

  message = '';

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private categoryService: CategoryService,
    private seasonService: SeasonService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.clubId = Number(this.route.snapshot.paramMap.get('id'));
    this.newTeam.club_id = this.clubId;

    this.loadTeams();
    this.loadCategories();
    this.loadActiveSeason();
  }

  loadTeams() {
    this.teamService.getTeamsByClub(this.clubId).subscribe((res) => {
      this.teams = res;
      this.groupTeamsByCategory();
    });
  }

  groupTeamsByCategory() {
    const map = new Map<string, any[]>();

    for (const team of this.teams) {
      if (!map.has(team.categoria)) {
        map.set(team.categoria, []);
      }
      map.get(team.categoria)!.push(team);
    }

    this.teamsByCategory = Array.from(map.entries()).map(([categoria, equipos]) => ({
      categoria,
      equipos,
    }));
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((res) => {
      this.categories = res;
    });
  }

  loadActiveSeason() {
    this.seasonService.getSeasons().subscribe((seasons: any[]) => {
      const active = seasons.find((s) => s.activa === 1);
      this.activeSeason = active.id;
      this.newTeam.temporada_id = active.id;
    });
  }

  createTeam() {
    this.teamService.createTeam(this.newTeam).subscribe({
      next: () => {
        this.message = 'Equipo creado correctamente';
        this.loadTeams();
      },
      error: (err) => {
        this.message = err.error.message;
      },
    });
  }

  deleteTeam(id: number) {
    this.teamService.deleteTeam(id).subscribe(() => {
      this.loadTeams();
    });
  }

  openTeam(id: number) {
    this.router.navigate(['/equipo', id]);
  }
}
