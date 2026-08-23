import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LayoutComponent } from './shared/layout.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./pages/registro.component').then((m) => m.RegistroComponent) },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'biblioteca', loadComponent: () => import('./pages/biblioteca.component').then((m) => m.BibliotecaComponent) },
      { path: 'jogo/:id', loadComponent: () => import('./pages/jogo-detalhe.component').then((m) => m.JogoDetalheComponent) },
      { path: 'perfil', loadComponent: () => import('./pages/perfil.component').then((m) => m.PerfilComponent) },
      { path: '', redirectTo: 'biblioteca', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
