import {Component, OnInit} from '@angular/core';
import * as signalR from "@microsoft/signalr";
import {HubConnection} from "@microsoft/signalr";
import {MessagePackHubProtocol} from "@microsoft/signalr-protocol-msgpack"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private hubConnection: HubConnection | undefined;
  message = '';
  messages: string[] = [];

  ngOnInit() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5031/chat`)
      .configureLogging(signalR.LogLevel.Information)
      .withHubProtocol(new MessagePackHubProtocol())
      .build();

    // Listen Task
    this.hubConnection.on('ReceiveMessage', (data: string) => {
      this.messages.push(data)
    })

    // On Start get history
    this.hubConnection.start().catch((err) => console.error(err.toString())).then(() => {
      if (this.hubConnection) {
        // Call method and get response (invoke -> with return)
        this.hubConnection.invoke('GetHistory').then((data: string[]) => {
         this.messages = data
        })
      }
    });

  }

  sendMessage(): void {
    const data = this.message;
    if (this.hubConnection) {
      // call method and put data (this.hubConnection.send -> without return)
      this.hubConnection.send('Send', data)
    }
  }
}
