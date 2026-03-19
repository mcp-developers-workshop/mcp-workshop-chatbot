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

  constructor(private http: HttpClient) {}

  /**
   * Send a message to the chatbot
   * POST /api/v1/request
   *
   * Note: Authorization header is automatically added by AuthInterceptor
   */
  sendMessage(message: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      request: message
    };

    // HttpClient automatically sets Content-Type for JSON
    // AuthInterceptor automatically adds Authorization: Bearer <token>
    return this.http.post<ChatResponse>(`${this.apiUrl}/request`, request);
  }

  /**
   * Clear the conversation (optional endpoint)
   * DELETE /api/v1/request
   *
   * Note: Authorization header is automatically added by AuthInterceptor
   */
  clearConversation(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/request`);
  }
}
