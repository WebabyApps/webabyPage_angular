import { Component, HostListener } from '@angular/core';
@Component({
  selector:'app-header',
  templateUrl:'./header.component.html',
  styleUrls:['./header.component.scss']
})
export class HeaderComponent{
  scrolled=false; menuOpen=false;
  @HostListener('window:scroll') onScroll(){ this.scrolled = window.scrollY > 40; }
  toggleMenu(){ this.menuOpen = !this.menuOpen; }
  closeMenu(){ this.menuOpen = false; }
}
