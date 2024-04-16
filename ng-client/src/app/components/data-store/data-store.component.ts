import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-data-store',
  templateUrl: './data-store.component.html',
  styleUrls: ['./data-store.component.css'],
})
export class DataStoreComponent implements OnInit {
  roomID: string = '';
  error: boolean = false;
  errorMsg: string = '';
  files: Array<{ filename: string; path: string }> = [];
  constructor(private route: ActivatedRoute, private router: Router) {}

  async fetchData() {
    const response = await fetch(
      `http://${window.location.hostname}:3000/room/${this.roomID}`
    );

    const data = await response.json();
    if (response.status == 400) {
      this.error = true;
      this.errorMsg = data;
    } else {
      data.files.forEach((elt: any) => {
        this.files.push({ filename: elt.filename, path: elt.path });
      });
    }
  }

  ngOnInit() {
    this.roomID = this.route.snapshot.paramMap.get('roomID')!;
    this.fetchData();
  }
}
