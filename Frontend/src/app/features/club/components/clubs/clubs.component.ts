import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClubService } from '../../../../../services/club/club.service';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, MatIcon],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css'],
})
export class ClubsComponent implements OnInit {
  filters = {
    nombre: '',
    provincia: '',
    poblacion: '',
  };

  clubs: any[] = [];
  loading = false;
  searched = false; // 👈 clave UX
  private debounceTimer: any;

  constructor(
    private clubService: ClubService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  search() {
    this.loading = true;
    this.searched = true;

    const { nombre, provincia, poblacion } = this.filters;

    if (!nombre && !provincia && !poblacion) {
      this.clubs = [];
      this.searched = false;
      this.loading = false;
      return;
    }

    this.clubService.searchClubs(this.filters).subscribe({
      next: (res) => {
        this.clubs = res;
        this.loading = false;
      },
      error: () => {
        alert('Error al buscar clubes');
        this.loading = false;
      },
    });
  }

  onInputChange() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.search();
    }, 300);
  }

  ngOnDestroy() {
    clearTimeout(this.debounceTimer);
  }

  openClub(id: number) {
    this.router.navigate(['/club', id]);
  }
}
