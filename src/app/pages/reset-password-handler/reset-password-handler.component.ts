import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ResetPasswordModalComponent } from '../reset-password-modal/reset-password-modal.component';

@Component({
  selector: 'app-reset-password-handler',
  template: '<div></div>'
})
export class ResetPasswordHandlerComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    
    if (token) {
      // Ouvrir le modal de réinitialisation
      const dialogRef = this.dialog.open(ResetPasswordModalComponent, {
        width: '550px',
        maxWidth: '95vw',
        panelClass: 'reset-password-dialog',
        disableClose: true,
        data: { token }
      });

      // Rediriger vers home après fermeture du modal
      dialogRef.afterClosed().subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      // Pas de token, rediriger vers home
      this.router.navigate(['/']);
    }
  }
}
