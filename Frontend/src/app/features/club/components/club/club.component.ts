import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClubService } from '../../../../../services/club/club.service';
import { TeamService } from '../../../../../services/team/team.service';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../services/auth/auth.service';
import { TransferUserModalComponent } from '../../modals/transfer-user-modal/transfer-user-modal.component';

@Component({
  selector: 'app-club',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FormsModule,
    MatIcon,
    MatProgressSpinnerModule,
  ],
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css'],
})
export class ClubComponent implements OnInit {
  clubId!: number;
  club: any = null;
  teams: any[] = [];
  loading: boolean = true;
  summary: any = null;
  filteredTeams: any[] = [];
  searched = false;

  editMode: boolean = false;
  selectedFile: File | null = null;
  shieldPreview: string | ArrayBuffer | null = null;
  editForm: any = {};

  teamFilters = {
    name: '',
    category: '',
    season: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private teamService: TeamService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    // 🔐 ADMIN CLUB → IGNORAR URL
    if (user?.Rol === 'admin_club') {
      if (!user.club_id) {
        if (this.isBrowser()) {
          alert('No tienes club asignado.');
        }
        this.router.navigate(['/login']);
        return;
      }

      this.clubId = user.club_id;
      this.loadClubData();
      return;
    }

    // 🔓 ADMIN PLATAFORMA → club por URL
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.clubId = Number(routeId);
      this.loadClubData();
    } else {
      if (this.isBrowser()) {
        alert('Club no válido.');
      }
      this.router.navigate(['/admin']);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  loadClubData() {
    if (!this.isBrowser()) {
      return; // ⛔ NO SSR
    }

    this.loading = true;

    this.clubService.getClubById(this.clubId).subscribe({
      next: (club) => {
        this.club = club;

        this.teamService.getTeamsByClub(this.clubId).subscribe({
          next: (teams) => {
            this.teams = teams;
            this.filteredTeams = [];
            this.searched = false;
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          },
        });

        this.clubService.getClubSummary(this.clubId).subscribe({
          next: (data) => (this.summary = data),
        });
      },
      error: (err) => {
        console.error('Error cargando club', err);
        this.loading = false;
      },
    });
  }

  loadSummary() {
    this.clubService.getClubSummary(this.clubId).subscribe({
      next: (data) => (this.summary = data),
    });
  }

  openTransferModal() {
    const dialogRef = this.dialog.open(TransferUserModalComponent, {
      width: '800px',
      data: { clubId: this.clubId },
    });

    dialogRef.afterClosed().subscribe((refresh) => {
      if (refresh) {
        // Refrescamos KPIs y datos del club
        this.loadSummary();
        this.loadClubData();
      }
    });
  }

  loadTeams() {
    this.teamService.getTeamsByClub(this.clubId).subscribe({
      next: (data) => {
        this.teams = data;
        this.filteredTeams = [];
        this.searched = false;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        if (this.isBrowser()) {
          alert('Error al cargar equipos.');
        }
      },
    });
  }

  onInputChange() {
    const { name, category, season } = this.teamFilters;

    if (!name && !category && !season) {
      this.searched = false;
      this.filteredTeams = [];
    }
  }

  editClub() {
    this.router.navigate(['/admin'], { queryParams: { editClub: this.clubId } });
  }

  openTeam(id: number) {
    this.router.navigate(['/equipo', id]);
  }

  createTeam() {
    this.router.navigate(['/equipo/crear'], {
      queryParams: { clubId: this.clubId },
    });
  }

  openClubTeams() {
    this.router.navigate([`/club/${this.clubId}/equipos`]);
  }

  searchTeams() {
    const { name, category, season } = this.teamFilters;
    if (!name && !category && !season) {
      this.searched = false;
      this.filteredTeams = [];
      return;
    }

    this.searched = true;
    this.filteredTeams = this.teams.filter(
      (t) =>
        (!name || t.nombre.toLowerCase().includes(name.toLowerCase())) &&
        (!category || t.categoria.toLowerCase().includes(category.toLowerCase())) &&
        (!season || t.temporada.toLowerCase().includes(season.toLowerCase())),
    );
  }

  startEditing() {
    this.editMode = true;
    this.editForm = { ...this.club };
    this.shieldPreview = null;
    this.selectedFile = null;
  }

  cancelEditing(event?: Event) {
    if (event) event.stopPropagation();
    this.editMode = false;
    this.selectedFile = null;
    this.shieldPreview = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Vista previa de la imagen
      const reader = new FileReader();
      reader.onload = () => (this.shieldPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  saveChanges(event: Event) {
    event.stopPropagation();
    this.loading = true;

    const formData = new FormData();
    formData.append('nombre', this.editForm.nombre);
    formData.append('email', this.editForm.email || '');
    formData.append('telefono', this.editForm.telefono || '');
    formData.append('direccion', this.editForm.direccion || '');
    formData.append('poblacion', this.editForm.poblacion || '');
    formData.append('provincia', this.editForm.provincia || '');
    formData.append('codigo_postal', this.editForm.codigo_postal || '');

    if (this.selectedFile) {
      formData.append('escudo', this.selectedFile);
    }

    this.clubService.updateClub(this.clubId, formData).subscribe({
      next: () => {
        this.editMode = false;
        this.loadClubData();
        if (this.isBrowser()) alert('Club actualizado correctamente');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        if (this.isBrowser()) alert('Error al actualizar el club');
      },
    });
  }
}
