import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ChatMessageComponent } from './chat-message.component';
import { SuggestionChipsComponent } from './suggestion-chips.component';
import { TypingIndicatorComponent } from './typing-indicator.component';
import { ChatbotService } from '../../core/services/chatbot.service';
import { ChatMessage } from '../../core/models/chat.model';

@Component({
  selector: 'app-chatbot-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ChatMessageComponent,
    SuggestionChipsComponent,
    TypingIndicatorComponent,
  ],
  template: `
    <!-- Particle background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div *ngFor="let p of particles" class="particle"
           [style.left.%]="p.x" [style.top.%]="p.y"
           [style.animation-delay.s]="p.delay"
           [style.animation-duration.s]="p.duration">
      </div>
    </div>

    <!-- Messages -->
    <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
      <div *ngIf="messages().length === 0" class="text-center py-12">
        <lucide-icon name="brain-circuit" [size]="48" class="mx-auto mb-4 text-accent-primary/40"></lucide-icon>
        <p class="font-semibold text-text-primary text-lg mb-2">Hotel AI Assistant</p>
        <p class="text-sm text-text-secondary max-w-xs mx-auto">
          Ask me about revenue, occupancy, top dishes, staffing needs, utility costs, or holiday preparation.
        </p>
      </div>

      <app-chat-message
        *ngFor="let msg of messages()"
        [message]="msg">
      </app-chat-message>

      <app-typing-indicator *ngIf="isTyping()"></app-typing-indicator>
    </div>

    <!-- Suggestion chips -->
    <app-suggestion-chips
      [suggestions]="currentSuggestions()"
      (selected)="onSuggestionClick($event)">
    </app-suggestion-chips>

    <!-- Input -->
    <div class="p-4 border-t border-border-default relative z-10">
      <div class="flex gap-2">
        <input
          type="text"
          [(ngModel)]="inputText"
          (keyup.enter)="sendMessage()"
          placeholder="Ask about your properties..."
          class="flex-1 px-4 py-2.5 bg-surface-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all">
        <button
          (click)="sendMessage()"
          [disabled]="!inputText.trim()"
          class="px-4 py-2.5 bg-accent-primary text-white rounded-xl text-sm font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
          <lucide-icon name="send" [size]="14"></lucide-icon>
          Send
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }
    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: var(--accent-primary);
      border-radius: 50%;
      opacity: 0.15;
      animation: float-particle linear infinite;
    }
    @keyframes float-particle {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.15; }
      90% { opacity: 0.15; }
      100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
    }
  `],
})
export class ChatbotPanelComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private chatbotService = inject(ChatbotService);
  private templatesLoaded = false;

  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);
  inputText = '';

  currentSuggestions = signal<string[]>([
    'Top dishes this week?',
    'Revenue across all properties',
    'Staff needed for NYE?',
    'Utility costs trending?',
  ]);

  particles = Array.from({ length: 20 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 12,
  }));

  constructor() {
    this.chatbotService.loadTemplates().subscribe(() => {
      this.templatesLoaded = true;
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text) return;
    this.inputText = '';

    const userMsg = this.chatbotService.createUserMessage(text);
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isTyping.set(true);

    this.chatbotService.processQuery(text).subscribe(botMsg => {
      this.isTyping.set(false);
      this.messages.update(msgs => [...msgs, botMsg]);
      this.updateSuggestions(text);
    });
  }

  onSuggestionClick(suggestion: string): void {
    this.inputText = suggestion;
    this.sendMessage();
  }

  private updateSuggestions(lastQuery: string): void {
    const lower = lastQuery.toLowerCase();
    if (lower.includes('dish') || lower.includes('menu')) {
      this.currentSuggestions.set(['Ingredient costs for top dishes', 'Revenue by cuisine type', 'Peak dining hours']);
    } else if (lower.includes('revenue') || lower.includes('profit')) {
      this.currentSuggestions.set(['Compare branch profitability', 'RevPAR trend this month', 'GOPPAR analysis']);
    } else if (lower.includes('staff') || lower.includes('labor')) {
      this.currentSuggestions.set(['Labor cost as % of revenue', 'Overtime analysis', 'Department staffing levels']);
    } else {
      this.currentSuggestions.set(['Holiday preparation plan', 'Occupancy forecast', 'Top selling dishes', 'Utility cost breakdown']);
    }
  }

  private scrollToBottom(): void {
    if (this.scrollContainer?.nativeElement) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
