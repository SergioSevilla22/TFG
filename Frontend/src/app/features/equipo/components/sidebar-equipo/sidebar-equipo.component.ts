import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar-equipo',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './sidebar-equipo.component.html',
  styleUrls: ['./sidebar-equipo.component.css'],
})
export class SidebarEquipoComponent {
  @Input() equipo: any;
  @Input() equipoId!: number;
  @Input() activo: 'resumen' | 'plantilla' | 'calendario' | 'eventos' | 'convocatorias' = 'resumen';
  @Input() dni?: string;

  constructor(private router: Router) {}

  navegar(ruta: string) {
    this.router.navigate(ruta ? ['/equipo', this.equipoId, ruta] : ['/equipo', this.equipoId]);
  }

  get plantillaActiva(): boolean {
    const url = this.router.url;
    if (url.includes('/plantilla')) return true;
    if (url.includes('/jugador/') && this.dni && !url.includes(`/jugador/${this.dni}`)) return true;
    return false;
  }

  get miFichaActiva(): boolean {
    if (!this.dni) return false;
    return this.router.url.includes(`/jugador/${this.dni}`);
  }
}
