import { Component } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css'],
})
export class ChatboxComponent {
  messages: Array<{ sender: string; message: string; color: string }> = [
    // { sender: 'Max', message: 'Lorem ipsum dolor sit amet',color:'red' },
  ];
  constructor(
    private socketServive: SocketService,
    private sidebarService: SidebarService
  ) {
    //receiving message
    this.socketServive.socket.on(
      'receive-message',
      (message, sender, color) => {
        
        let you = sessionStorage.getItem('username');
        if (sender == you)
          this.messages.push({ sender: 'you', message, color: 'black' });
        else{ this.messages.push({ sender, message, color });
        this.sidebarService.updateMessageCount();
        console.log("message receive event")
        }
      }
    );
  }

  sendMessage(inputRef: HTMLInputElement) {
    if (sessionStorage.getItem('username')) {
      let sender = sessionStorage.getItem('username') ?? '';
      let color;
      if (sessionStorage.getItem('username-color')) {
        color = sessionStorage.getItem('username-color') ?? '';
      } else color = 'purple';

      this.socketServive.sendMessage(inputRef.value, sender, color);
    }
    inputRef.value = '';
  }
}
