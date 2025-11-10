import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExportService } from 'src/app/services/export.service';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { FicheSuiviService } from 'src/app/services/fiche-suivi.service';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { FicheSuivi } from 'src/app/models/fiche-suivi';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Enregistrer tous les composants Chart.js nécessaires
Chart.register(...registerables);

@Component({
  selector: 'app-rapports',
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss']
})
export class RapportsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Références aux graphiques
  @ViewChild('conformiteChart') conformiteChartRef!: ElementRef;
  @ViewChild('performanceChart') performanceChartRef!: ElementRef;
  @ViewChild('tendanceChart') tendanceChartRef!: ElementRef;
  @ViewChild('risqueChart') risqueChartRef!: ElementRef;
  @ViewChild('delaiChart') delaiChartRef!: ElementRef;
  @ViewChild('kpiChart') kpiChartRef!: ElementRef;
  @ViewChild('statutChart') statutChartRef!: ElementRef;

  // Références aux modales
  @ViewChild('nouveauRapportModal') nouveauRapportModal!: TemplateRef<any>;
  @ViewChild('previewRapportModal') previewRapportModal!: TemplateRef<any>;

  // Données
  fichesQualite: FicheQualite[] = [];
  fichesSuivi: FicheSuivi[] = [];
  loading = false;
  error: string | null = null;

  // Graphiques
  public conformiteChart!: Chart;
  public performanceChart!: Chart;
  public tendanceChart!: Chart;
  public risqueChart!: Chart;
  public delaiChart!: Chart;
  public kpiChart!: Chart;
  public statutChart!: Chart;

  // Propriétés pour éviter les erreurs Canvas
  private graphiqueConformite: Chart | null = null;
  private graphiquePerformance: Chart | null = null;
  private graphiqueTendance: Chart | null = null;
  private graphiqueKPI: Chart | null = null;

  // Métriques qualité exploitables
  tauxConformiteGlobal = 85;
  delaiMoyenTraitement = 12;
  nombreFichesEnRetard = 8;
  scorePerformanceGlobal = 88;
  indicateurTendance = 'HAUSSE';
  niveauRisqueGlobal = 'MOYEN';
  
  // Statistiques avancées
  totalFichesQualite = 0;
  fichesQualiteTerminees = 0;
  fichesQualiteEnCours = 0;
  fichesQualiteEnRetard = 0;
  
  totalFichesSuivi = 0;
  fichesSuiviTerminees = 0;
  fichesSuiviEnCours = 0;
  fichesSuiviEnRetard = 0;

  // Filtres
  periodeSelectionnee = '6'; // mois
  typeAnalyseSelectionne = 'ALL';
  departementSelectionne = 'ALL';

  // Nouvelles propriétés pour les fonctionnalités avancées
  rapportsGeneres: any[] = [];
  displayedColumns: string[] = ['titre', 'type', 'dateGeneration', 'statut', 'taille', 'actions'];
  alertes: any[] = [];
  alertesCritiques = 0;
  alertesImportantes = 0;
  
  // Propriétés pour l'interface améliorée
  filtresOuverts = true; // Filtres ouverts par défaut
  
  // Propriétés pour les modales
  nouveauRapportForm!: FormGroup;
  generationEnCours = false;
  rapportSelectionne: any = null;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private exportService: ExportService,
    private ficheQualiteService: FicheQualiteService,
    private ficheSuiviService: FicheSuiviService
  ) {
    this.initialiserFormulaire();
  }

  ngOnInit(): void {
    console.log('🚀 Dashboard Rapports Avancé - Chargement...');
    this.chargerToutesLesDonnees();
    this.initialiserRapportsGeneres();
    this.initialiserAlertes();
  }

  /**
   * 📝 INITIALISATION DU FORMULAIRE
   */
  initialiserFormulaire(): void {
    this.nouveauRapportForm = this.formBuilder.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      type: ['', Validators.required],
      dateDebut: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)], // 30 jours avant
      dateFin: [new Date()],
      departements: [['TOUS']],
      inclureKPI: [true],
      inclureGraphiques: [true],
      inclureTableaux: [false],
      inclureAlertes: [true],
      inclureRecommandations: [false],
      inclureHistorique: [false],
      description: ['']
    });
  }

  ngAfterViewInit(): void {
    // Attendre que les éléments canvas soient disponibles
    setTimeout(() => {
      this.creerTousLesGraphiques();
    }, 1000);
  }

  /**
   * Charger toutes les données nécessaires pour les rapports
   */
  chargerToutesLesDonnees(): void {
    this.loading = true;
    this.error = null;

    // Simuler le chargement des données (remplacer par les vrais appels de service)
    setTimeout(() => {
      // Données simulées pour les fiches qualité
      this.fichesQualite = [
        { 
          id: '1', 
          titre: 'Fiche Qualité 1', 
          description: 'Description 1', 
          typeFiche: 'AUDIT', 
          statut: 'TERMINE', 
          responsable: 'User1', 
          dateEcheance: new Date() 
        } as FicheQualite,
        { 
          id: '2', 
          titre: 'Fiche Qualité 2', 
          description: 'Description 2', 
          typeFiche: 'CONTROLE', 
          statut: 'EN_COURS', 
          responsable: 'User2', 
          dateEcheance: new Date() 
        } as FicheQualite,
        { 
          id: '3', 
          titre: 'Fiche Qualité 3', 
          description: 'Description 3', 
          typeFiche: 'AMELIORATION', 
          statut: 'EN_RETARD', 
          responsable: 'User3', 
          dateEcheance: new Date() 
        } as FicheQualite
      ];

      // Données simulées pour les fiches de suivi
      this.fichesSuivi = [
        { 
          id: '1', 
          ficheId: 'F001', 
          dateSuivi: new Date(), 
          etatAvancement: 'TERMINE', 
          problemes: '', 
          decisions: '', 
          indicateursKpi: '', 
          delaiTraitementJours: 10, 
          ajoutePar: 'User1' 
        } as FicheSuivi,
        { 
          id: '2', 
          ficheId: 'F002', 
          dateSuivi: new Date(), 
          etatAvancement: 'EN_COURS', 
          problemes: '', 
          decisions: '', 
          indicateursKpi: '', 
          delaiTraitementJours: 15, 
          ajoutePar: 'User2' 
        } as FicheSuivi,
        { 
          id: '3', 
          ficheId: 'F003', 
          dateSuivi: new Date(), 
          etatAvancement: 'EN_RETARD', 
          problemes: '', 
          decisions: '', 
          indicateursKpi: '', 
          delaiTraitementJours: 25, 
          ajoutePar: 'User3' 
        } as FicheSuivi
      ];

      this.calculerStatistiquesQualite();
      this.calculerStatistiquesSuivi();
      this.calculerMetriquesQualite();
      this.calculerMetriquesSuivi();
      
      this.loading = false;
      
      // Recréer les graphiques avec les nouvelles données
      setTimeout(() => {
        this.creerTousLesGraphiques();
      }, 100);
      
      console.log('📊 Données chargées avec succès');
    }, 1000);
  }

  /**
   * Calculer les statistiques des fiches qualité
   */
  calculerStatistiquesQualite(): void {
    this.totalFichesQualite = this.fichesQualite.length;
    this.fichesQualiteTerminees = this.fichesQualite.filter(f => f.statut === 'TERMINE').length;
    this.fichesQualiteEnCours = this.fichesQualite.filter(f => f.statut === 'EN_COURS').length;
    this.fichesQualiteEnRetard = this.fichesQualite.filter(f => f.statut === 'EN_RETARD').length;
  }

  /**
   * Calculer les statistiques des fiches de suivi
   */
  calculerStatistiquesSuivi(): void {
    this.totalFichesSuivi = this.fichesSuivi.length;
    this.fichesSuiviTerminees = this.fichesSuivi.filter(f => f.etatAvancement === 'TERMINE').length;
    this.fichesSuiviEnCours = this.fichesSuivi.filter(f => f.etatAvancement === 'EN_COURS').length;
    this.fichesSuiviEnRetard = this.fichesSuivi.filter(f => f.etatAvancement === 'EN_RETARD').length;
  }

  /**
   * Calculer les métriques de qualité exploitables
   */
  calculerMetriquesQualite(): void {
    if (this.fichesQualite.length === 0) return;

    // Calculer le taux de conformité global
    const fichesConformes = this.fichesQualiteTerminees;
    this.tauxConformiteGlobal = Math.round((fichesConformes / this.totalFichesQualite) * 100);

    // Calculer le score de performance global
    this.scorePerformanceGlobal = Math.min(100, Math.max(0, 
      this.tauxConformiteGlobal + (Math.random() - 0.5) * 10
    ));

    // Déterminer la tendance
    if (this.tauxConformiteGlobal >= 85) {
      this.indicateurTendance = 'HAUSSE';
    } else if (this.tauxConformiteGlobal < 70) {
      this.indicateurTendance = 'BAISSE';
    } else {
      this.indicateurTendance = 'STABLE';
    }

    // Déterminer le niveau de risque
    if (this.tauxConformiteGlobal >= 90) {
      this.niveauRisqueGlobal = 'FAIBLE';
    } else if (this.tauxConformiteGlobal >= 75) {
      this.niveauRisqueGlobal = 'MOYEN';
    } else {
      this.niveauRisqueGlobal = 'ÉLEVÉ';
    }

    console.log('📊 Métriques qualité calculées:', {
      tauxConformite: this.tauxConformiteGlobal,
      scorePerformance: this.scorePerformanceGlobal,
      tendance: this.indicateurTendance,
      risque: this.niveauRisqueGlobal
    });
  }

  /**
   * Calculer les métriques de suivi exploitables
   */
  calculerMetriquesSuivi(): void {
    if (this.fichesSuivi.length === 0) return;

    // Calculer le délai moyen de traitement
    let totalDelai = 0;
    let fichesAvecDelai = 0;

    this.fichesSuivi.forEach(suivi => {
      if (suivi.delaiTraitementJours && suivi.delaiTraitementJours > 0) {
        totalDelai += suivi.delaiTraitementJours;
        fichesAvecDelai++;
      }
    });

    this.delaiMoyenTraitement = fichesAvecDelai > 0 ? 
      Math.round(totalDelai / fichesAvecDelai) : 0;

    // Calculer le nombre de fiches en retard
    this.nombreFichesEnRetard = this.fichesSuiviEnRetard;

    console.log('⏱️ Métriques suivi calculées:', {
      delaiMoyen: this.delaiMoyenTraitement,
      fichesEnRetard: this.nombreFichesEnRetard
    });
  }

  /**
   * Initialiser les rapports générés (données de démonstration)
   */
  initialiserRapportsGeneres(): void {
    this.rapportsGeneres = [
      {
        id: 1,
        titre: 'Rapport Mensuel Qualité - Novembre 2024',
        type: 'MENSUEL',
        dateGeneration: new Date(),
        statut: 'GÉNÉRÉ',
        taille: '2.3 MB',
        auteur: 'Système'
      },
      {
        id: 2,
        titre: 'Analyse Performance Trimestrielle',
        type: 'TRIMESTRIEL',
        dateGeneration: new Date(Date.now() - 86400000),
        statut: 'EN_COURS',
        taille: '1.8 MB',
        auteur: 'Pilote Qualité'
      },
      {
        id: 3,
        titre: 'Rapport IA - Prédictions Risques',
        type: 'IA_PREDICTIF',
        dateGeneration: new Date(Date.now() - 172800000),
        statut: 'GÉNÉRÉ',
        taille: '4.1 MB',
        auteur: 'IA Engine'
      }
    ];
  }

  /**
   * Initialiser les alertes et notifications
   */
  initialiserAlertes(): void {
    this.alertes = [
      {
        id: 1,
        titre: 'Seuil de Conformité Critique',
        description: 'Le taux de conformité est descendu sous les 75% pour le département Production',
        niveau: 'CRITIQUE',
        dateCreation: new Date(),
        statut: 'ACTIVE'
      },
      {
        id: 2,
        titre: 'Délais de Traitement Élevés',
        description: 'Augmentation de 15% des délais moyens de traitement ce mois-ci',
        niveau: 'IMPORTANT',
        dateCreation: new Date(Date.now() - 3600000),
        statut: 'ACTIVE'
      }
    ];

    this.alertesCritiques = this.alertes.filter(a => a.niveau === 'CRITIQUE').length;
    this.alertesImportantes = this.alertes.filter(a => a.niveau === 'IMPORTANT').length;
  }

  /**
   * 🔙 NAVIGATION
   */
  retourDashboard(): void {
    console.log('🔙 Retour au dashboard fiche-suivi...');
    this.router.navigate(['/fiche-suivi/dashboard']);
    this.snackBar.open('Retour au dashboard fiche-suivi', 'Fermer', {
      duration: 2000
    });
  }

  /**
   * 🎛️ GESTION DE L'INTERFACE
   */
  toggleFilters(): void {
    this.filtresOuverts = !this.filtresOuverts;
    console.log('🎛️ Filtres:', this.filtresOuverts ? 'Ouverts' : 'Fermés');
  }

  /**
   * 📊 GESTION DES FILTRES
   */
  onPeriodeChange(): void {
    console.log('🔄 Changement de période:', this.periodeSelectionnee);
    this.chargerToutesLesDonnees();
    this.snackBar.open(`Période changée: ${this.getPeriodeLabel()}`, 'Fermer', {
      duration: 2000
    });
  }

  onTypeAnalyseChange(): void {
    console.log('🔄 Changement de type d\'analyse:', this.typeAnalyseSelectionne);
    this.creerTousLesGraphiques();
    this.snackBar.open(`Type d'analyse: ${this.getTypeAnalyseLabel()}`, 'Fermer', {
      duration: 2000
    });
  }

  onDepartementChange(): void {
    console.log('🔄 Changement de département:', this.departementSelectionne);
    this.chargerToutesLesDonnees();
    this.snackBar.open(`Département: ${this.getDepartementLabel()}`, 'Fermer', {
      duration: 2000
    });
  }

  appliquerFiltres(): void {
    console.log('🎯 Application des filtres...');
    this.loading = true;
    
    setTimeout(() => {
      this.chargerToutesLesDonnees();
      this.snackBar.open('Filtres appliqués avec succès', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 1000);
  }

  reinitialiserFiltres(): void {
    this.periodeSelectionnee = '6';
    this.typeAnalyseSelectionne = 'ALL';
    this.departementSelectionne = 'ALL';
    this.appliquerFiltres();
  }

  /**
   * 📈 GESTION DES KPI
   */
  voirDetailKPI(typeKPI: string): void {
    console.log('🔍 Voir détail KPI:', typeKPI);
    this.snackBar.open(`Détail du KPI ${typeKPI} affiché`, 'Fermer', {
      duration: 2000
    });
  }

  /**
   * 📋 GESTION DES RAPPORTS
   */
  genererNouveauRapport(): void {
    console.log('📝 Ouverture de la modale de génération de rapport...');
    this.dialogRef = this.dialog.open(this.nouveauRapportModal, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });
  }

  /**
   * 📝 CONFIRMER LA GÉNÉRATION DU RAPPORT
   */
  confirmerGenerationRapport(): void {
    if (this.nouveauRapportForm.valid) {
      console.log('✅ Génération du rapport confirmée...');
      this.generationEnCours = true;
      
      const formData = this.nouveauRapportForm.value;
      
      // Simuler la génération du rapport
      setTimeout(() => {
        const nouveauRapport = {
          id: this.rapportsGeneres.length + 1,
          titre: formData.titre,
          type: formData.type,
          dateGeneration: new Date(),
          statut: 'GÉNÉRÉ',
          taille: this.calculerTailleRapport(formData),
          auteur: 'Pilote Qualité',
          description: formData.description,
          departements: formData.departements,
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin,
          sections: {
            kpi: formData.inclureKPI,
            graphiques: formData.inclureGraphiques,
            tableaux: formData.inclureTableaux,
            alertes: formData.inclureAlertes,
            recommandations: formData.inclureRecommandations,
            historique: formData.inclureHistorique
          }
        };

        this.rapportsGeneres.unshift(nouveauRapport);
        this.generationEnCours = false;
        this.fermerModaleNouveauRapport();

        this.snackBar.open('Nouveau rapport généré avec succès', 'Prévisualiser', {
          duration: 5000,
          panelClass: ['success-snackbar']
        }).onAction().subscribe(() => {
          this.previsualiserRapport(nouveauRapport);
        });
      }, 3000);
    } else {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * 📐 CALCULER LA TAILLE DU RAPPORT
   */
  calculerTailleRapport(formData: any): string {
    let taille = 0.5; // Taille de base en MB
    
    if (formData.inclureKPI) taille += 0.2;
    if (formData.inclureGraphiques) taille += 1.0;
    if (formData.inclureTableaux) taille += 0.8;
    if (formData.inclureAlertes) taille += 0.3;
    if (formData.inclureRecommandations) taille += 0.4;
    if (formData.inclureHistorique) taille += 1.2;
    
    // Ajouter selon le nombre de départements
    if (formData.departements.includes('TOUS')) {
      taille += 0.5;
    } else {
      taille += formData.departements.length * 0.1;
    }
    
    return taille.toFixed(1) + ' MB';
  }

  /**
   * ❌ FERMER LA MODALE NOUVEAU RAPPORT
   */
  fermerModaleNouveauRapport(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    this.generationEnCours = false;
    this.nouveauRapportForm.reset();
    this.initialiserFormulaire();
  }

  telechargerRapport(rapport: any): void {
    console.log('⬇️ Téléchargement du rapport:', rapport.titre);
    
    // Simuler le téléchargement
    this.snackBar.open(`Préparation du téléchargement...`, 'Fermer', {
      duration: 2000
    });
    
    setTimeout(() => {
      // Créer un lien de téléchargement simulé
      const element = document.createElement('a');
      const filename = `${rapport.titre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Simuler le contenu du fichier
      const content = this.genererContenuRapport(rapport);
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      element.href = url;
      element.download = filename;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open(`Rapport "${rapport.titre}" téléchargé avec succès`, 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 1500);
  }

  /**
   * 📄 GÉNÉRER LE CONTENU DU RAPPORT
   */
  genererContenuRapport(rapport: any): string {
    return `
RAPPORT QUALITÉ - ${rapport.titre}
=====================================

Date de génération: ${rapport.dateGeneration.toLocaleDateString()}
Type: ${rapport.type}
Auteur: ${rapport.auteur}
Taille: ${rapport.taille}

INDICATEURS CLÉS:
- Taux de Conformité: ${this.tauxConformiteGlobal}%
- Score Performance: ${this.scorePerformanceGlobal}%
- Délai Moyen: ${this.delaiMoyenTraitement} jours
- Fiches en Retard: ${this.nombreFichesEnRetard}

TENDANCES:
- Indicateur: ${this.indicateurTendance}
- Niveau de Risque: ${this.niveauRisqueGlobal}

ALERTES:
- Critiques: ${this.alertesCritiques}
- Importantes: ${this.alertesImportantes}

STATISTIQUES:
- Total Fiches Qualité: ${this.totalFichesQualite}
- Total Fiches Suivi: ${this.totalFichesSuivi}
- Fiches Terminées: ${this.fichesQualiteTerminees + this.fichesSuiviTerminees}
- Fiches En Cours: ${this.fichesQualiteEnCours + this.fichesSuiviEnCours}

=====================================
Généré automatiquement par le système Suivi Qualité
    `;
  }

  previsualiserRapport(rapport: any): void {
    console.log('👁️ Prévisualisation du rapport:', rapport.titre);
    this.rapportSelectionne = rapport;
    
    this.dialogRef = this.dialog.open(this.previewRapportModal, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });
  }

  /**
   * ❌ FERMER LA MODALE PREVIEW
   */
  fermerModalePreview(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    this.rapportSelectionne = null;
  }

  partagerRapport(rapport?: any): void {
    const titre = rapport ? rapport.titre : 'Rapport actuel';
    console.log('📤 Partage du rapport:', titre);
    this.snackBar.open(`Options de partage pour "${titre}"`, 'Fermer', {
      duration: 3000
    });
  }

  dupliquerRapport(rapport: any): void {
    console.log('📋 Duplication du rapport:', rapport.titre);
    const rapportDuplique = {
      ...rapport,
      id: this.rapportsGeneres.length + 1,
      titre: `${rapport.titre} (Copie)`,
      dateGeneration: new Date()
    };
    
    this.rapportsGeneres.unshift(rapportDuplique);
    this.snackBar.open('Rapport dupliqué avec succès', 'Fermer', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  archiverRapport(rapport: any): void {
    console.log('📦 Archivage du rapport:', rapport.titre);
    rapport.statut = 'ARCHIVÉ';
    this.snackBar.open('Rapport archivé', 'Annuler', {
      duration: 3000
    });
  }

  supprimerRapport(rapport: any): void {
    console.log('🗑️ Suppression du rapport:', rapport.titre);
    const index = this.rapportsGeneres.indexOf(rapport);
    if (index > -1) {
      this.rapportsGeneres.splice(index, 1);
      this.snackBar.open('Rapport supprimé', 'Annuler', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  selectionnerRapport(rapport: any): void {
    console.log('✅ Sélection du rapport:', rapport.titre);
    this.previsualiserRapport(rapport);
  }

  /**
   * 🖨️ FONCTIONS D'EXPORT ET IMPRESSION AMÉLIORÉES
   */
  exportPDF(): void { 
    console.log('📄 Export PDF du rapport complet...');
    this.loading = true;
    
    // Simuler l'export PDF
    setTimeout(() => {
      const rapportData = {
        title: `Rapport Qualité Complet - ${new Date().toLocaleDateString()}`,
        periode: this.getPeriodeLabel(),
        departement: this.getDepartementLabel(),
        typeAnalyse: this.getTypeAnalyseLabel(),
        metriques: {
          tauxConformite: this.tauxConformiteGlobal,
          delaiMoyen: this.delaiMoyenTraitement,
          scorePerformance: this.scorePerformanceGlobal,
          niveauRisque: this.niveauRisqueGlobal,
          totalFiches: this.totalFichesQualite + this.totalFichesSuivi,
          fichesTerminees: this.fichesQualiteTerminees + this.fichesSuiviTerminees,
          fichesEnCours: this.fichesQualiteEnCours + this.fichesSuiviEnCours,
          fichesEnRetard: this.fichesQualiteEnRetard + this.fichesSuiviEnRetard
        },
        dateGeneration: new Date()
      };
      
      this.exportService.exportCompleteDashboardReport(rapportData);
      this.loading = false;
      
      this.snackBar.open('Rapport PDF généré avec succès', 'Télécharger', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    }, 2000);
  }
  
  exportExcel(): void { 
    console.log('📊 Export Excel des données...');
    this.loading = true;
    
    setTimeout(() => {
      const donneesExport = [
        { 
          indicateur: 'Taux de Conformité', 
          valeur: this.tauxConformiteGlobal, 
          unite: '%',
          objectif: 90,
          ecart: this.tauxConformiteGlobal - 90,
          tendance: this.indicateurTendance
        },
        { 
          indicateur: 'Délai Moyen', 
          valeur: this.delaiMoyenTraitement, 
          unite: 'jours',
          objectif: 10,
          ecart: this.delaiMoyenTraitement - 10,
          tendance: this.delaiMoyenTraitement <= 10 ? 'AMÉLIORATION' : 'DÉGRADATION'
        },
        { 
          indicateur: 'Score Performance', 
          valeur: this.scorePerformanceGlobal, 
          unite: '%',
          objectif: 85,
          ecart: this.scorePerformanceGlobal - 85,
          tendance: this.scorePerformanceGlobal >= 85 ? 'OBJECTIF ATTEINT' : 'SOUS OBJECTIF'
        },
        { 
          indicateur: 'Fiches Qualité Total', 
          valeur: this.totalFichesQualite, 
          unite: 'nb',
          objectif: null,
          ecart: null,
          tendance: 'STABLE'
        },
        { 
          indicateur: 'Fiches Suivi Total', 
          valeur: this.totalFichesSuivi, 
          unite: 'nb',
          objectif: null,
          ecart: null,
          tendance: 'STABLE'
        }
      ];
      
      this.exportService.exportPerformanceData(donneesExport);
      this.loading = false;
      
      this.snackBar.open('Données Excel exportées avec succès', 'Ouvrir', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    }, 1500);
  }

  imprimerRapport(): void {
    console.log('🖨️ Impression du rapport...');
    window.print();
  }

  planifierRapport(): void {
    console.log('⏰ Planification de rapport...');
    this.snackBar.open('Fonctionnalité de planification en développement', 'Fermer', {
      duration: 3000
    });
  }

  /**
   * 🔔 GESTION DES ALERTES
   */
  traiterAlerte(alerte: any): void {
    console.log('✅ Traitement de l\'alerte:', alerte.titre);
    alerte.statut = 'TRAITÉE';
    this.snackBar.open('Alerte marquée comme traitée', 'Fermer', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  reporterAlerte(alerte: any): void {
    console.log('⏰ Report de l\'alerte:', alerte.titre);
    this.snackBar.open('Alerte reportée à plus tard', 'Fermer', {
      duration: 2000
    });
  }

  /**
   * 🎨 FONCTIONS D'AIDE POUR L'AFFICHAGE
   */
  getRapportIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'MENSUEL': 'calendar_month',
      'TRIMESTRIEL': 'assessment',
      'IA_PREDICTIF': 'psychology',
      'EXECUTIF': 'business_center',
      'PERSONNALISE': 'tune',
      'DEFAULT': 'description'
    };
    return icons[type] || icons['DEFAULT'];
  }

  getRapportTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'MENSUEL': 'primary',
      'TRIMESTRIEL': 'accent',
      'IA_PREDICTIF': 'warn',
      'EXECUTIF': 'primary',
      'PERSONNALISE': 'accent'
    };
    return colors[type] || 'primary';
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'GÉNÉRÉ': 'primary',
      'EN_COURS': 'accent',
      'ARCHIVÉ': 'warn',
      'ERREUR': 'warn'
    };
    return colors[statut] || 'primary';
  }

  getAlerteIcon(niveau: string): string {
    const icons: { [key: string]: string } = {
      'CRITIQUE': 'error',
      'IMPORTANT': 'warning',
      'INFO': 'info',
      'SUCCESS': 'check_circle'
    };
    return icons[niveau] || 'info';
  }

  getAlerteColor(niveau: string): string {
    const colors: { [key: string]: string } = {
      'CRITIQUE': 'warn',
      'IMPORTANT': 'accent',
      'INFO': 'primary',
      'SUCCESS': 'primary'
    };
    return colors[niveau] || 'primary';
  }

  getRisqueClass(): string {
    const classes: { [key: string]: string } = {
      'FAIBLE': 'success',
      'MOYEN': 'warning',
      'ÉLEVÉ': 'error'
    };
    return classes[this.niveauRisqueGlobal] || 'warning';
  }

  /**
   * 🏷️ MÉTHODES UTILITAIRES POUR LES LABELS
   */
  getPeriodeLabel(): string {
    const labels: { [key: string]: string } = {
      '1': 'Dernier mois',
      '3': '3 derniers mois',
      '6': '6 derniers mois',
      '12': 'Dernière année',
      'custom': 'Période personnalisée'
    };
    return labels[this.periodeSelectionnee] || 'Période inconnue';
  }

  getTypeAnalyseLabel(): string {
    const labels: { [key: string]: string } = {
      'ALL': 'Toutes les analyses',
      'CONFORMITE': 'Conformité',
      'PERFORMANCE': 'Performance',
      'RISQUES': 'Gestion des risques',
      'DELAIS': 'Délais de traitement',
      'QUALITE': 'Indicateurs qualité'
    };
    return labels[this.typeAnalyseSelectionne] || 'Type inconnu';
  }

  getDepartementLabel(): string {
    const labels: { [key: string]: string } = {
      'ALL': 'Tous les départements',
      'PRODUCTION': 'Production',
      'QUALITE': 'Qualité',
      'LOGISTIQUE': 'Logistique',
      'RH': 'Ressources Humaines',
      'IT': 'Informatique'
    };
    return labels[this.departementSelectionne] || 'Département inconnu';
  }

  /**
   * 📊 CRÉATION DES GRAPHIQUES AVANCÉS
   */
  creerTousLesGraphiques(): void {
    console.log('📊 Création de tous les graphiques...');
    
    // Détruire les graphiques existants
    this.detruireGraphiques();
    
    // Attendre que les éléments soient disponibles
    setTimeout(() => {
      this.creerGraphiqueConformite();
      this.creerGraphiquePerformance();
      this.creerGraphiqueTendance();
      this.creerGraphiqueRisques();
      this.creerGraphiqueDelais();
      this.creerGraphiqueKPI();
      this.creerGraphiqueStatut();
    }, 500);
  }

  private detruireGraphiques(): void {
    if (this.conformiteChart) this.conformiteChart.destroy();
    if (this.performanceChart) this.performanceChart.destroy();
    if (this.tendanceChart) this.tendanceChart.destroy();
    if (this.risqueChart) this.risqueChart.destroy();
    if (this.delaiChart) this.delaiChart.destroy();
    if (this.kpiChart) this.kpiChart.destroy();
    if (this.statutChart) this.statutChart.destroy();
  }

  private creerGraphiqueConformite(): void {
    const canvas = this.conformiteChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.conformiteChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Taux de Conformité (%)',
          data: [78, 82, 85, 88, 91, 89, 92, 94, 90, 93, 95, this.tauxConformiteGlobal],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  private creerGraphiquePerformance(): void {
    const canvas = this.performanceChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.performanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Production', 'Qualité', 'Logistique', 'RH', 'IT'],
        datasets: [{
          label: 'Score Performance',
          data: [85, 92, 78, 88, 91],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  private creerGraphiqueTendance(): void {
    const canvas = this.tendanceChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.tendanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
        datasets: [
          {
            label: 'Conformité',
            data: [85, 87, 89, 91, 88, 92, 94, 93],
            borderColor: '#4CAF50',
            tension: 0.4
          },
          {
            label: 'Performance',
            data: [82, 84, 86, 89, 87, 90, 92, 91],
            borderColor: '#FF9800',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  private creerGraphiqueRisques(): void {
    const canvas = this.risqueChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.risqueChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Risques Identifiés',
          data: [
            { x: 3, y: 7 },
            { x: 5, y: 4 },
            { x: 8, y: 8 },
            { x: 2, y: 3 },
            { x: 6, y: 6 }
          ],
          backgroundColor: '#F44336',
          borderColor: '#D32F2F'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Probabilité'
            },
            min: 0,
            max: 10
          },
          y: {
            title: {
              display: true,
              text: 'Impact'
            },
            min: 0,
            max: 10
          }
        }
      }
    });
  }

  private creerGraphiqueDelais(): void {
    const canvas = this.delaiChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.delaiChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['0-5j', '6-10j', '11-15j', '16-20j', '21-30j', '+30j'],
        datasets: [{
          label: 'Nombre de Fiches',
          data: [25, 35, 20, 15, 8, 3],
          backgroundColor: '#9C27B0'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  private creerGraphiqueKPI(): void {
    const canvas = this.kpiChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.kpiChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Conformité', 'Performance', 'Délais', 'Qualité', 'Risques', 'Satisfaction'],
        datasets: [{
          label: 'Scores Actuels',
          data: [this.tauxConformiteGlobal, this.scorePerformanceGlobal, 85, 88, 92, 87],
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196F3',
          pointBackgroundColor: '#2196F3'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  private creerGraphiqueStatut(): void {
    const canvas = this.statutChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.statutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Terminées', 'En Cours', 'En Retard', 'Bloquées'],
        datasets: [{
          data: [
            this.fichesQualiteTerminees + this.fichesSuiviTerminees,
            this.fichesQualiteEnCours + this.fichesSuiviEnCours,
            this.fichesQualiteEnRetard + this.fichesSuiviEnRetard,
            5
          ],
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FF9800',
            '#F44336'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Détruire les graphiques
    this.detruireGraphiques();
  }
}