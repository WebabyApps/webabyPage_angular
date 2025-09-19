import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PrivacyPolicyEnComponent } from '../../pages/privacy-policy-en/privacy-policy-en.component';
@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    imports: [CommonModule, MatDialogModule, MatButtonModule, PrivacyPolicyEnComponent],
    standalone: true
})
export class FooterComponent{ 
    year=new Date().getFullYear();
    private dialog = inject(MatDialog);

  openPrivacyPolicy() {
    this.dialog.open(PrivacyPolicyEnComponent, {
      width: '800px',
      maxWidth: '95vw',
      autoFocus: false,
      restoreFocus: true,
    });
  }
}
