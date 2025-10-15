import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { EntrenadorPanelComponent } from './entrenador-panel/entrenador-panel.component';
import { RegisterComponent } from './register/register.component'; 

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Registro'}, 
  { path: 'home', component: HomeComponent, title: 'Home Page' },
  { path: 'entrenador', component: EntrenadorPanelComponent },
];

export default routes;

