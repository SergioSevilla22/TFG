import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../../../../layout/header/header.component';
import { SidebarEquipoComponent } from '../sidebar-equipo/sidebar-equipo.component';

import { EquipoService } from '../../../../../services/equipo/equipos.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarEquipoComponent],
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.scss'],
})
export class EquipoComponent implements OnInit {
  equipoId!: number;
  equipo: any = null;
  loading = true;
  sinEquipo = false;
  dniActivo?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipoService: EquipoService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || isNaN(Number(idParam))) {
      this.sinEquipo = true;
      return;
    }

    this.equipoId = Number(idParam);

    const user = this.authService.getUser();
    this.dniActivo = user?.DNI ?? undefined;
    this.cargarEquipo();
  }

  cargarEquipo() {
    this.loading = true;

    this.equipoService.getEquipoById(this.equipoId).subscribe({
      next: (data) => {
        this.equipo = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('No se pudo cargar el equipo');
      },
    });
  }
}
