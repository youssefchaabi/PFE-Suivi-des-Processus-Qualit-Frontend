import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/authentification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password-modal',
  templateUrl: './reset-password-modal.component.html',
  styleUrls: ['./reset-password-modal.component.scss']
})
export class ResetPasswordModalComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  passwordReset = false;
  token: string;

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { token: string },
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.token = data.token;
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    if (!this.token) {
      this.snackBar.open('Token invalide ou manquant', 'Fermer', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      this.dialogRef.close();
      this.router.navigate(['/']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      const newPassword = this.resetPasswordForm.get('password')?.value;

      // Feedback immédiat
      this.snackBar.open('Réinitialisation en cours... ⏳', '', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          this.passwordReset = true;
          this.isLoading = false;
          this.snackBar.open('Mot de passe réinitialisé avec succès ! 🎉', 'Fermer', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Fermer le modal et rediriger après 3 secondes
          setTimeout(() => {
            this.dialogRef.close();
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Erreur lors de la réinitialisation',
            'Fermer',
            {
              duration: 4000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    }
  }

  getPasswordStrength(): string {
    const password = this.resetPasswordForm.get('password')?.value || '';
    
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (criteriaCount >= 3) return 'strong';
    if (criteriaCount >= 2) return 'medium';
    return 'weak';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Mot de passe faible';
      case 'medium': return 'Mot de passe moyen';
      case 'strong': return 'Mot de passe fort';
      default: return '';
    }
  }

  onClose(): void {
    this.dialogRef.close();
    this.router.navigate(['/']);
  }
}
