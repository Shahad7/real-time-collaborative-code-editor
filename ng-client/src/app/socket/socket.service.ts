import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { connect } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public socket: Socket;
  constructor() {
    this.socket = io(`http://${window.location.hostname}:3000`, {
      autoConnect: false,
    });
  }

  /********************* code sync part */

  //socket clients are set to not automatically connect
  //so that user info can be set on handshake after successful login
  //this function initiates the connection
  //handles the logic of re-admitting client into the rooms it was before disconnecting
  connect(roomID: string | null): void {
    this.socket.connect();
    //might have checked for '!roomID' in  the no-yjs branch
    if (roomID && roomID != null && roomID != '') this.joinRoom(roomID);
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

  joinRoom(roomID: string) {
    this.socket.emit('join-room', roomID);
  }

  askToJoin(
    roomID: string,
    callback: Function = (response: { status: boolean }) => {
      // console.log('someone rejoined');
    }
  ): void {
    this.socket.emit('ask-to-join', roomID, callback);
    // sessionStorage.setItem('roomID', roomID);
  }

  admit(someone: string) {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('admit', someone, roomID);
  }

  reject(someone: string) {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('reject', someone);
  }

  leaveRoom(roomID: string) {
    this.socket.emit('leave-room', roomID);
  }

  //sends yjs doc updates
  sendUpdates(updates: Uint8Array): void {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('send-updates', updates, roomID);
    else console.log('are you sure this client is in a room ?');
  }

  //send y-protocols/awareness updates
  sendAwareness(updates: Uint8Array): void {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('send-awareness', updates, roomID);
  }

  //send explorer updates i.e, when a new file or folder is created by the leader
  sendExplorerUpdates(
    name: string,
    mode: 'file' | 'folder' | null,
    path: string,
    id: string | null,
    value: string | null
  ) {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID)
      this.socket.emit('explorer-updates', name, mode, path, id, roomID, value);
  }

  //send clientID of disconnected client so that others
  //can clean the respective awareness instance
  purgeDeadAwareness(clientID: number) {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('alert-purge', clientID, roomID);
  }

  /******************************chat service part */

  sendMessage(message: string, sender: string, color: string) {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID)
      this.socket.emit('send-message', message, sender, color, roomID);
  }

  /*********************************************user-list part */
  changeAdmin(admin: string) {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('change-admin', admin, roomID);
  }

  /******************************stop session */
  endSession() {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('signal-end', roomID);
  }

  deleteFile(fileID: string) {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('delete-file', fileID, roomID);
  }

  deleteFolder(foldername: string, path: string) {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) this.socket.emit('delete-folder', foldername, path, roomID);
  }
}
