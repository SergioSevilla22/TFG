import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ClubService } from '../../services/club.service';
import { EquipoService } from '../../services/equipos.service';
import { HeaderComponent } from "../header/header.component";
import { MatDialog } from '@angular/material/dialog';
import { AddPlayersClubModalComponent } from
  '../../shared/components/add-players-club-modal/add-players-club-modal.component';
import { AddCoachesClubModalComponent } from '../../shared/components/add-coaches-club-modal/add-coaches-club-modal.component';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent implements OnInit {

  clubId!: number;
  club: any = null;
  equipos: any[] = [];
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private equipoService: EquipoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.clubId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClubData();
  }

  loadClubData() {
    this.loading = true;

    this.clubService.getClubById(this.clubId).subscribe({
      next: (data) => {
        this.club = data;
        this.loadEquipos();
      },
      error: () => {
        this.loading = false;
        alert("No se pudo cargar el club.");
      }
    });
  }

  abrirModalJugadoresClub() {
    const dialogRef = this.dialog.open(AddPlayersClubModalComponent, {
      width: '700px',
      data: { clubId: this.clubId }
    });
  
    dialogRef.afterClosed().subscribe(refresh => {
      if (refresh) {
        this.loadEquipos(); // o refrescar lo que quieras
      }
    });
  }

  abrirModalEntrenadoresClub() {
    const dialogRef = this.dialog.open(AddCoachesClubModalComponent, {
      width: '700px',
      data: { clubId: this.clubId }
    });
  
    dialogRef.afterClosed().subscribe(refresh => {
      if (refresh) {
        // si quieres refrescar datos del club
        this.loadClubData();
      }
    });
  }

  loadEquipos() {
    this.equipoService.obtenerEquiposPorClub(this.clubId).subscribe({
      next: (data) => {
        this.equipos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert("Error al cargar equipos.");
      }
    });
  }
  

  editarClub() {
    this.router.navigate(['/admin'], { queryParams: { editClub: this.clubId } });
  }

  abrirEquipo(id: number) {
    this.router.navigate(['/equipo', id]);
  }

  crearEquipo() {
    this.router.navigate(['/equipo/crear'], {
      queryParams: { clubId: this.clubId }
    });
  }

  abrirEquiposClub() {
    this.router.navigate([`/club/${this.clubId}/equipos`]);
  }
  
}
