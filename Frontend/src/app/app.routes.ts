import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { EntrenadorPanelComponent } from './entrenador-panel/entrenador-panel.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, title: 'Home Page' },
  { path: 'login', component: LoginComponent , title: 'Login' },
  { path: 'entrenador', component: EntrenadorPanelComponent },
];

export default routes;

