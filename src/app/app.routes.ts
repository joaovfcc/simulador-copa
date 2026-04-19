import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/tournament/tournament.routes').then(m => m.tournamentRoutes)
  }
];
