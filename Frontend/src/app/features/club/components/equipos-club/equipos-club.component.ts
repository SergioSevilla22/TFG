import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../../../services/equipo/team.service';
import { CategoryService } from '../../../../../services/admin/category.service';
import { SeasonService } from '../../../../../services/admin/season.service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-equipos-club',
  templateUrl: './equipos-club.component.html',
  styleUrls: ['./equipos-club.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, MatIcon],
})
export class EquiposClubComponent implements OnInit {
  clubId!: number;
  equipos: any[] = [];
  categorias: any[] = [];
  temporadaActiva!: number;

  nuevoEquipo: {
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

  equiposPorCategoria: {
    categoria: string;
    equipos: any[];
  }[] = [];

  categoriaAbierta: string | null = null;

  mensaje = '';

  constructor(
    private route: ActivatedRoute,
    private equipoService: TeamService,
    private categoriaService: CategoryService,
    private temporadaService: SeasonService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.clubId = Number(this.route.snapshot.paramMap.get('id'));
    this.nuevoEquipo.club_id = this.clubId;

    this.cargarEquipos();
    this.cargarCategorias();
    this.cargarTemporadaActiva();
  }

  cargarEquipos() {
    this.equipoService.getTeamsByClub(this.clubId).subscribe((res) => {
      this.equipos = res;
      this.agruparEquiposPorCategoria();
    });
  }

  agruparEquiposPorCategoria() {
    const mapa = new Map<string, any[]>();

    for (const eq of this.equipos) {
      if (!mapa.has(eq.categoria)) {
        mapa.set(eq.categoria, []);
      }
      mapa.get(eq.categoria)!.push(eq);
    }

    this.equiposPorCategoria = Array.from(mapa.entries()).map(([categoria, equipos]) => ({
      categoria,
      equipos,
    }));
  }

  cargarCategorias() {
    this.categoriaService.getCategories().subscribe((res) => {
      this.categorias = res;
    });
  }

  cargarTemporadaActiva() {
    this.temporadaService.getSeasons().subscribe((temps: any[]) => {
      const activa = temps.find((t) => t.activa === 1);
      this.temporadaActiva = activa.id;
      this.nuevoEquipo.temporada_id = activa.id;
    });
  }

  crearEquipo() {
    this.equipoService.createTeam(this.nuevoEquipo).subscribe({
      next: () => {
        this.mensaje = 'Equipo creado correctamente';
        this.cargarEquipos();
      },
      error: (err) => {
        this.mensaje = err.error.message;
      },
    });
  }

  eliminarEquipo(id: number) {
    this.equipoService.deleteTeam(id).subscribe(() => {
      this.cargarEquipos();
    });
  }

  abrirEquipo(id: number) {
    this.router.navigate(['/equipo', id]);
  }
}
