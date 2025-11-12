import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatAssistantComponent } from './chat-assistant.component';

@NgModule({
  declarations: [
    ChatAssistantComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    ChatAssistantComponent
  ]
})
export class ChatAssistantModule { }
