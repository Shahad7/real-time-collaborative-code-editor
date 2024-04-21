import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-room-log',
  templateUrl: './room-log.component.html',
  styleUrls: ['./room-log.component.css'],
})
export class RoomLogComponent implements OnInit {
  rooms: Array<{ roomID: string; date: string; time: string }> = [];
  loading: boolean = false;
  constructor(
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    private sidebarService: SidebarService
  ) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        let current_path = this.router.url;

        if (current_path.startsWith('/code-editor')) {
          let option = current_path.split('/')[2];

          if (option && option == 'room-log' && this.loading)
            this.fetchAllRoomDetails();
        }
      }
    });
  }

  async fetchAllRoomDetails() {
    try {
      this.loading = true;
      const response = await fetch(
        `http://${window.location.hostname}:3000/room/all-rooms`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: sessionStorage.getItem('username') ?? '',
          }),
        }
      );
      const data = await response.json();
      data.rooms.forEach((elt: any) => {
        this.rooms.push({ roomID: elt.roomID, date: elt.date, time: elt.time });
      });
      this.loading = false;
    } catch (e) {
      console.log("couldn't room details : room log");
      console.error(e);
    }
  }

  navigateToRoom(roomID: string) {
    this.sidebarService.alertDeparture();
    this.router.navigateByUrl(`/data-store/${roomID}`);
  }

  ngOnInit(): void {
    this.fetchAllRoomDetails();
  }
}
