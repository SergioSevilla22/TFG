import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './layout/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { EntrenadorPanelComponent } from './features/entrenador/entrenador-panel/entrenador-panel.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PerfilUsuarioComponent } from './features/usuario/perfil-usuario/perfil-usuario.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { AcceptInvitationComponent } from './features/auth/accept-invitation/accept-invitation-component.component';
import { AdminComponent } from './features/admin/admin.component';
import { adminGuard } from './core/guards/admin.guard';
import { TutorPanelComponent } from './features/tutor/tutor-panel/tutor-panel.component';
import { EquiposClubComponent } from './features/club/components/equipos-club/equipos-club.component';
import { ClubComponent } from './features/club/components/club/club.component';
import { ResumenComponent } from './features/equipo/components/resumen/resumen.component';
import { ClubsComponent } from './features/club/components/clubs/clubs.component';
import { EquipoConvocatoriasComponent } from './features/equipo/components/equipo-convocatorias/equipo-convocatorias.component';
import { EquipoEventosComponent } from './features/equipo/components/equipo-eventos/equipo-eventos.component';
import { EquipoComponent } from './features/equipo/components/equipo/equipo.component';
import { PlantillaComponent } from './features/equipo/components/plantilla/plantilla.component';
import { JugadorFichaComponent } from './features/jugador/jugador-ficha/jugador-ficha.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Registro' },
  { path: 'home', component: HomeComponent, title: 'Home Page' },
  { path: 'entrenador', component: EntrenadorPanelComponent },
  { path: 'perfil', component: PerfilUsuarioComponent, title: 'Perfil' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'ForgotPassword' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'resetPassword' },
  { path: 'accept-invitation', component: AcceptInvitationComponent, title: 'Activar cuenta' },
  { path: 'admin', component: AdminComponent, title: 'Admin Page', canActivate: [adminGuard] },
  { path: 'tutor-panel', component: TutorPanelComponent, title: 'tutor-panel' },
  { path: 'club/:id', component: ClubComponent, title: 'Club' },
  { path: 'club/:id/equipos', component: EquiposClubComponent, title: 'Equipos' },
  {
    path: 'equipo/:id',
    component: EquipoComponent,
    title: 'Equipo',
    children: [
      { path: '', component: ResumenComponent },

      { path: 'convocatorias', component: EquipoConvocatoriasComponent },

      { path: 'eventos', component: EquipoEventosComponent },

      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/equipo/components/equipo-calendario/equipo-calendario.component').then(
            (m) => m.EquipoCalendarioComponent,
          ),
      },

      { path: 'plantilla', component: PlantillaComponent },

      { path: 'jugador/:dni', component: JugadorFichaComponent },
    ],
  },
  { path: 'clubes', component: ClubsComponent, title: 'Search Clubs', canActivate: [adminGuard] },
];

export default routes;
