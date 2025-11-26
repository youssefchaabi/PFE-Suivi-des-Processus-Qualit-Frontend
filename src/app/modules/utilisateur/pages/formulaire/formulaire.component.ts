import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService, Utilisateur } from 'src/app/services/utilisateur.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/authentification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';


@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.scss']
})
export class FormulaireComponent implements OnInit {
  form: FormGroup;
  modeEdition = false;
  utilisateurId: string | null = null;
  rolesDisponibles = ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'];
  utilisateursExistants: Utilisateur[] = [];
  erreurDoublonEmail = false;

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Charger tous les utilisateurs pour vérifier l'unicité de l'email
    this.utilisateurService.getUtilisateurs().subscribe(data => { this.utilisateursExistants = data; });
    this.utilisateurId = this.route.snapshot.paramMap.get('id');
    this.modeEdition = !!this.utilisateurId;

    if (this.modeEdition && this.utilisateurId) {
      this.utilisateurService.getUtilisateurById(this.utilisateurId).subscribe(data => {
        this.form.patchValue(data);
        // En édition, le mot de passe n'est pas affiché ni géré
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      });
    } else {
      // En création, le mot de passe est requis et min 6 caractères
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
  if (this.form.invalid) return;

    // Vérification unicité email (hors édition sur soi-même)
    const email = this.form.value.email.trim().toLowerCase();
    const doublon = this.utilisateursExistants.some(u =>
      u.email.trim().toLowerCase() === email &&
      (!this.modeEdition || u.id !== this.utilisateurId)
    );
    if (doublon) {
      this.erreurDoublonEmail = true;
      this.snackBar.open('❌ Cet email est déjà utilisé par un autre utilisateur', 'Fermer', {
        duration: 3500,
        panelClass: ['snackbar-error']
      });
      return;
    } else {
      this.erreurDoublonEmail = false;
    }

  const utilisateur: Utilisateur = this.form.value;

  if (this.modeEdition && this.utilisateurId) {
    // En édition, on ne modifie pas le mot de passe
    delete utilisateur.password;
    
    this.utilisateurService.updateUtilisateur(this.utilisateurId, utilisateur).subscribe(() => {
      this.snackBar.openFromComponent(SuccessSnackbarComponent, {
        data: { message: '✅ Utilisateur mis à jour avec succès' },
        duration: 3000,
        panelClass: ['mat-snack-bar-success']
      });
      this.router.navigate(['/utilisateurs']);
    });
  } else {
    this.utilisateurService.createUtilisateur(utilisateur).subscribe((nouvelUtilisateur) => {
      // Afficher le snackbar de succès
      this.snackBar.openFromComponent(SuccessSnackbarComponent, {
        data: { message: '✅ Utilisateur ajouté avec succès' },
        duration: 3000,
        panelClass: ['mat-snack-bar-success']
      });
      
      // Créer une notification pour l'administrateur connecté
      const currentUserId = this.authService.getUserId();
      if (currentUserId) {
        this.notificationService.notifierCreationUtilisateur(
          currentUserId,
          utilisateur.nom
        ).subscribe({
          next: () => {
            console.log('✅ Notification créée avec succès');
          },
          error: (err) => {
            console.error('❌ Erreur lors de la création de la notification:', err);
          }
        });
      }
      
      // Créer également une notification pour le nouvel utilisateur
      if (nouvelUtilisateur && nouvelUtilisateur.id) {
        const notificationNouvelUtilisateur = {
          message: `Bienvenue ${utilisateur.nom} ! Votre compte a été créé avec succès.`,
          type: 'BIENVENUE',
          utilisateurId: nouvelUtilisateur.id,
          lu: false
        };
        
        this.notificationService.create(notificationNouvelUtilisateur).subscribe({
          next: () => {
            console.log('✅ Notification de bienvenue créée');
          },
          error: (err) => {
            console.error('❌ Erreur notification bienvenue:', err);
          }
        });
      }
      
      this.router.navigate(['/utilisateurs']);
    });
    }
  }

}
