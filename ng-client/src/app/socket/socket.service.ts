import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { connect } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  constructor() {
    this.socket = io('http://127.0.0.1:3000', { autoConnect: false });
  }

  //socket clients are set to not automatically connect
  //so that user info can be set on handshake after successful login
  //this function initiates the connection
  connect(): void {
    this.socket.connect();
  }

  isConnected(): boolean {
    return this.socket.connected;
  }
}
