import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClubService } from '../../services/club.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {

  filtros = {
    nombre: '',
    provincia: '',
    poblacion: ''
  };

  clubes: any[] = [];
  loading = false;
  buscado = false; // 👈 clave UX

  constructor(
    private clubService: ClubService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  buscar() {
    this.loading = true;
    this.buscado = true;

    this.clubService.buscarClubes(this.filtros).subscribe({
      next: res => {
        this.clubes = res;
        this.loading = false;
      },
      error: () => {
        alert('Error al buscar clubes');
        this.loading = false;
      }
    });
  }

  onInputChange() {
    const { nombre, provincia, poblacion } = this.filtros;

    // Si todos los campos están vacíos → limpiar resultados
    if (!nombre && !provincia && !poblacion) {
      this.clubes = [];
      this.buscado = false;
    }
  }

  abrirClub(id: number) {
    this.router.navigate(['/club', id]);
  }
}
