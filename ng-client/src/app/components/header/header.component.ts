import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ViewChild } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { v4 as uuidv4 } from 'uuid';
import { HostListener } from '@angular/core';
import { UserListComponent } from '../user-list/user-list.component';
import { UrlSegment } from '@angular/router';
import { UserListService } from '../user-list/user-list.service';
import { DataStoreService } from '../data-store/data-store.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  isAdmin: boolean = false;
  membersCount: number = 0;
  filesCount: number = 0;
  uploaded: Array<string> = [];
  counted: Array<string> = [];
  someone: string = '';
  saveProgress: 'saving' | 'saved' | 'initial' | 'error' = 'initial';
  joinProgress:
    | 'waiting'
    | 'admitted'
    | 'rejected'
    | 'unavailable'
    | 'initial' = 'initial';

  timeoutID: any = 0;
  private messageSource = new Subject<string>();
  message$ = this.messageSource.asObservable();
  messages: Array<string> = [];

  //dom variables
  @ViewChild('roomID')
  roomID: any;
  @ViewChild('copyButton')
  copyButton: any;
  @ViewChild('roomIDInput')
  roomIDInput: any;
  @ViewChild('connectButton')
  connectButton: any;
  @ViewChild('leaveButton')
  leaveButton: any;
  @ViewChild('error')
  errorDiv: any;
  @ViewChild('notification')
  notification: any;
  @ViewChild('notificationDiv')
  notificationDiv: any;
  @ViewChild('successorWarning')
  successorWarning: any;
  @ViewChild('saveWarning')
  saveWarning: any;
  @ViewChild('sessionEndDiv')
  sessionEndDiv: any;
  @ViewChild('joinRequestDIV')
  joinRequestDIV: any;
  @ViewChild('joinRequest')
  joinRequest: any;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private userListService: UserListService,
    private dataStoreService: DataStoreService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    //let admin know someone wants to join
    this.socketService.socket.on('ask-admin', (admin, someone) => {
      const username = sessionStorage.getItem('username');
      if (this.isAdmin && username && username == admin) {
        this.showJoinReq(someone);
      }
    });

    //when join req is accepted
    this.socketService.socket.on('admitted', (someone, roomID) => {
      const username = sessionStorage.getItem('username');
      if (username == someone) {
        this.joinProgress = 'admitted';
        this.socketService.joinRoom(roomID);
        sessionStorage.setItem('roomID', roomID);
        this.toggle();
        this.toggleConnectOptions();
      }
    });

    //when join req is rejected
    this.socketService.socket.on('rejected', (someone) => {
      const username = sessionStorage.getItem('username');
      if (username == someone) this.joinProgress = 'rejected';
    });

    //listen to admin event
    this.socketService.socket.on('admin', () => {
      this.isAdmin = true;
      sessionStorage.setItem('isAdmin', 'true');
      this.userListService.adminCheck();
    });

    //know when admin changes
    this.socketService.socket.on('new-admin', (admin) => {
      let currentUser = sessionStorage.getItem('username');
      if (currentUser && currentUser == admin) {
        this.isAdmin = true;
        sessionStorage.setItem('isAdmin', 'true');
      } else this.isAdmin = false;
    });

    //when admin stops the session
    this.socketService.socket.on('session-end', () => {
      if (!this.isAdmin) {
        this.alertAndLeave();
      }
    });

    //keep membersCount up to date
    this.userListService.membersCount$.subscribe((count) => {
      this.membersCount = count;
    });

    //track files count to save
    this.dataStoreService.fileCount$.subscribe((fileID) => {
      if (!this.counted.includes(fileID)) {
        console.log('counted files : ');
        console.log(this.counted);
        this.counted.push(fileID);
        this.filesCount += 1;
      }
    });

    //know when each each file upload is completed
    this.dataStoreService.fileUploadCompleteAnnouncement$.subscribe(
      (fileID) => {
        if (!this.uploaded.includes(fileID)) {
          this.uploaded.push(fileID);
          console.log(fileID + ' done');
          console.log('counted files : ');
          console.log(this.uploaded);
          this.filesCount -= 1;
          console.log(this.filesCount);
          if (this.filesCount == 0) {
            this.saveProgress = 'saved';
            clearTimeout(this.timeoutID);
          }
        }
      }
    );

    this.dataStoreService.fileUploadError$.subscribe((value) => {
      if (value == 'error') this.saveProgress = 'error';
    });

    this.message$.subscribe((message) => {
      this.messages.push(message);
      this.checkAndNotify();
    });
    this.userListService.joinedUser$.subscribe((username) => {
      this.messageSource.next(`${username} joined the room`);
    });

    this.userListService.leftUser$.subscribe((username) => {
      this.messageSource.next(`${username} left the room`);
    });

    this.userListService.newAdmin$.subscribe((admin) => {
      let message;
      if (admin == 'You') message = 'You are now an admin';
      else message = admin + ' is now an admin';
      this.messageSource.next(message);
    });

    //when navigating back to code-editor from repo, it should remain 'leave'
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        let current_path = this.router.url;

        if (current_path == '/code-editor/room-log') {
          let isAdmin = sessionStorage.getItem('isAdmin');
          if (isAdmin && isAdmin == 'true') this.isAdmin = true;
          this.recursiveWrapper();
        }
      }
    });
  }

  //options could go back to normal ('connect') after refresh
  @HostListener('document:DOMContentLoaded', ['$event'])
  handlePageRefresh(event: any) {
    this.toggleConnectOptions();
    let isAdmin = sessionStorage.getItem('isAdmin');
    if (isAdmin && isAdmin == 'true') this.isAdmin = true;
  }

  //recursive function wrapper for toggleConnectOptions on navigation back
  //to code editor so that connectButton is rendered before toggleConnectOptions is called
  recursiveWrapper() {
    setTimeout(() => {
      if (
        !this.connectButton.nativeElement ||
        !this.leaveButton.nativeElement
      ) {
        this.recursiveWrapper();
      } else {
        this.toggleConnectOptions();
      }
    }, 0);
  }

  //to poll the message queue n notify
  checkAndNotify() {
    while (this.messages.length > 0) {
      let msg = this.messages.shift();
      if (msg) {
        this.notification.nativeElement.textContent = msg;
        this.notificationDiv.nativeElement.style.display = 'flex';
        setTimeout(() => {
          this.notificationDiv.nativeElement.style.display = 'none';
        }, 5500);
      }
      this.checkAndNotify();
    }
  }

  logout() {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) {
      sessionStorage.removeItem('roomID');
      this.socketService.leaveRoom(roomID);
    }
    this.authService.logout();
  }

  toggle() {
    //resetting textContent of copy button
    this.copyButton.nativeElement.textContent = 'Copy ID';

    var popup = document.getElementById('popup');
    popup?.classList.toggle('active');

    // If 'copy-id' is present, hide it
    var copy = document.getElementById('copy-id');
    if (copy && copy.classList.contains('dis-flex')) {
      copy.classList.add('dis');
    }

    // If 'join-room' is present, hide it
    var joinRoom = document.getElementById('join-room');
    if (joinRoom && joinRoom.classList.contains('dis-flex')) {
      joinRoom.classList.add('dis');
    }

    setTimeout(() => {
      var buttons = document.getElementById('buttons');
      buttons?.classList.remove('dis');
    }, 500);
  }

  OnCreateRoom() {
    var buttons = document.getElementById('buttons');
    buttons?.classList.add('dis');
    var copy = document.getElementById('copy-id');
    copy?.classList.add('dis-flex');
    //modified
    copy?.classList.remove('dis');

    //calls socket service to create room
    this.createRoom();
  }

  OnJoinRoom() {
    // this.errorDiv.nativeElement.style.display = 'none';
    this.roomIDInput.nativeElement.value = '';
    this.joinProgress = 'initial';
    var buttons = document.getElementById('buttons');
    buttons?.classList.add('dis');
    var joinRoom = document.getElementById('join-room');
    joinRoom?.classList.add('dis-flex');
    //modified
    joinRoom?.classList.remove('dis');
  }

  //to-be-implemented as wanted
  OnLeaveRoom() {
    const roomID = sessionStorage.getItem('roomID');
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (isAdmin) {
      sessionStorage.setItem('isAdmin', 'false');
      this.isAdmin = false;
    }

    if (roomID) {
      sessionStorage.removeItem('roomID');
      this.socketService.leaveRoom(roomID);
    }
    this.toggleConnectOptions();
    window.location.reload();
  }

  //copies roomID to user's clipboard

  async copyID(): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(
          this.roomID.nativeElement.textContent
        );
      } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement('textarea');
        textArea.value = this.roomID.nativeElement.textContent;

        // Move textarea out of the viewport so it's not visible
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';

        document.body.prepend(textArea);
        textArea.select();

        document.execCommand('copy');

        textArea.remove();
      }
      this.copyButton.nativeElement.textContent = 'copied';
    } catch (e) {
      console.log(e);
      alert('error: you have to manually copy');
    }
  }

  //
  toggleConnectOptions() {
    const roomID = sessionStorage.getItem('roomID');
    if (roomID) {
      this.connectButton.nativeElement.style.display = 'none';
      this.leaveButton.nativeElement.style.display = 'block';
    } else {
      this.leaveButton.nativeElement.style.display = 'none';
      this.connectButton.nativeElement.style.display = 'block';
    }
  }

  //admitting the requested socket to created room first
  createRoom() {
    this.roomID.nativeElement.textContent = uuidv4();
    this.socketService.createRoom(this.roomID.nativeElement.textContent);
    //displays leave button
    this.toggleConnectOptions();
  }

  //ask admin to join the room
  askToJoin() {
    this.socketService.askToJoin(
      this.roomIDInput.nativeElement.value,
      (response: { status: boolean }) => {
        if (response.status) {
          //closing popup + displaying leave button

          this.joinProgress = 'waiting';
          // this.toggle();
          // this.toggleConnectOptions();
        } else {
          // this.errorDiv.nativeElement.style.display = 'block'
          this.joinProgress = 'unavailable';
        }
      }
    );
  }
  showJoinReq(someone: string) {
    this.joinRequestDIV.nativeElement.textContent = someone + ' wants to join';
    this.joinRequest.nativeElement.style.display = 'flex';
    this.someone = someone;
  }

  admit() {
    this.joinRequest.nativeElement.style.display = 'none';
    this.socketService.admit(this.someone);
  }

  reject() {
    this.joinRequest.nativeElement.style.display = 'none';
    this.socketService.reject(this.someone);
  }

  //save files test
  saveFiles() {
    this.saveProgress = 'saving';
    this.filesCount = 0;
    this.dataStoreService.queryCount();
    console.log('counted: ' + this.filesCount);
    if (this.filesCount == 0) this.OnLeaveRoom();
    else {
      this.timeoutID = setTimeout(() => {
        this.saveProgress = 'error';
      }, 30000);
      this.dataStoreService.triggerUpload();
    }
  }

  PickOrSaveWrapper(option: string) {
    if (this.membersCount > 1 && (option == 'leave' || option == 'logout')) {
      this.forceToPick(option);
    } else if (this.membersCount == 0 && sessionStorage.getItem('roomID')) {
      this.remindToSave();
    } else {
      if (option == 'leave') this.OnLeaveRoom();
      else if (option == 'logout') this.logout();
      else if (option == 'stop') this.remindToSave();
    }
  }

  forceToPick(option: string) {
    if (this.isAdmin) {
      this.successorWarning.nativeElement.style.display = 'flex';
    } else {
      if (option == 'leave') this.OnLeaveRoom();
      else if (option == 'logout') this.logout();
    }
  }

  closeSuccessorWarning() {
    this.successorWarning.nativeElement.style.display = 'none';
  }

  showMembers() {
    this.successorWarning.nativeElement.style.display = 'none';
    this.router.navigateByUrl('code-editor/view-members');
  }

  remindToSave() {
    this.saveWarning.nativeElement.style.display = 'flex';
  }
  closeSaveWarning() {
    this.saveWarning.nativeElement.style.display = 'none';
  }

  endAbruptly() {
    this.closeSaveWarning();
    this.socketService.endSession();
    this.OnLeaveRoom();
  }

  endProperly() {
    this.socketService.endSession();
    this.saveFiles();
  }

  alertAndLeave() {
    this.sessionEndDiv.nativeElement.style.display = 'flex';
    setTimeout(() => {
      this.sessionEndDiv.nativeElement.style.display = 'none';
      this.OnLeaveRoom();
    }, 4000);
  }

  closeSessionEndDiv() {
    this.sessionEndDiv.nativeElement.style.display = 'none';
    this.OnLeaveRoom();
  }
}
