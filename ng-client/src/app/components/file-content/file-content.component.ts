import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-file-content',
  templateUrl: './file-content.component.html',
  styleUrls: ['./file-content.component.css'],
})
export class FileContentComponent implements OnInit {
  fileID: string = '';
  value: string = '';
  constructor(private route: ActivatedRoute, private router: Router) {}

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
            roomID: sessionStorage.getItem('roomID') ?? '',
          }),
        }
      );
      const data = response.json();
    } catch (e) {
      console.log("couldn't fetch file content");
      console.error(e);
    }
  }
  copyValue() {}

  ngOnInit(): void {
    this.fileID = this.route.snapshot.paramMap.get('fileID')!;
    this.fetchValue();
  }
}
