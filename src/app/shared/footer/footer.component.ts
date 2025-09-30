import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';
import { RouterModule } from '@angular/router';  
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule], 
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  year = new Date().getFullYear();
  private router = inject(Router);

 
  /** slug z URL, np. /products/basketball-shots/... -> "basketball-shots" */
  get productSlug(): string | null {
    const m = this.router.url.match(/^\/products\/([^\/]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
}