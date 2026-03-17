import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse } from '../models/message.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;
  private conversationId?: string;

  constructor(private http: HttpClient) {}

  /**
   * Send a message to the chatbot
   * POST /api/chat
   *
   * Note: Authorization header is automatically added by AuthInterceptor
   */
  sendMessage(message: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      message,
      conversationId: this.conversationId
    };

    // HttpClient automatically sets Content-Type for JSON
    // AuthInterceptor automatically adds Authorization: Bearer <token>
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request);
  }

  /**
   * Set the conversation ID for maintaining context
   */
  setConversationId(id: string): void {
    this.conversationId = id;
  }

  /**
   * Get the current conversation ID
   */
  getConversationId(): string | undefined {
    return this.conversationId;
  }

  /**
   * Clear the conversation (optional endpoint)
   * DELETE /api/chat/:conversationId
   *
   * Note: Authorization header is automatically added by AuthInterceptor
   */
  clearConversation(): Observable<void> {
    if (!this.conversationId) {
      return new Observable(observer => {
        observer.next();
        observer.complete();
      });
    }

    return this.http.delete<void>(`${this.apiUrl}/chat/${this.conversationId}`);
  }
}
