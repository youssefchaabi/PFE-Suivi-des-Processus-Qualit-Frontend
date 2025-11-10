import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { DashboardChefComponent } from './dashboard-chef/dashboard-chef.component';
import { DashboardPiloteQualiteComponent } from './dashboard-pilote/dashboard-pilote.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  { 
    path: 'dashboard', 
    component: DashboardChefComponent,
    canActivate: [AuthGuard],
    data: { role: 'CHEF_PROJET' }
  },
  { 
    path: 'dashboard-pilote', 
    component: DashboardPiloteQualiteComponent,
    canActivate: [AuthGuard],
    data: { role: ['PILOTE_QUALITE', 'ADMIN'] }
  },
  { 
    path: 'liste', 
    component: ListeComponent
    // Guard temporairement désactivé pour test
    // canActivate: [AuthGuard],
    // data: { role: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'] }
  },
  { 
    path: 'nouveau', 
    component: FormulaireComponent,
    canActivate: [AuthGuard],
    data: { role: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'] }
  },
  { 
    path: ':id', 
    component: FormulaireComponent,
    canActivate: [AuthGuard],
    data: { role: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'] }
  },
  { 
    path: '', 
    redirectTo: 'liste',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FicheQualiteRoutingModule { }
