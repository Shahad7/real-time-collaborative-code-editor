import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-room-log',
  templateUrl: './room-log.component.html',
  styleUrls: ['./room-log.component.css'],
})
export class RoomLogComponent implements OnInit {
  rooms: Array<{ roomID: string; date: string; time: string }> = [];
  loading: boolean = false;
  constructor() {}

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

  ngOnInit(): void {
    this.fetchAllRoomDetails();
  }
}
