import { Component, OnChanges, OnInit } from '@angular/core';
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
  allFiles: Array<{
    filename: string;
    path: string;
    fileID: { data: Buffer; type: string };
  }> = [];
  files: Array<{
    filename: string;
    path: string;
    fileID: string;
  }> = [];
  folders: Array<{ foldername: string; path: string }> = [];
  currentPWD: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  async fetchData() {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:3000/room/${this.roomID}`,
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
      if (
        response.status == 400 ||
        response.status == 403 ||
        response.status == 404
      ) {
        this.error = true;
        this.errorMsg = data;
      } else {
        data.files.forEach((elt: any) => {
          this.allFiles.push({
            filename: elt.filename,
            path: elt.path,
            fileID: elt.fileID,
          });
        });
        this.displayFiles();
      }
    } catch (e) {
      console.log("couldn't fetch room contents");
      console.error(e);
    }
  }

  setRootFolder(folder_path: string) {
    this.currentPWD = folder_path;
    this.displayFiles();
  }

  //change present working directory to previous
  changePWD() {
    if (!this.currentPWD.includes('/')) this.currentPWD = '';
    else {
      let folders = this.currentPWD.split('/');
      let last_folder = folders[folders.length - 1];
      let new_path = this.currentPWD.replace(`/${last_folder}`, '');
      this.currentPWD = new_path;
    }
    this.displayFiles();
  }

  displayFiles() {
    //clearing current data
    this.files = [];
    this.folders = [];

    //initial case : listing default root folder contents
    if (this.currentPWD == '') {
      this.allFiles.forEach((elt: any) => {
        if (!elt.path.includes('/')) {
          if (
            !this.files.some((file) => {
              return JSON.stringify(file) == JSON.stringify(elt);
            })
          ) {
            this.files.push(elt);
          }
        } else {
          let foldername = elt.path.split('/')[0];
          let folder = { foldername: foldername, path: '' + foldername };
          if (
            !this.folders.some((item) => {
              return JSON.stringify(item) == JSON.stringify(folder);
            })
          ) {
            this.folders.push(folder);
          }
        }
      });
    }
    //when navigating to other folders
    else {
      this.allFiles.forEach((elt: any) => {
        if (elt.path == this.currentPWD + '/' + elt.filename) {
          if (
            !this.files.some((file) => {
              return JSON.stringify(file) == JSON.stringify(elt);
            })
          ) {
            this.files.push(elt);
          }
        } else {
          //shouldn't match a file with the same name as a folder in the path
          //Eg:- models/path.txt == models/path (shouldn't be true)
          if (
            elt.path.startsWith(this.currentPWD) &&
            elt.path[this.currentPWD.length] != '.'
          ) {
            let new_path = elt.path.replace(this.currentPWD + '/', '');
            let foldername = new_path.split('/')[0];
            let folder = {
              foldername: foldername,
              path: this.currentPWD + '/' + foldername,
            };
            if (
              !this.folders.some((item) => {
                return JSON.stringify(item) == JSON.stringify(folder);
              })
            ) {
              this.folders.push(folder);
            }
          }
        }
      });
    }
  }

  ngOnInit() {
    this.roomID = this.route.snapshot.paramMap.get('roomID')!;
    this.fetchData();
  }
}
