import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suggestion-chips',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-4 py-2 border-t border-border-default/50 relative z-10" *ngIf="suggestions.length">
      <div class="flex flex-wrap gap-1.5">
        <button
          *ngFor="let s of suggestions"
          (click)="selected.emit(s)"
          class="px-3 py-1.5 text-xs font-medium rounded-full border border-border-default text-text-secondary hover:text-accent-primary hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all">
          {{ s }}
        </button>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class SuggestionChipsComponent {
  @Input() suggestions: string[] = [];
  @Output() selected = new EventEmitter<string>();
}
