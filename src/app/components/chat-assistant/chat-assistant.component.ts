import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-assistant',
  templateUrl: './chat-assistant.component.html',
  styleUrls: ['./chat-assistant.component.scss']
})
export class ChatAssistantComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  userInput: string = '';
  isOpen: boolean = false;
  isLoading: boolean = false;
  unreadCount: number = 0;
  
  private messagesSubscription?: Subscription;
  private isOpenSubscription?: Subscription;
  private shouldScrollToBottom: boolean = false;

  quickActions = [
    { icon: 'schedule', text: 'Fiches en retard', query: 'Quelles sont les fiches en retard?' },
    { icon: 'analytics', text: 'Analyse KPI', query: 'Quel est le taux de conformité moyen?' },
    { icon: 'lightbulb', text: 'Recommandations', query: 'Quelles sont tes recommandations?' },
    { icon: 'help', text: 'Aide', query: 'Comment puis-je utiliser cet assistant?' }
  ];

  constructor(public chatService: ChatService) {}

  ngOnInit(): void {
    this.messagesSubscription = this.chatService.messages$.subscribe(messages => {
      const previousCount = this.messages.length;
      this.messages = messages;
      
      // Incrémenter le compteur de non-lus si le chat est fermé
      if (!this.isOpen && messages.length > previousCount) {
        const newMessages = messages.slice(previousCount);
        const assistantMessages = newMessages.filter(m => !m.isUser);
        this.unreadCount += assistantMessages.length;
      }
      
      this.shouldScrollToBottom = true;
    });

    this.isOpenSubscription = this.chatService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
      if (isOpen) {
        this.unreadCount = 0;
        this.shouldScrollToBottom = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
    this.isOpenSubscription?.unsubscribe();
  }

  toggleChat(): void {
    this.chatService.toggleChat();
  }

  closeChat(): void {
    this.chatService.closeChat();
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) {
      return;
    }

    const message = this.userInput.trim();
    this.userInput = '';
    this.isLoading = true;

    this.chatService.sendMessage(message).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  sendQuickAction(query: string): void {
    this.userInput = query;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  formatMessage(text: string): string {
    // Convertir le markdown simple en HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n/g, '<br>'); // Line breaks
    
    return formatted;
  }

  getMessageClass(message: ChatMessage): string {
    if (message.isUser) {
      return 'user-message';
    }
    
    if (message.text === '...') {
      return 'typing-message';
    }
    
    return 'assistant-message';
  }
}
