import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar-equipo',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './team-sidebar.component.html',
  styleUrls: ['./team-sidebar.component.css'],
})
export class TeamSidebarComponent implements OnInit {
  @Input() team: any;
  @Input() teamId!: number;
  @Input() active: 'resumen' | 'plantilla' | 'calendario' | 'eventos' | 'convocatorias' = 'resumen';
  @Input() dni?: string;

  userRole: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userRole = user?.Rol || null;
  }

  navigate(route: string) {
    this.router.navigate(route ? ['/equipo', this.teamId, route] : ['/equipo', this.teamId]);
  }

  get isSquadActive(): boolean {
    const url = this.router.url;
    if (url.includes('/plantilla')) return true;
    if (url.includes('/jugador/') && this.dni && !url.includes(`/jugador/${this.dni}`)) return true;
    return false;
  }

  get isMyProfileActive(): boolean {
    if (!this.dni) return false;
    return this.router.url.includes(`/jugador/${this.dni}`);
  }

  get showMyProfile(): boolean {
    if (!this.dni) return false;

    return this.userRole !== 'admin_club' && this.userRole !== 'admin_plataforma';
  }
}
