import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'success' | 'error' | 'info';
}

export interface ChatRequest {
  message: string;
  userId: string;
}

export interface ChatResponse {
  message: string;
  type: string;
  timestamp: Date;
  isTyping: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeWelcomeMessage();
  }

  private initializeWelcomeMessage(): void {
    const welcomeMessage: ChatMessage = {
      text: '👋 Bonjour! Je suis votre assistant qualité intelligent.\n\n' +
            'Je peux vous aider à:\n' +
            '• Analyser vos fiches qualité\n' +
            '• Identifier les fiches en retard\n' +
            '• Consulter vos KPI\n' +
            '• Obtenir des recommandations\n\n' +
            'Comment puis-je vous aider aujourd\'hui?',
      isUser: false,
      timestamp: new Date(),
      type: 'info'
    };
    this.messagesSubject.next([welcomeMessage]);
  }

  sendMessage(message: string, userId?: string): Observable<ChatResponse> {
    // Récupérer l'utilisateur depuis le localStorage si non fourni
    let finalUserId: string = userId || 'user';
    
    if (!userId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          finalUserId = user.id || user.email || 'user';
        } catch (e) {
          finalUserId = 'user';
        }
      }
    }
    
    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      text: message,
      isUser: true,
      timestamp: new Date()
    };
    
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMessage]);

    // Ajouter l'indicateur de typing
    const typingMessage: ChatMessage = {
      text: '...',
      isUser: false,
      timestamp: new Date(),
      type: 'info'
    };
    this.messagesSubject.next([...this.messagesSubject.value, typingMessage]);

    const request: ChatRequest = { message, userId: finalUserId };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return new Observable(observer => {
      this.http.post<ChatResponse>(`${this.apiUrl}/message`, request, { headers })
        .subscribe({
          next: (response) => {
            // Retirer l'indicateur de typing
            const messages = this.messagesSubject.value.filter(m => m.text !== '...');
            
            // Ajouter la réponse de l'assistant
            const assistantMessage: ChatMessage = {
              text: response.message,
              isUser: false,
              timestamp: new Date(response.timestamp),
              type: response.type as 'success' | 'error' | 'info'
            };
            
            this.messagesSubject.next([...messages, assistantMessage]);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            // Retirer l'indicateur de typing
            const messages = this.messagesSubject.value.filter(m => m.text !== '...');
            
            // Ajouter un message d'erreur
            const errorMessage: ChatMessage = {
              text: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
              isUser: false,
              timestamp: new Date(),
              type: 'error'
            };
            
            this.messagesSubject.next([...messages, errorMessage]);
            observer.error(error);
          }
        });
    });
  }

  toggleChat(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  openChat(): void {
    this.isOpenSubject.next(true);
  }

  closeChat(): void {
    this.isOpenSubject.next(false);
  }

  clearMessages(): void {
    this.initializeWelcomeMessage();
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }
}
