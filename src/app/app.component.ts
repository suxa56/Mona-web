import {Component, OnInit} from '@angular/core';
import * as signalR from "@microsoft/signalr";
import {HubConnection} from "@microsoft/signalr";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private hubConnection: HubConnection | undefined;
  message = '';
  messages: MessageItem[] = [];
  groupMessages: MessageItem[] = []
  group: 'forum' | 'work' | 'gamers' | 'weekend' = 'forum'

  ngOnInit() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5031/chat`)
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Listen Task
    this.hubConnection.on('ReceiveMessage', (data: MessageItem) => {
      this.messages.push(data)
      if (data.group === this.group) this.groupMessages.push(data)
    })

    // On Start get history
    this.hubConnection.start().catch((err) => console.error(err.toString())).then(() => {
      this.joinGroup()
    });

  }

  sendMessage(): void {
    const data: MessageItem = {
      text: this.message,
      group: this.group
    }
    if (this.hubConnection) {
      // call method and put data (this.hubConnection.send -> without return)
      this.hubConnection.send('Send', data)
    }
  }

  changeGroup(group: 'forum' | 'work' | 'gamers' | 'weekend') {
    this.group = group
    this.joinGroup()
  }

  private joinGroup() {
    if (this.hubConnection)
      // Call method and get response (invoke -> with return)
      this.hubConnection.send('JoinGroup', this.group).then(() => {
        // Call method and get response (invoke -> with return)
        this.getGroupHistory()
      })
  }

  private getGroupHistory() {
    if (this.hubConnection)
      this.hubConnection.invoke('GetHistory', this.group).then((data: MessageItem[]) => {
        data.forEach(item => {
          if (!this.messages.find(value => value.id === item.id))
            this.messages.push(item)
        })
        this.groupMessages = this.messages.filter(item => item.group === this.group)
      })
  }
}

export interface MessageItem {
  id?: number
  text: string
  group: 'forum' | 'work' | 'gamers' | 'weekend'
}
