import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
type Product = { title: string; img: string; desc: string };
@Component({
  selector:'app-products-carousel',
  templateUrl:'./products-carousel.component.html',
  styleUrls:['./products-carousel.component.scss']
})
export class ProductsCarouselComponent implements AfterViewInit{
  @ViewChild('track',{static:true}) trackRef!: ElementRef<HTMLDivElement>;
  products: Product[] = [
    { title:'Bubble Word', img:'assets/bubble.jpg', desc:'Fast-paced word puzzler bursting with color and combos. Train vocabulary and reflexes.'},
    { title:'Basketball Shots', img:'assets/basket.jpg', desc:'Arcade-style hoops with comic visuals. Shoot, swipe, and chase high scores with friends.'},
    { title:'System of Equations Trainer', img:'assets/equations.jpg', desc:'Make algebra click with interactive drills and visual challenges that build intuition.'},
    { title:'Abecadlowo', img:'assets/scene1.jpg', desc:'Alphabet adventures — playful letter quests that spark reading and spelling joy.'},
    { title:'Lucky Draw', img:'assets/scene2.jpg', desc:'Spin, pick, celebrate! Party‑friendly mini‑game for fair choices and quick fun.'},
    { title:'Bibble Echo', img:'assets/scene3.jpg', desc:'Rhythm & memory mashup — echo the pattern, level up your flow and focus.'},
  ];
  private autoplayId:any=null; private hoverId:any=null;
  ngAfterViewInit(){ this.startAutoplay(); window.addEventListener('resize',()=>this.nudge()); }
  private track(){ return this.trackRef.nativeElement; }
  private gap(){ return 18; }
  private cardWidth(){ const c=this.track().querySelector('.card') as HTMLElement|null; if(!c) return 320+this.gap(); return c.getBoundingClientRect().width + this.gap(); }
  private move(px:number){ const t=this.track(); t.scrollLeft+=px; const max=t.scrollWidth-t.clientWidth; if(t.scrollLeft<=0)t.scrollLeft=max-2; else if(t.scrollLeft>=max-1) t.scrollLeft=1; }
  private easeOutCubic=(t:number)=>1-Math.pow(1-t,3);
  private easeInOutCubic=(t:number)=> t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  private animateBy(delta:number,dur=420,ease=(t:number)=>t){ const t=this.track(); const startX=t.scrollLeft; const max=t.scrollWidth-t.clientWidth; const s=performance.now(); return new Promise<void>(res=>{ const f=(n:number)=>{ const k=Math.min(1,(n-s)/dur); const x=startX+delta*ease(k); t.scrollLeft=Math.max(0,Math.min(max,x)); if(k<1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); }
  async spring(dir:number){ this.stopAutoplay(); this.stopHover(); const d=this.cardWidth()*dir; const over=d*0.14; await this.animateBy(d+over,340,this.easeOutCubic); await this.animateBy(-over,180,this.easeInOutCubic); this.startAutoplay(); }
  private startAutoplay(){ this.stopAutoplay(); this.autoplayId=setInterval(()=>this.move(this.cardWidth()),4000); }
  private stopAutoplay(){ if(this.autoplayId){clearInterval(this.autoplayId); this.autoplayId=null;} }
  hover(dir:number){ this.stopHover(); this.hoverId=setInterval(()=>this.move(dir*4),16); this.stopAutoplay(); }
  stopHover(){ if(this.hoverId){clearInterval(this.hoverId); this.hoverId=null;} this.startAutoplay(); }
  private nudge(){ this.move(0); }
}
