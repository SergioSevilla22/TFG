import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../layout/header/header.component';

interface Player {
  nombre: string;
  fechaNacimiento: string;
  email: string;
  minutosJugados: number;
  goles: number;
  asistencias: number;
}

interface Team {
  nombre: string;
  categoria: string;
  numeroJugadores: number;
  ultimaSesion: string;
  jugadores: Player[];
  expanded?: boolean;
}

@Component({
  selector: 'app-entrenador-panel',
  imports: [HeaderComponent],
  templateUrl: './coach-panel.component.html',
  styleUrl: './coach-panel.component.css',
})
export class CoachPanelComponent implements OnInit {
  teams: Team[] = [];

  ngOnInit(): void {
    this.teams = [
      {
        nombre: 'Juvenil A',
        categoria: 'Juvenil',
        numeroJugadores: 18,
        ultimaSesion: '2025-09-24',
        jugadores: [
          {
            nombre: 'Carlos Pérez',
            fechaNacimiento: '2007-05-12',
            email: 'carlos@example.com',
            minutosJugados: 90,
            goles: 5,
            asistencias: 3,
          },
          {
            nombre: 'Miguel López',
            fechaNacimiento: '2007-03-21',
            email: 'miguel@example.com',
            minutosJugados: 85,
            goles: 2,
            asistencias: 5,
          },
          {
            nombre: 'Miguel López',
            fechaNacimiento: '2007-03-21',
            email: 'miguel@example.com',
            minutosJugados: 85,
            goles: 2,
            asistencias: 5,
          },
          {
            nombre: 'Miguel López',
            fechaNacimiento: '2007-03-21',
            email: 'miguel@example.com',
            minutosJugados: 85,
            goles: 2,
            asistencias: 5,
          },
          {
            nombre: 'Miguel López',
            fechaNacimiento: '2007-03-21',
            email: 'miguel@example.com',
            minutosJugados: 85,
            goles: 2,
            asistencias: 5,
          },
          {
            nombre: 'Miguel López',
            fechaNacimiento: '2007-03-21',
            email: 'miguel@example.com',
            minutosJugados: 85,
            goles: 2,
            asistencias: 5,
          },
        ],
        expanded: false,
      },
      {
        nombre: 'Infantil B',
        categoria: 'Infantil',
        numeroJugadores: 16,
        ultimaSesion: '2025-09-23',
        jugadores: [
          {
            nombre: 'Laura Sánchez',
            fechaNacimiento: '2010-08-01',
            email: 'laura@example.com',
            minutosJugados: 70,
            goles: 3,
            asistencias: 2,
          },
          {
            nombre: 'Miguel López',
            fechaNacimiento: '2007-03-21',
            email: 'miguel@example.com',
            minutosJugados: 85,
            goles: 2,
            asistencias: 5,
          },
        ],
        expanded: false,
      },
    ];
  }

  toggleExpand(team: Team) {
    team.expanded = !team.expanded;
  }

  getVisiblePlayers(team: Team): Player[] {
    return team.expanded ? team.jugadores : team.jugadores.slice(0, 1);
  }
}
