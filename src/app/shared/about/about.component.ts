import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';       
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-about', templateUrl: './about.component.html', styleUrls: ['./about.component.scss'],
    standalone: true,   
    imports: [CommonModule, TranslocoModule]   
})
export class AboutComponent {}
