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
        <p class="font-semibold text-text-primary text-lg mb-2">Restaurant AI Assistant</p>
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
      <div class="chat-input-wrap">
        <input
          type="text"
          [(ngModel)]="inputText"
          (keyup.enter)="sendMessage()"
          placeholder="Ask about your restaurants..."
          class="chat-input">
        <button
          (click)="sendMessage()"
          [disabled]="!inputText.trim()"
          class="chat-send-btn">
          <lucide-icon name="send" [size]="15"></lucide-icon>
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
      width: 2px;
      height: 2px;
      background: var(--accent-primary);
      border-radius: 50%;
      opacity: 0.1;
      animation: float-particle linear infinite;
    }
    @keyframes float-particle {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.1; }
      90% { opacity: 0.1; }
      100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
    }
    .chat-input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 4px 4px 16px;
      background: var(--surface-tertiary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      transition: border-color 0.2s ease;
    }
    .chat-input-wrap:focus-within {
      border-color: var(--accent-primary);
    }
    .chat-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 13px;
      color: var(--text-primary);
      font-family: inherit;
    }
    .chat-input::placeholder { color: var(--text-muted); }
    .chat-send-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: var(--accent-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .chat-send-btn:hover { background: var(--accent-primary-hover); }
    .chat-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
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
    'Revenue across all locations',
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
