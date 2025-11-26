import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Étendre le type jsPDF pour inclure autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  // Exporter les graphiques en PDF
  exportChartsToPDF(data: any, filename: string = 'dashboard-ia.pdf'): void {
    const doc = new jsPDF();
    
    // Titre principal
    doc.setFontSize(20);
    doc.text('Dashboard IA - Rapport Qualité', 20, 20);
    
    // Date de génération
    doc.setFontSize(12);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);
    
    // Métriques principales
    doc.setFontSize(16);
    doc.text('Métriques Principales', 20, 55);
    
    doc.setFontSize(12);
    let yPosition = 70;
    
    if (data.scoreIA !== undefined) {
      doc.text(`Score IA: ${data.scoreIA.toFixed(1)}%`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.confiance !== undefined) {
      doc.text(`Niveau de Confiance: ${data.confiance.toFixed(1)}%`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.tauxConformite !== undefined) {
      doc.text(`Taux de Conformité: ${data.tauxConformite.toFixed(1)}%`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.efficacite !== undefined) {
      doc.text(`Efficacité Processus: ${data.efficacite.toFixed(1)}%`, 20, yPosition);
      yPosition += 10;
    }
    
    // Alertes et statistiques
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Alertes et Statistiques', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    
    if (data.alertes !== undefined) {
      doc.text(`Alertes Critiques: ${data.alertes}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.fichesEnRetard !== undefined) {
      doc.text(`Fiches en Retard: ${data.fichesEnRetard}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.fichesBloquees !== undefined) {
      doc.text(`Fiches Bloquées: ${data.fichesBloquees}`, 20, yPosition);
      yPosition += 10;
    }
    
    // Analyses IA
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Analyses IA', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    
    if (data.predictions !== undefined) {
      doc.text(`Prédictions de Risques: ${data.predictions}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.recommandations !== undefined) {
      doc.text(`Recommandations IA: ${data.recommandations}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.optimisations !== undefined) {
      doc.text(`Optimisations: ${data.optimisations}`, 20, yPosition);
      yPosition += 10;
    }
    
    // Tableau récapitulatif
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Récapitulatif des Métriques', 20, yPosition);
    
    const tableData = [
      ['Métrique', 'Valeur', 'Statut'],
      ['Score IA', `${data.scoreIA?.toFixed(1) || 'N/A'}%`, this.getStatusText(data.scoreIA)],
      ['Confiance', `${data.confiance?.toFixed(1) || 'N/A'}%`, this.getStatusText(data.confiance)],
      ['Conformité', `${data.tauxConformite?.toFixed(1) || 'N/A'}%`, this.getStatusText(data.tauxConformite)],
      ['Efficacité', `${data.efficacite?.toFixed(1) || 'N/A'}%`, this.getStatusText(data.efficacite)]
    ];
    
    autoTable(doc, {
      startY: yPosition + 10,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    // Sauvegarder le PDF
    doc.save(filename);
  }

  // Exporter les données en Excel
  exportDataToExcel(data: any[], filename: string = 'dashboard-ia.xlsx'): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    
    // Ajuster la largeur des colonnes
    const columnWidths: Array<{ wch: number }> = [];
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      headers.forEach(header => {
        columnWidths.push({ wch: Math.max(header.length + 2, 15) });
      });
    }
    worksheet['!cols'] = columnWidths;
    
    const workbook: XLSX.WorkBook = { 
      Sheets: { 'Dashboard IA': worksheet }, 
      SheetNames: ['Dashboard IA'] 
    };
    
    XLSX.writeFile(workbook, filename);
  }

  // Exporter un graphique spécifique en image
  exportChartAsImage(canvas: HTMLCanvasElement, filename: string = 'chart.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Exporter les données de tendance
  exportTrendData(trendData: any, filename: string = 'tendances-ia.xlsx'): void {
    const data = [];
    
    if (trendData.labels && trendData.datasets) {
      const labels = trendData.labels;
      const datasets = trendData.datasets;
      
      for (let i = 0; i < labels.length; i++) {
        const row: any = { 'Période': labels[i] };
        
        datasets.forEach((dataset: any, index: number) => {
          if (dataset.data && dataset.data[i] !== undefined) {
            row[dataset.label || `Dataset ${index + 1}`] = dataset.data[i];
          }
        });
        
        data.push(row);
      }
    }
    
    this.exportDataToExcel(data, filename);
  }

  // Exporter les prédictions de risques
  exportRiskPredictions(predictions: any[], filename: string = 'predictions-risques.xlsx'): void {
    const data = predictions.map(prediction => ({
      'Niveau de Risque': prediction.niveau,
      'Probabilité': `${prediction.probabilite}%`,
      'Description': prediction.description,
      'Impact': prediction.impact,
      'Recommandations': prediction.recommandations?.join('; ') || ''
    }));
    
    this.exportDataToExcel(data, filename);
  }

  // Exporter les recommandations IA
  exportAIRecommendations(recommendations: any[], filename: string = 'recommandations-ia.xlsx'): void {
    const data = recommendations.map(rec => ({
      'Type': rec.type,
      'Titre': rec.titre,
      'Description': rec.description,
      'Priorité': rec.priorite,
      'Impact Attendu': rec.impactAttendu,
      'Délai Estimé': rec.delaiEstime,
      'Actions': rec.actions?.join('; ') || ''
    }));
    
    this.exportDataToExcel(data, filename);
  }

  // Exporter les optimisations de processus
  exportProcessOptimizations(optimizations: any[], filename: string = 'optimisations-processus.xlsx'): void {
    const data = optimizations.map(opt => ({
      'Processus': opt.processus,
      'Efficacité Actuelle': `${opt.efficaciteActuelle}%`,
      'Efficacité Optimale': `${opt.efficaciteOptimale}%`,
      'Gains Potentiels': opt.gainsPotentiels?.join('; ') || '',
      'Actions d\'Optimisation': opt.actionsOptimisation?.join('; ') || '',
      'Délai d\'Implémentation': opt.delaiImplementation
    }));
    
    this.exportDataToExcel(data, filename);
  }

  // Exporter un rapport complet du dashboard IA
  exportCompleteDashboardReport(dashboardData: any, filename: string = 'rapport-dashboard-ia.pdf'): void {
    const doc = new jsPDF();
    
    // Page de titre
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(dashboardData.title || 'Rapport Qualité Complet', 20, 30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Système de Suivi des Processus Qualité', 20, 45);
    
    doc.setFontSize(12);
    doc.text(`Type: ${dashboardData.type || 'Rapport Standard'}`, 20, 60);
    doc.text(`Auteur: ${dashboardData.auteur || 'Système'}`, 20, 70);
    doc.text(`Date de génération: ${dashboardData.dateGeneration || new Date().toLocaleDateString('fr-FR')}`, 20, 80);
    doc.text(`Période: ${dashboardData.periode || 'Non spécifiée'}`, 20, 90);
    doc.text(`Département: ${dashboardData.departement || 'Tous'}`, 20, 100);
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 110, 190, 110);
    
    // Résumé exécutif
    doc.addPage();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Résumé Exécutif', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Ce rapport présente une analyse complète des indicateurs qualité', 20, 35);
    doc.text('pour la période sélectionnée. Les données incluent les métriques', 20, 45);
    doc.text('de conformité, performance et gestion des risques.', 20, 55);
    
    // Métriques principales
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Indicateurs Clés de Performance (KPI)', 20, 75);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    if (dashboardData.metriques) {
      const m = dashboardData.metriques;
      let yPos = 95;
      
      doc.text(`• Taux de Conformité: ${m.tauxConformite || 0}%`, 25, yPos);
      yPos += 10;
      doc.text(`• Score Performance: ${m.scorePerformance || 0}%`, 25, yPos);
      yPos += 10;
      doc.text(`• Délai Moyen de Traitement: ${m.delaiMoyen || 0} jours`, 25, yPos);
      yPos += 10;
      doc.text(`• Niveau de Risque: ${m.niveauRisque || 'N/A'}`, 25, yPos);
      yPos += 10;
      doc.text(`• Tendance: ${m.tendance || 'STABLE'}`, 25, yPos);
      yPos += 15;
      
      // Statistiques détaillées
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Statistiques Détaillées:', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total des Fiches: ${m.totalFiches || 0}`, 25, yPos);
      yPos += 10;
      doc.text(`• Fiches Terminées: ${m.fichesTerminees || 0}`, 25, yPos);
      yPos += 10;
      doc.text(`• Fiches En Cours: ${m.fichesEnCours || 0}`, 25, yPos);
      yPos += 10;
      doc.text(`• Fiches En Retard: ${m.fichesEnRetard || 0}`, 25, yPos);
    }
    
    // Alertes
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Alertes et Notifications', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    if (dashboardData.alertes) {
      const a = dashboardData.alertes;
      doc.text(`• Alertes Critiques: ${a.critiques || 0}`, 25, 40);
      doc.text(`• Alertes Importantes: ${a.importantes || 0}`, 25, 50);
    }
    
    // Statistiques
    if (dashboardData.statistiques) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Statistiques Globales', 20, 75);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const s = dashboardData.statistiques;
      let yPos = 95;
      
      doc.text(`• Total Fiches Qualité: ${s.totalFichesQualite || 0}`, 25, yPos);
      yPos += 10;
      doc.text(`• Total Fiches Suivi: ${s.totalFichesSuivi || 0}`, 25, yPos);
      yPos += 10;
      doc.text(`• Fiches Terminées: ${s.fichesTerminees || 0}`, 25, yPos);
      yPos += 10;
      doc.text(`• Fiches En Cours: ${s.fichesEnCours || 0}`, 25, yPos);
    }
    
    // Tableau récapitulatif
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Tableau Récapitulatif', 20, 20);
    
    const tableData = [];
    if (dashboardData.metriques) {
      const m = dashboardData.metriques;
      tableData.push(
        ['Taux de Conformité', `${m.tauxConformite || 0}%`, this.getStatusText(m.tauxConformite)],
        ['Score Performance', `${m.scorePerformance || 0}%`, this.getStatusText(m.scorePerformance)],
        ['Délai Moyen', `${m.delaiMoyen || 0} jours`, m.delaiMoyen <= 10 ? 'Bon' : 'À améliorer'],
        ['Fiches En Retard', `${m.fichesEnRetard || 0}`, m.fichesEnRetard === 0 ? 'Excellent' : 'Attention']
      );
    }
    
    if (tableData.length > 0) {
      autoTable(doc, {
        startY: 35,
        head: [['Indicateur', 'Valeur', 'Statut']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [102, 126, 234],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 11,
          cellPadding: 5
        }
      });
    }
    
    // Pied de page sur toutes les pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Page ${i} sur ${pageCount}`, 170, 285);
      doc.text('Généré automatiquement par le Système Suivi Qualité', 20, 285);
    }
    
    // Sauvegarder le rapport
    doc.save(filename);
  }

  // Méthodes utilitaires
  private getStatusText(value: number): string {
    if (value === undefined || value === null) return 'N/A';
    if (value >= 85) return 'Excellent';
    if (value >= 70) return 'Bon';
    if (value >= 60) return 'Moyen';
    return 'À améliorer';
  }

  // Exporter les données de performance
  exportPerformanceData(performanceData: any, filename: string = 'performance-qualite.xlsx'): void {
    const data = [
      { 'Métrique': 'Taux de Conformité', 'Valeur': performanceData.conformite || 0, 'Unité': '%', 'Objectif': 90 },
      { 'Métrique': 'Efficacité Processus', 'Valeur': performanceData.efficacite || 0, 'Unité': '%', 'Objectif': 85 },
      { 'Métrique': 'Temps de Traitement Moyen', 'Valeur': performanceData.tempsMoyen || 0, 'Unité': 'jours', 'Objectif': 5 },
      { 'Métrique': 'Fiches en Retard', 'Valeur': performanceData.fichesRetard || 0, 'Unité': 'fiches', 'Objectif': 0 },
      { 'Métrique': 'Fiches Bloquées', 'Valeur': performanceData.fichesBloquees || 0, 'Unité': 'fiches', 'Objectif': 0 }
    ];
    
    this.exportDataToExcel(data, filename);
  }
} 