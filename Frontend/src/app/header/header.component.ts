import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  profileImage: string = 'perfil.png';
  user: any = null;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();

    if (this.user?.foto) {
      this.profileImage = 'http://localhost:3000' + this.user.foto;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
