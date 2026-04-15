import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { CoachPanelComponent } from './features/coach/coach-panel/coach-panel.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PerfilUsuarioComponent } from './features/usuario/perfil-usuario/perfil-usuario.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { AcceptInvitationComponent } from './features/auth/accept-invitation/accept-invitation-component.component';
import { AdminComponent } from './features/admin/admin.component';
import { adminGuard } from './core/guards/admin.guard';
import { TutorPanelComponent } from './features/tutor/tutor-panel/tutor-panel.component';
import { ClubTeamsComponent } from './features/club/components/club-teams/club-teams.component';
import { ClubComponent } from './features/club/components/club/club.component';
import { SummaryComponent } from './features/equipo/components/summary/summary.component';
import { ClubsComponent } from './features/club/components/clubs/clubs.component';
import { TeamMatchCallsComponent } from './features/equipo/components/team-matchCalls/team-matchCalls.component';
import { TeamsEventsComponent } from './features/equipo/components/team-events/team-events.component';
import { TeamComponent } from './features/equipo/components/team/team.component';
import { SquadComponent } from './features/equipo/components/squad/squad.component';
import { PlayerProfileComponent } from './features/player/player-profile/player-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Registro' },
  { path: 'entrenador', component: CoachPanelComponent },
  { path: 'perfil', component: PerfilUsuarioComponent, title: 'Perfil' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'ForgotPassword' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'resetPassword' },
  { path: 'accept-invitation', component: AcceptInvitationComponent, title: 'Activar cuenta' },
  { path: 'admin', component: AdminComponent, title: 'Admin Page', canActivate: [adminGuard] },
  { path: 'tutor-panel', component: TutorPanelComponent, title: 'tutor-panel' },
  { path: 'club/:id', component: ClubComponent, title: 'Club' },
  { path: 'club/:id/equipos', component: ClubTeamsComponent, title: 'Equipos' },
  {
    path: 'equipo/:id',
    component: TeamComponent,
    title: 'Equipo',
    children: [
      { path: '', component: SummaryComponent },

      { path: 'convocatorias', component: TeamMatchCallsComponent },

      { path: 'eventos', component: TeamsEventsComponent },

      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/equipo/components/team-calendar/team-calendar.component').then(
            (m) => m.TeamCalendarComponent,
          ),
      },

      { path: 'plantilla', component: SquadComponent },

      { path: 'jugador/:dni', component: PlayerProfileComponent },
    ],
  },
  { path: 'clubes', component: ClubsComponent, title: 'Search Clubs', canActivate: [adminGuard] },
];

export default routes;
