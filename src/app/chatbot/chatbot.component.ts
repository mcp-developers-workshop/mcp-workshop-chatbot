import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { Message } from '../models/message.model';
import { UserInfo } from '../models/auth.model';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  userInfo: UserInfo | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to user info
    this.authService.userInfo$.subscribe(info => {
      this.userInfo = info;
    });

    // Fetch welcome message from backend with empty request
    this.isLoading = true;
    this.chatService.sendMessage('').subscribe({
      next: (response) => {
        this.addMessage(response.response, 'bot');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching welcome message:', error);
        // Fallback to default message if backend fails
        this.addMessage('Hello! How can I help you today?', 'bot');
        this.isLoading = false;
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) {
      return;
    }

    const userMessage = this.userInput.trim();
    this.userInput = '';
    this.error = null;

    // Add user message to chat
    this.addMessage(userMessage, 'user');
    this.isLoading = true;

    // Send message to backend
    this.chatService.sendMessage(userMessage).subscribe({
      next: (response) => {
        // Add bot response to chat
        this.addMessage(response.response, 'bot');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.error = 'Failed to send message. Please try again.';
        this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        this.isLoading = false;
      }
    });
  }

  clearChat(): void {
    this.chatService.clearConversation().subscribe({
      next: () => {
        this.messages = [];
        this.addMessage('Conversation cleared. How can I help you?', 'bot');
      },
      error: (error) => {
        console.error('Error clearing conversation:', error);
      }
    });
  }

  private addMessage(content: string, sender: 'user' | 'bot'): void {
    const message: Message = {
      id: this.generateId(),
      content,
      sender,
      timestamp: new Date()
    };
    this.messages.push(message);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
