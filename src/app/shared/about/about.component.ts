import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';     

@Component({
    selector: 'app-about', templateUrl: './about.component.html', styleUrls: ['./about.component.scss'],
    standalone: true,   
    imports: [CommonModule]   
})
export class AboutComponent {}
