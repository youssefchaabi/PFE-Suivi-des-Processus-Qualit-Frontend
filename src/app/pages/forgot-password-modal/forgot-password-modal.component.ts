import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/authentification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss']
})
export class ForgotPasswordModalComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordModalComponent>,
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const email = this.forgotPasswordForm.get('email')?.value;

      // Feedback immédiat
      this.snackBar.open('Envoi en cours... ⏳', '', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });

      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.emailSent = true;
          this.isLoading = false;
          this.snackBar.open('Email envoyé avec succès ! 📧', 'Fermer', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error: any) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Erreur lors de l\'envoi de l\'e-mail',
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

  onClose(): void {
    this.dialogRef.close();
  }
}
