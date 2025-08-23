import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-hero',
    templateUrl: './hero.component.html',
    styleUrls: ['./hero.component.scss'],
    standalone: true,
    imports: [CommonModule] 
})
export class HeroComponent{
  scrollToProducts(){
    const el = document.querySelector('#products'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
}
