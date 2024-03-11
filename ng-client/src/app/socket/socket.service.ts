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
  //handles the logic of re-admitting client into the rooms it was before disconnecting
  connect(roomID: string | null): void {
    this.socket.connect();
    if (!roomID && roomID != null && roomID != '')
      this.socket.emit('join-room', roomID);
  }

  setAuth(id: string, username: string) {
    this.socket.auth = { username: username, userID: id };
    //you can make the socket join a room with its own userID for implementing private messaging or data sharing
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  createRoom(roomID: string): void {
    this.socket.emit('create-room', roomID);
    sessionStorage.setItem('roomID', roomID);
  }

  joinRoom(roomID: string): void {
    this.socket.emit('join-room', roomID);
    sessionStorage.setItem('roomID', roomID);
  }
}
