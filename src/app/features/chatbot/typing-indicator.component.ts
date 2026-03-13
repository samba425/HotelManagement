import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center flex-shrink-0">
        <span class="text-white text-xs font-bold">AI</span>
      </div>
      <div class="bg-surface-tertiary/70 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce-dot" style="animation-delay: 0s"></span>
        <span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce-dot" style="animation-delay: 0.16s"></span>
        <span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce-dot" style="animation-delay: 0.32s"></span>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class TypingIndicatorComponent {}
