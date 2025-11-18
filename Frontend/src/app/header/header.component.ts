import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  profileImage: string = 'perfil.png';
  user: any = null;

  constructor(private router: Router, public authService: AuthService) {}//Se podria poner private pero haria el codigo mas grande y de momento no es necesario
  
  ngOnInit(): void {
    this.user = this.authService.getUser();

    if (this.user?.foto) {
      this.profileImage = 'http://localhost:3000' + this.user.foto;
    } else {
      this.profileImage = 'perfil.png';
    }
  }
 

  goToLogin(){
    this.router.navigate(['/login']);
  }


}
