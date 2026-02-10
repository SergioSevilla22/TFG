import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { EntrenadorPanelComponent } from './entrenador-panel/entrenador-panel.component';
import { RegisterComponent } from './register/register.component'; 
import { PerfilUsuarioComponent } from './perfil-usuario/perfil-usuario.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AcceptInvitationComponent } from './accept-invitation/accept-invitation-component.component';
import { AdminComponent } from './admin/admin.component';
import { adminGuard } from './guards/admin.guard';
import { TutorPanelComponent } from './tutor-panel/tutor-panel.component';
import { EquiposClubComponent } from './equipos-club/equipos-club.component';
import { ClubComponent } from './club/club.component';
import { EquipoComponent } from './equipo/equipo.component';
import { ClubsComponent } from './clubs/clubs.component';
import { EquipoConvocatoriasComponent } from './equipo-convocatorias/equipo-convocatorias.component';
import { EquipoEventosComponent } from './equipo-eventos/equipo-eventos.component';
import { PlantillaComponent } from './plantilla/plantilla.component';



export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Registro'}, 
  { path: 'home', component: HomeComponent, title: 'Home Page' },
  { path: 'entrenador', component: EntrenadorPanelComponent },
  { path: 'perfil', component: PerfilUsuarioComponent , title: 'Perfil' },
  { path: 'forgot-password', component: ForgotPasswordComponent , title: 'ForgotPassword'},
  { path: 'reset-password', component: ResetPasswordComponent, title: 'resetPassword'},
  { path: 'accept-invitation', component: AcceptInvitationComponent, title: 'Activar cuenta' },
  { path: 'admin', component: AdminComponent, title: 'Admin Page', canActivate: [adminGuard] },
  { path: 'tutor-panel', component: TutorPanelComponent, title: 'tutor-panel'},
  { path: 'club/:id', component: ClubComponent , title: 'Club'},
  { path: 'club/:id/equipos', component: EquiposClubComponent, title: 'Equipos' },
  { path: 'equipo/:id', component: EquipoComponent, title: 'Equipo' },
  { path: 'clubes',component: ClubsComponent, title: 'Search Clubs', canActivate: [adminGuard]},
  {
    path: 'equipo/:id/calendario',
    loadComponent: () =>
      import('./equipo-calendario/equipo-calendario.component')
        .then(m => m.EquipoCalendarioComponent)
  },
  {
    path: 'equipo/:id/convocatorias',
    component: EquipoConvocatoriasComponent
  },
  {
    path: 'equipo/:id/eventos',
    component: EquipoEventosComponent
  },
  {
    path: 'equipo/:id/plantilla',
    component: PlantillaComponent
  }
  
  


];

export default routes;

