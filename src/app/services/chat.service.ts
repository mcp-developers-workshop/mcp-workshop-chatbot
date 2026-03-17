import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/api'; // Configure your backend URL
  private conversationId?: string;

  constructor(private http: HttpClient) {}

  /**
   * Send a message to the chatbot
   * POST /api/chat
   */
  sendMessage(message: string): Observable<ChatResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const request: ChatRequest = {
      message,
      conversationId: this.conversationId
    };

    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request, { headers });
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
