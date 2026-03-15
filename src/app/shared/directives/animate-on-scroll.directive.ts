import { Directive, ElementRef, OnInit, OnDestroy, Input } from '@angular/core';

@Directive({ selector: '[appAnimateOnScroll]', standalone: true })
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() animationClass = 'animate-fade-up';
  @Input() stagger = false;
  @Input() staggerDelay = 60;
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.el.nativeElement.style.opacity = '0';
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (this.stagger) {
            const children = this.el.nativeElement.children;
            for (let i = 0; i < children.length; i++) {
              children[i].style.setProperty('--delay', `${i * this.staggerDelay}ms`);
            }
            this.el.nativeElement.style.opacity = '1';
            this.el.nativeElement.classList.add('stagger-grid');
          } else {
            this.el.nativeElement.style.opacity = '1';
            this.el.nativeElement.classList.add(this.animationClass);
          }
          this.observer.unobserve(this.el.nativeElement);
        }
      },
      { threshold: 0.05 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
