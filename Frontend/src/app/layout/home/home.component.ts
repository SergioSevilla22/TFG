import { Router, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { FutbolNewsComponent } from '../../futbol-news/futbol-news.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  imports: [RouterModule, FutbolNewsComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
