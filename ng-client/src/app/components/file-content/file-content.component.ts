import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-file-content',
  templateUrl: './file-content.component.html',
  styleUrls: ['./file-content.component.css'],
})
export class FileContentComponent implements OnInit {
  fileID: string = '';
  roomID: string = '';
  value: string = '';
  error: boolean = false;
  errorMsg: string = '';
  loading: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  async fetchValue() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/file/${this.fileID}`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomID: this.roomID,
            username: sessionStorage.getItem('username') ?? '',
          }),
        }
      );
      const data = await response.json();
      if (
        response.status == 400 ||
        response.status == 403 ||
        response.status == 404
      ) {
        this.errorMsg = data;
        this.error = true;
      } else {
        this.loading = false;
        this.value = data.value;
      }
    } catch (e) {
      console.log("couldn't fetch file content");
      console.error(e);
    }
  }

  goBack() {
    this.location.back();
  }

  copyValue() {}

  ngOnInit(): void {
    this.fileID = this.route.snapshot.paramMap.get('fileID')!;
    this.roomID = this.route.snapshot.paramMap.get('roomID')!;

    this.fetchValue();
  }
}
