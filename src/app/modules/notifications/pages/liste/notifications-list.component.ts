import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificationItem, NotificationService } from 'src/app/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class NotificationsListComponent implements OnInit {
  displayedColumns = ['message', 'type', 'dateCreation', 'etat', 'actions'];
  data: NotificationItem[] = [];
  filterType: string = '';
  filterEtat: string = '';
  showAll: boolean = false; // Admin/Pilote peuvent voir toutes les notifications

  getTypeLabel(t?: string): string {
    switch (t) {
      case 'FICHE_SUIVI': return 'Fiche Suivi';
      case 'FICHE_QUALITE': return 'Fiche Qualité';
      case 'RETARD': return 'Retard';
      case 'ALERTE': return 'Alerte';
      default: return 'Autre';
    }
  }

  constructor(
    private router: Router,
    private notifService: NotificationService, 
    public auth: AuthService, 
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('🔔 Chargement des notifications...');
    const role = this.auth.getRole();
    // Activer par défaut "Voir toutes" pour ADMIN et PILOTE_QUALITE
    if (role === 'ADMIN' || role === 'PILOTE_QUALITE') {
      this.showAll = true;
    }
    this.reload();
    // Auto-refresh désactivé pour éviter les rechargements intempestifs
  }

  retourDashboard(): void {
    const role = this.auth.getRole();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'CHEF_PROJET') {
      this.router.navigate(['/fiche-qualite/dashboard']);
    } else if (role === 'PILOTE_QUALITE') {
      this.router.navigate(['/fiche-suivi/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  reload(): void {
    const role = this.auth.getRole();
    const userId = this.auth.getUserId();

    console.log('🔄 Reload notifications - Role:', role, 'UserId:', userId, 'ShowAll:', this.showAll);

    const source$ = (role === 'ADMIN' || role === 'PILOTE_QUALITE') && this.showAll
      ? this.notifService.getAll()
      : (userId ? this.notifService.getByUtilisateur(userId) : undefined);

    if (!source$) {
      console.log('❌ Aucune source de notifications');
      this.data = [];
      return;
    }

    source$.subscribe({
      next: (items) => {
        console.log('✅ Notifications reçues:', items.length, items);
        let res = items;
        if (this.filterType) res = res.filter(n => n.type === this.filterType);
        if (this.filterEtat) res = res.filter(n => this.filterEtat === 'LU' ? n.lu : !n.lu);
        this.data = res;
        console.log('📊 Notifications après filtres:', this.data.length);
      },
      error: (error) => {
        console.error('❌ Erreur chargement notifications:', error);
        this.data = [];
      }
    });
  }

  markAsRead(item: NotificationItem): void {
    if (!item.id || item.lu) return;
    
    // Mise à jour optimiste de l'interface (pas de rechargement)
    const previous = item.lu;
    item.lu = true;
    
    this.notifService.markAsRead(item.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Notification marquée comme lue', 'Fermer', { 
          duration: 2000, 
          panelClass: ['mat-snack-bar-success'] 
        });
        // Pas de reload() - l'interface est déjà à jour !
      },
      error: () => {
        // En cas d'erreur, restaurer l'état précédent
        item.lu = previous;
        this.snackBar.open('❌ Échec du marquage', 'Fermer', { 
          duration: 2500, 
          panelClass: ['mat-snack-bar-error'] 
        });
      }
    });
  }

  delete(item: NotificationItem): void {
    if (!item.id) return;
    
    // Mise à jour optimiste - supprimer immédiatement de l'interface
    const idx = this.data.indexOf(item);
    const backup = [...this.data];
    
    if (idx >= 0) {
      this.data.splice(idx, 1);
      // Forcer la détection de changement
      this.data = [...this.data];
    }
    
    this.notifService.delete(item.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Notification supprimée', 'Fermer', { 
          duration: 2000, 
          panelClass: ['mat-snack-bar-success'] 
        });
        // Pas de reload() - l'interface est déjà à jour !
      },
      error: () => {
        // En cas d'erreur, restaurer la liste complète
        this.data = backup;
        this.snackBar.open('❌ Échec de la suppression', 'Fermer', { 
          duration: 2500, 
          panelClass: ['mat-snack-bar-error'] 
        });
      }
    });
  }

  /**
   * 📧 RELANCER PAR EMAIL
   * Envoie un email de rappel à l'utilisateur concerné par la notification
   * Utile pour relancer une personne sur une fiche en retard ou une action à faire
   */
  relancer(item: NotificationItem): void {
    if (!item.utilisateurId) {
      this.snackBar.open('⚠️ Impossible de relancer : utilisateur non défini', 'Fermer', { 
        duration: 2000 
      });
      return;
    }
    
    // Afficher un message de chargement
    this.snackBar.open('📧 Envoi de l\'email en cours...', '', { 
      duration: 1000 
    });
    
    this.notifService.relancerEmail(item.utilisateurId, item).subscribe({
      next: () => {
        this.snackBar.open('✅ Email de relance envoyé avec succès', 'Fermer', { 
          duration: 3000, 
          panelClass: ['mat-snack-bar-success'] 
        });
        // Pas de reload() - pas besoin de recharger
      },
      error: () => {
        this.snackBar.open('❌ Échec de l\'envoi de l\'email', 'Fermer', { 
          duration: 2500, 
          panelClass: ['mat-snack-bar-error'] 
        });
      }
    });
  }

  getUnreadCount(): number {
    return this.data.filter(n => !n.lu).length;
  }

  getTypeIcon(type?: string): string {
    switch (type) {
      case 'FICHE_SUIVI': return 'assignment_turned_in';
      case 'FICHE_QUALITE': return 'assignment';
      case 'RETARD': return 'schedule';
      case 'ALERTE': return 'warning';
      default: return 'notifications';
    }
  }

  getTypeClass(type?: string): string {
    switch (type) {
      case 'FICHE_SUIVI': return 'type-suivi';
      case 'FICHE_QUALITE': return 'type-qualite';
      case 'RETARD': return 'type-retard';
      case 'ALERTE': return 'type-alerte';
      default: return 'type-default';
    }
  }

  markAllAsRead(): void {
    const unreadNotifs = this.data.filter(n => !n.lu && n.id);
    if (unreadNotifs.length === 0) {
      this.snackBar.open('ℹ️ Aucune notification non lue', 'Fermer', { duration: 2000 });
      return;
    }

    // Mise à jour optimiste - marquer toutes comme lues immédiatement
    unreadNotifs.forEach(notif => {
      notif.lu = true;
    });
    
    // Forcer la détection de changement
    this.data = [...this.data];

    let completed = 0;
    let errors = 0;
    
    unreadNotifs.forEach(notif => {
      if (notif.id) {
        this.notifService.markAsRead(notif.id).subscribe({
          next: () => {
            completed++;
            if (completed + errors === unreadNotifs.length) {
              if (errors === 0) {
                this.snackBar.open(`✅ ${completed} notifications marquées comme lues`, 'Fermer', { 
                  duration: 2000, 
                  panelClass: ['mat-snack-bar-success'] 
                });
              } else {
                this.snackBar.open(`⚠️ ${completed} réussies, ${errors} échouées`, 'Fermer', { 
                  duration: 3000 
                });
              }
            }
          },
          error: () => {
            errors++;
            notif.lu = false; // Restaurer l'état en cas d'erreur
            if (completed + errors === unreadNotifs.length) {
              this.snackBar.open(`⚠️ ${completed} réussies, ${errors} échouées`, 'Fermer', { 
                duration: 3000 
              });
            }
          }
        });
      }
    });
  }
}


