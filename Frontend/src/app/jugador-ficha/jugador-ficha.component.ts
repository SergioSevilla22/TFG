import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarEquipoComponent } from '../sidebar-equipo/sidebar-equipo.component';
import { AuthService } from '../../services/auth.service';
import { EquipoService } from '../../services/equipos.service';


@Component({
  selector: 'app-jugador-ficha',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarEquipoComponent],
  templateUrl: './jugador-ficha.component.html',
  styleUrls: ['./jugador-ficha.component.scss']
})
export class JugadorFichaComponent implements OnInit {

  jugador: any = null;
  equipoId!: number;
  loading = true;
  equipo: any = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private equipoService: EquipoService
  ) {}

  ngOnInit(): void {
    this.equipoId = Number(this.route.snapshot.paramMap.get('equipoId'));
    const dni = this.route.snapshot.paramMap.get('dni');
    this.equipoService.getEquipoById(this.equipoId).subscribe({
      next: (data) => {
        this.equipo = data;
      }
    });
    if (dni) {
      this.authService.getUserByDni(dni).subscribe({
        next: (data) => {
          this.jugador = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert("Error cargando jugador");
        }
      });
    }
  }

  get edad(): number {
    if (!this.jugador?.anio_nacimiento) return 0;
    return new Date().getFullYear() - this.jugador.anio_nacimiento;
  }

}


