import { Directive, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';

@Directive({ selector: '[appAnimateOnScroll]', standalone: true })
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() animationClass = 'animate-slide-up';
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.el.nativeElement.style.opacity = '0';
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.el.nativeElement.style.opacity = '1';
          this.el.nativeElement.classList.add(this.animationClass);
          this.observer.unobserve(this.el.nativeElement);
        }
      },
      { threshold: 0.1 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
