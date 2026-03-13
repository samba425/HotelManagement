import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, switchMap } from 'rxjs';
import { ChatMessage, ChatResponseTemplate } from '../models/chat.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;
  private templates: ChatResponseTemplate[] = [];

  loadTemplates(): Observable<ChatResponseTemplate[]> {
    return this.http.get<ChatResponseTemplate[]>(`${this.baseUrl}/chat`).pipe(
      map(templates => {
        this.templates = templates;
        return templates;
      })
    );
  }

  processQuery(input: string, branchContext?: string): Observable<ChatMessage> {
    const normalized = input.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const tokens = normalized.split(/\s+/);

    return of(null).pipe(
      delay(Math.floor(Math.random() * 700) + 800),
      map(() => {
        let bestMatch: ChatResponseTemplate | null = null;
        let bestScore = 0;

        for (const template of this.templates) {
          let score = 0;
          for (const keyword of template.keywords) {
            if (tokens.includes(keyword) || normalized.includes(keyword)) {
              score += template.weight;
            }
          }
          if (score > bestScore) {
            bestScore = score;
            bestMatch = template;
          }
        }

        if (bestMatch) {
          return {
            ...bestMatch.response,
            messageId: `msg-${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          messageId: `msg-${Date.now()}`,
          sender: 'bot' as const,
          timestamp: new Date().toISOString(),
          type: 'composite' as const,
          content: {
            sections: [
              {
                type: 'text' as const,
                body: "I'm not sure I understand that query. Try asking about **revenue**, **top dishes**, **staffing needs**, **utility costs**, or **holiday preparation** for any of our properties."
              }
            ]
          }
        };
      })
    );
  }

  createUserMessage(text: string): ChatMessage {
    return {
      messageId: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
      content: {
        sections: [{ type: 'text', body: text }]
      }
    };
  }
}
