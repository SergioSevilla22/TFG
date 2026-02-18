import { EstadisticasService } from './../../services/estadisticas.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarEquipoComponent } from '../sidebar-equipo/sidebar-equipo.component';
import { AuthService } from '../../services/auth.service';
import { EquipoService } from '../../services/equipos.service';
import { signal } from '@angular/core';
import { ObservacionesService } from '../../services/observaciones.service';
import { MatIconModule } from '@angular/material/icon';
import { CreateObservacionModalComponent } from '../../shared/components/create-observacion-modal/create-observacion-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-jugador-ficha',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarEquipoComponent, MatIconModule, MatDialogModule],
  templateUrl: './jugador-ficha.component.html',
  styleUrls: ['./jugador-ficha.component.scss']
})
export class JugadorFichaComponent implements OnInit {

  jugador: any = null;
  equipoId!: number;
  loading = true;
  equipo: any = null;
  totales: any = {};
  observaciones = signal<any[]>([]);
  
  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private equipoService: EquipoService,
    private estadisticasService: EstadisticasService,
    private obsService: ObservacionesService,
    private dialog:  MatDialog
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
          this.cargarObservaciones(dni);
        },
        error: () => {
          this.loading = false;
          alert("Error cargando jugador");
        }
      });
    }
    this.estadisticasService.getTotalesJugador(dni!).subscribe(data => {
      this.totales = data;
    });
  }

  get edad(): number {
    if (!this.jugador?.anio_nacimiento) return 0;
    return new Date().getFullYear() - this.jugador.anio_nacimiento;
  }

  cargarObservaciones(dni: string) {
    this.obsService.getPorJugador(dni).subscribe(data => {
      this.observaciones.set(data);
    });
  }

  abrirModalObservacion() {
    const dialogRef = this.dialog.open(CreateObservacionModalComponent, {
      width: '600px',
      data: {
        equipoId: this.jugador.equipo_id,
        jugadoresEquipo: [this.jugador], // Pasamos solo a este jugador
        dniIndividual: this.jugador.DNI
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si el modal devolvió 'true', recargamos la lista
        this.cargarObservaciones(this.jugador.DNI);
      }
    });
  }
}


