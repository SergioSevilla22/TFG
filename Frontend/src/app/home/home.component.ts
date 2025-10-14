import { Router, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { FutbolNewsComponent } from '../futbol-news/futbol-news.component';

@Component({
  selector: 'app-home',
  imports: [RouterModule,FutbolNewsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) {}


  goToLogin(){
    this.router.navigate(['/login']);
  }

}
