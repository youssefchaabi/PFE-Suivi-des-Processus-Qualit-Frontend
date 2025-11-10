import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SidebarSection } from 'src/app/shared/dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-dashboard-pilote',
  templateUrl: './dashboard-pilote.component.html',
  styleUrls: ['./dashboard-pilote.component.scss']
})
export class DashboardPiloteComponent implements OnInit {
  sidebarSections: SidebarSection[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard' },
    { id: 'kpi', label: 'Indicateurs KPI', icon: 'speed' },
    { id: 'tracking', label: 'Fiches de Suivi', icon: 'assignment_turned_in' },
    { id: 'quality', label: 'Fiches Qualité', icon: 'verified' },
    { id: 'alerts', label: 'Alertes', icon: 'warning' },
    { id: 'analytics', label: 'Analyses IA', icon: 'psychology' },
    { id: 'reports', label: 'Rapports', icon: 'description' }
  ];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
  }

  /**
   * 📋 OUVRIR LA LISTE DES FICHES QUALITÉ
   */
  ouvrirFichesQualite(): void {
    console.log('📋 Navigation vers la liste des fiches qualité...');
    this.router.navigate(['/fiche-qualite/liste']);
    this.snackBar.open('Accès aux Fiches Qualité', 'Fermer', {
      duration: 2000
    });
  }
} 