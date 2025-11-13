import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/authentification.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  token: string = '';
  hidePassword = true;
  hideConfirmPassword = true;
  passwordReset = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.errorMessage = 'Token invalide ou manquant.';
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
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
      this.errorMessage = '';
      const newPassword = this.resetPasswordForm.get('password')?.value;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          this.passwordReset = true;
          this.isLoading = false;
          setTimeout(() => this.router.navigate(['/auth/login']), 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Erreur lors de la réinitialisation du mot de passe.';
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

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
