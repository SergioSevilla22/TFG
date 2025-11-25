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
  { path: 'tutor-panel', component: TutorPanelComponent, title: 'tutor-panel'}

];

export default routes;

