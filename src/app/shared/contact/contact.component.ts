import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    imports: [CommonModule],
    standalone: true
})
export class ContactComponent{
  expanded=false;
  expand(){ this.expanded = true; }
  onSubmit(e:Event){ e.preventDefault(); alert('Thanks! We will get back to you.'); }
}
