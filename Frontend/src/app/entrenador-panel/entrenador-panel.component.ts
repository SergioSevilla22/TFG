import { Component,OnInit  } from '@angular/core';
import { HeaderComponent } from "../header/header.component";

interface Jugador {
  nombre: string;
  fechaNacimiento: string;
  email: string;
  minutosJugados: number;
  goles: number;
  asistencias: number;
}

interface Equipo {
  nombre: string;
  categoria: string;
  numeroJugadores: number;
  ultimaSesion: string;
  jugadores: Jugador[];
  expandido?: boolean;
}

@Component({
  selector: 'app-entrenador-panel',
  imports: [HeaderComponent],
  templateUrl: './entrenador-panel.component.html',
  styleUrl: './entrenador-panel.component.css'
})



export class EntrenadorPanelComponent implements OnInit {
  equipos: Equipo[] = [];
  

  ngOnInit(): void {
    this.equipos = [
      {
        nombre: 'Juvenil A',
        categoria: 'Juvenil',
        numeroJugadores: 18,
        ultimaSesion: '2025-09-24',
        jugadores: [
          { nombre: 'Carlos Pérez', fechaNacimiento: '2007-05-12', email: 'carlos@example.com', minutosJugados: 90, goles: 5, asistencias: 3 },
          { nombre: 'Miguel López', fechaNacimiento: '2007-03-21', email: 'miguel@example.com', minutosJugados: 85, goles: 2, asistencias: 5 },
          { nombre: 'Miguel López', fechaNacimiento: '2007-03-21', email: 'miguel@example.com', minutosJugados: 85, goles: 2, asistencias: 5 },
          { nombre: 'Miguel López', fechaNacimiento: '2007-03-21', email: 'miguel@example.com', minutosJugados: 85, goles: 2, asistencias: 5 },
          { nombre: 'Miguel López', fechaNacimiento: '2007-03-21', email: 'miguel@example.com', minutosJugados: 85, goles: 2, asistencias: 5 },
          { nombre: 'Miguel López', fechaNacimiento: '2007-03-21', email: 'miguel@example.com', minutosJugados: 85, goles: 2, asistencias: 5 },
          
        ],
        expandido: false
      },
      {
        nombre: 'Infantil B',
        categoria: 'Infantil',
        numeroJugadores: 16,
        ultimaSesion: '2025-09-23',
        jugadores: [
          { nombre: 'Laura Sánchez', fechaNacimiento: '2010-08-01', email: 'laura@example.com', minutosJugados: 70, goles: 3, asistencias: 2 },
          { nombre: 'Miguel López', fechaNacimiento: '2007-03-21', email: 'miguel@example.com', minutosJugados: 85, goles: 2, asistencias: 5 },
        ],
        expandido: false
      }
    ];
  }

  toggleExpand(equipo: Equipo) {
    equipo.expandido = !equipo.expandido;
  }
  
  getJugadoresVisibles(equipo: Equipo): Jugador[] {
    return equipo.expandido ? equipo.jugadores : equipo.jugadores.slice(0, 1);
  }
}

