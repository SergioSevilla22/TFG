import { Component } from '@angular/core';

@Component({
  selector: 'app-futbol-news',
  templateUrl: './futbol-news.component.html',
  styleUrls: ['./futbol-news.component.css']
})
export class FutbolNewsComponent {
  noticias = [
    {
      titulo: 'Golazo de último minuto',
      descripcion: 'El delantero marcó un gol espectacular en el tiempo añadido.',
      imagen: 'gonzalo.png'
    },
    {
      titulo: 'Nuevo fichaje confirmado',
      descripcion: 'El club anunció la llegada de un mediocampista estrella.',
      imagen: 'centrocampista.png'
    },
    {
      titulo: 'Resultados de la jornada',
      descripcion: 'Resumen de los partidos más destacados del fin de semana.',
      imagen: 'resumen.png'
    }
  ];
}