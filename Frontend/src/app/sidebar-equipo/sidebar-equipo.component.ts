import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-sidebar-equipo',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar-equipo.component.html',
  styleUrls: ['./sidebar-equipo.component.css']
})
export class SidebarEquipoComponent {

  @Input() equipo: any;
  @Input() equipoId!: number;
  @Input() activo: 'resumen' | 'plantilla' | 'calendario' | 'eventos' | 'convocatorias' = 'resumen';

  constructor(private router: Router) {}

  navegar(ruta: string) {
    this.router.navigate(
      ruta
        ? ['/equipo', this.equipoId, ruta]
        : ['/equipo', this.equipoId]
    );
  }
}
