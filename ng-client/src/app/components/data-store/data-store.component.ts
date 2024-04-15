import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-data-store',
  templateUrl: './data-store.component.html',
  styleUrls: ['./data-store.component.css'],
})
export class DataStoreComponent implements OnInit {
  roomID: string = '';
  constructor(private route: ActivatedRoute, private router: Router) {}

  async fetchData() {
    const response = await fetch(
      `http://${window.location.hostname}:3000/room/${this.roomID}`
    );
    const data = await response.json();
    console.log(data);
  }

  ngOnInit() {
    this.roomID = this.route.snapshot.paramMap.get('roomID')!;
  }
}
