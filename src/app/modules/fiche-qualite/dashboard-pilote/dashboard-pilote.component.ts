import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { ExportService } from 'src/app/services/export.service';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { FicheQualiteDetailsModalComponent } from '../components/fiche-qualite-details-modal/fiche-qualite-details-modal.component';

@Component({
  selector: 'app-dashboard-pilote-qualite',
  templateUrl: './dashboard-pilote.component.html',
  styleUrls: ['./dashboard-pilote.component.scss']
})
export class DashboardPiloteQualiteComponent implements OnInit {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // État de chargement
  loading = false;
  
  // Données des fiches
  fichesQualite: FicheQualite[] = [];
  fichesFiltrees: FicheQualite[] = [];
  dataSource = new MatTableDataSource<FicheQualite>();
  
  // KPI et métriques
  totalFiches = 0;
  fichesEnCours = 0;
  fichesTerminees = 0;
  fichesValidees = 0;
  nouvelleFichesCeMois = 0;
  
  // Pourcentages
  pourcentageEnCours = 0;
  pourcentageTerminees = 0;
  pourcentageValidees = 0;
  
  // Filtres
  recherche = '';
  filtreStatut = '';
  filtreType = '';
  
  // Affichage
  affichageCartes = true;
  displayedColumns: string[] = ['titre', 'typeFiche', 'statut', 'responsable', 'dateEcheance', 'actions'];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private ficheQualiteService: FicheQualiteService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    console.log('🚀 Dashboard Pilote Qualité - Fiches Qualité - Chargement...');
    this.chargerDonneesSimulees();
  }

  /**
   * 🔙 RETOUR AU DASHBOARD PILOTE
   */
  retourDashboard(): void {
    console.log('🔙 Retour au dashboard pilote...');
    this.router.navigate(['/fiche-suivi/dashboard']);
    this.snackBar.open('Retour au Dashboard Pilote', 'Fermer', {
      duration: 2000
    });
  }

  /**
   * 📊 CHARGEMENT DES DONNÉES SIMULÉES (SANS APPEL DE SERVICE)
   */
  chargerDonneesSimulees(): void {
    this.loading = true;
    
    // Données simulées complètement locales
    setTimeout(() => {
      // Données simulées pour les fiches qualité
      this.fichesQualite = [
        {
          id: '1',
          titre: 'Audit Qualité Production Ligne A',
          description: 'Audit complet de la ligne de production A pour vérifier la conformité aux standards ISO 9001',
          typeFiche: 'AUDIT',
          statut: 'EN_COURS',
          responsable: 'Marie Dubois',
          dateEcheance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          dateCreation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          titre: 'Contrôle Qualité Matières Premières',
          description: 'Vérification des standards qualité des matières premières reçues',
          typeFiche: 'CONTROLE',
          statut: 'TERMINEE',
          responsable: 'Jean Martin',
          dateEcheance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          dateCreation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          titre: 'Plan d\'Amélioration Continue Q4',
          description: 'Mise en place des actions correctives identifiées lors des audits précédents',
          typeFiche: 'AMELIORATION',
          statut: 'VALIDEE',
          responsable: 'Sophie Laurent',
          dateEcheance: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          dateCreation: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        },
        {
          id: '4',
          titre: 'Formation Équipe Qualité - Nouveaux Standards',
          description: 'Session de formation sur les nouveaux standards qualité 2024',
          typeFiche: 'FORMATION',
          statut: 'EN_COURS',
          responsable: 'Pierre Durand',
          dateEcheance: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          dateCreation: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: '5',
          titre: 'Maintenance Préventive Équipements',
          description: 'Programme de maintenance préventive des équipements critiques',
          typeFiche: 'MAINTENANCE',
          statut: 'EN_ATTENTE',
          responsable: 'Lucas Moreau',
          dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: '6',
          titre: 'Évaluation Fournisseurs Critiques',
          description: 'Évaluation annuelle des fournisseurs critiques selon les critères qualité',
          typeFiche: 'AUDIT',
          statut: 'REJETEE',
          responsable: 'Emma Rousseau',
          dateEcheance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          dateCreation: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          id: '7',
          titre: 'Contrôle Final Produits Finis',
          description: 'Contrôle qualité final avant expédition des produits finis',
          typeFiche: 'CONTROLE',
          statut: 'BLOQUEE',
          responsable: 'Thomas Bernard',
          dateEcheance: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '8',
          titre: 'Amélioration Process Assemblage',
          description: 'Optimisation du processus d\'assemblage pour réduire les défauts',
          typeFiche: 'AMELIORATION',
          statut: 'VALIDEE',
          responsable: 'Camille Petit',
          dateEcheance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          dateCreation: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        }
      ] as FicheQualite[];

      this.calculerStatistiques();
      this.appliquerFiltres();
      this.loading = false;
      
      console.log('📊 Données chargées avec succès');
    }, 1000);
  }

  /**
   * 📈 CALCULER LES STATISTIQUES
   */
  calculerStatistiques(): void {
    this.totalFiches = this.fichesQualite.length;
    this.fichesEnCours = this.fichesQualite.filter(f => f.statut === 'EN_COURS').length;
    this.fichesTerminees = this.fichesQualite.filter(f => f.statut === 'TERMINEE').length;
    this.fichesValidees = this.fichesQualite.filter(f => f.statut === 'VALIDEE').length;
    
    // Calculer les pourcentages
    if (this.totalFiches > 0) {
      this.pourcentageEnCours = Math.round((this.fichesEnCours / this.totalFiches) * 100);
      this.pourcentageTerminees = Math.round((this.fichesTerminees / this.totalFiches) * 100);
      this.pourcentageValidees = Math.round((this.fichesValidees / this.totalFiches) * 100);
    }
    
    // Calculer les nouvelles fiches ce mois
    const debutMois = new Date();
    debutMois.setDate(1);
    this.nouvelleFichesCeMois = this.fichesQualite.filter(f => 
      f.dateCreation && new Date(f.dateCreation) >= debutMois
    ).length;
  }



  /**
   * 📊 FILTRAGE PAR STATUT
   */
  filtrerParStatut(statut: string): void {
    console.log('🔍 Filtrage par statut:', statut);
    if (statut === 'ALL') {
      this.filtreStatut = '';
    } else {
      this.filtreStatut = statut;
    }
    this.appliquerFiltres();
    this.snackBar.open(`Filtrage par statut: ${statut}`, 'Fermer', {
      duration: 2000
    });
  }

  /**
   * 🔍 GESTION DES FILTRES
   */
  appliquerFiltres(): void {
    let fiches = [...this.fichesQualite];

    // Filtre par recherche
    if (this.recherche.trim()) {
      const rechercheLower = this.recherche.toLowerCase();
      fiches = fiches.filter(f => 
        f.titre.toLowerCase().includes(rechercheLower) ||
        f.description.toLowerCase().includes(rechercheLower) ||
        f.responsable.toLowerCase().includes(rechercheLower)
      );
    }

    // Filtre par statut
    if (this.filtreStatut) {
      fiches = fiches.filter(f => f.statut === this.filtreStatut);
    }

    // Filtre par type
    if (this.filtreType) {
      fiches = fiches.filter(f => f.typeFiche === this.filtreType);
    }

    this.fichesFiltrees = fiches;
    this.dataSource.data = fiches;
    
    // Réinitialiser la pagination
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  reinitialiserFiltres(): void {
    this.recherche = '';
    this.filtreStatut = '';
    this.filtreType = '';
    this.appliquerFiltres();
    this.snackBar.open('Filtres réinitialisés', 'Fermer', {
      duration: 2000
    });
  }

  /**
   * 🎛️ GESTION DE L'AFFICHAGE
   */
  basculerAffichage(): void {
    this.affichageCartes = !this.affichageCartes;
    console.log('🎛️ Affichage:', this.affichageCartes ? 'Cartes' : 'Tableau');
  }

  /**
   * 👁️ VOIR DÉTAIL D'UNE FICHE
   */
  voirDetailFiche(fiche: FicheQualite): void {
    console.log('👁️ Voir détail de la fiche:', fiche.titre);
    
    // Ouvrir la modale de détails
    const dialogRef = this.dialog.open(FicheQualiteDetailsModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: fiche,
      panelClass: 'custom-dialog-container',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Modale de détails fermée');
    });
  }

  /**
   * 📊 FONCTIONS D'EXPORT
   */
  exportPDF(): void {
    console.log('📄 Export PDF des fiches qualité...');
    this.loading = true;
    
    setTimeout(() => {
      const donneesExport = {
        title: `Fiches Qualité - Rapport Pilote - ${new Date().toLocaleDateString()}`,
        totalFiches: this.totalFiches,
        fichesEnCours: this.fichesEnCours,
        fichesTerminees: this.fichesTerminees,
        fichesValidees: this.fichesValidees,
        fiches: this.fichesFiltrees,
        dateGeneration: new Date()
      };
      
      // Simulation d'export PDF
      console.log('📄 Export PDF simulé:', donneesExport);
      this.loading = false;
      
      this.snackBar.open('Rapport PDF généré avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 2000);
  }

  exportExcel(): void {
    console.log('📊 Export Excel des fiches qualité...');
    this.loading = true;
    
    setTimeout(() => {
      const donneesExport = this.fichesFiltrees.map(fiche => ({
        Titre: fiche.titre,
        Description: fiche.description,
        Type: fiche.typeFiche,
        Statut: fiche.statut,
        Responsable: fiche.responsable,
        'Date Échéance': fiche.dateEcheance,
        'Date Création': fiche.dateCreation
      }));
      
      // Simulation d'export Excel
      console.log('📊 Export Excel simulé:', donneesExport);
      this.loading = false;
      
      this.snackBar.open('Données Excel exportées avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 1500);
  }

  /**
   * 🎨 FONCTIONS D'AIDE POUR L'AFFICHAGE
   */
  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'AUDIT': '#2196f3',
      'CONTROLE': '#4caf50',
      'AMELIORATION': '#ff9800',
      'FORMATION': '#9c27b0',
      'MAINTENANCE': '#607d8b',
      'AUTRE': '#795548'
    };
    return colors[type] || '#666';
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'AUDIT': 'search',
      'CONTROLE': 'verified_user',
      'AMELIORATION': 'trending_up',
      'FORMATION': 'school',
      'MAINTENANCE': 'build',
      'AUTRE': 'help_outline'
    };
    return icons[type] || 'description';
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_COURS': 'en-cours',
      'TERMINEE': 'terminee',
      'VALIDEE': 'validee',
      'REJETEE': 'rejetee',
      'EN_ATTENTE': 'en-attente',
      'BLOQUEE': 'bloquee'
    };
    return classes[statut] || '';
  }

  getStatutIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'EN_COURS': 'hourglass_empty',
      'TERMINEE': 'check_circle',
      'VALIDEE': 'verified',
      'REJETEE': 'cancel',
      'EN_ATTENTE': 'schedule',
      'BLOQUEE': 'block'
    };
    return icons[statut] || 'help_outline';
  }

  ngAfterViewInit(): void {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
}