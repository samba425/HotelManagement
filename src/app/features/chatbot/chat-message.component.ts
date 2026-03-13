import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../core/models/chat.model';
import { ChatChartRendererComponent } from './chat-chart-renderer.component';
import { LucideAngularModule } from 'lucide-angular';
@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, ChatChartRendererComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-3" [class.flex-row-reverse]="message.sender === 'user'">
      <!-- Avatar -->
      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
           [ngClass]="message.sender === 'user'
             ? 'bg-accent-primary/20'
             : 'bg-gradient-to-br from-accent-primary to-purple-600'">
        <lucide-icon
          [name]="message.sender === 'user' ? 'user' : 'brain-circuit'"
          [size]="14"
          [ngClass]="message.sender === 'user' ? 'text-accent-primary' : 'text-white'">
        </lucide-icon>
      </div>

      <!-- Message body -->
      <div class="max-w-[85%] space-y-2"
           [class.items-end]="message.sender === 'user'">
        <div *ngFor="let section of message.content.sections"
             class="rounded-2xl px-4 py-3 text-sm"
             [ngClass]="message.sender === 'user'
               ? 'bg-accent-primary text-white rounded-tr-sm'
               : 'bg-surface-tertiary/70 text-text-primary rounded-tl-sm'">

          <div *ngIf="section.type === 'text'" [innerHTML]="formatMarkdown(section.body || '')"></div>

          <div *ngIf="section.type === 'chart'" class="my-2">
            <app-chat-chart-renderer [config]="section.chartConfig!"></app-chat-chart-renderer>
          </div>

          <div *ngIf="section.type === 'table'" class="my-2 overflow-x-auto">
            <p class="font-medium text-xs mb-2 text-text-secondary">{{ section.title }}</p>
            <table class="w-full text-xs">
              <thead>
                <tr>
                  <th *ngFor="let col of section.columns" class="text-left py-1 px-2 border-b border-border-default text-text-secondary font-medium">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of section.rows" class="hover:bg-surface-tertiary/30">
                  <td *ngFor="let cell of row" class="py-1 px-2">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="section.type === 'list'" class="my-1">
            <ul class="space-y-1">
              <li *ngFor="let item of section.items" class="flex items-start gap-2 text-xs">
                <span class="text-accent-primary mt-0.5">•</span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div *ngIf="section.type === 'kpi'" class="my-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-primary/50">
            <span class="text-lg font-bold text-accent-primary">{{ section.kpiValue }}</span>
            <span class="text-xs text-text-secondary">{{ section.kpiLabel }}</span>
          </div>
        </div>

        <!-- Copy button for bot messages -->
        <button *ngIf="message.sender === 'bot'"
                class="flex items-center gap-1 text-[10px] text-text-secondary hover:text-text-primary transition-colors mt-1"
                (click)="copyMessage()">
          <lucide-icon name="copy" [size]="12"></lucide-icon>
          Copy
        </button>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;

  formatMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  copyMessage(): void {
    const text = this.message.content.sections
      .filter(s => s.type === 'text')
      .map(s => s.body)
      .join('\n');
    navigator.clipboard.writeText(text);
  }
}
