import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  ParamMap,
  NavigationEnd,
} from '@angular/router';

import { Location } from '@angular/common';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-data-store',
  templateUrl: './data-store.component.html',
  styleUrls: ['./data-store.component.css'],
})
export class DataStoreComponent implements OnInit {
  roomID: string = '';
  error: boolean = false;
  errorMsg: string = '';
  room: {
    roomID: string;
    members: Array<{ username: string; email: string }>;
    date: string;
    time: string;
  } = { roomID: '', members: [], date: '', time: '' };
  allFiles: Array<{
    filename: string;
    path: string;
    fileID: { data: Buffer; type: string };
    value: string;
  }> = [];
  files: Array<{
    filename: string;
    path: string;
    fileID: string;
    value: string;
  }> = [];
  folders: Array<{ foldername: string; path: string }> = [];
  currentPWD: string = '';

  //file-content variables
  fileMode: boolean = false;
  fileID: string = '';
  filePath: string = '';
  fileValue: string = '';
  loading: boolean = true;
  copied: boolean = false;
  @ViewChild('code')
  code: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.roomID = this.route.snapshot.paramMap.get('roomID')!;
    this.fileID = this.route.snapshot.paramMap.get('fileID')!;

    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (!this.fileID) {
          let current_path = this.router.url;

          if (current_path == '/data-store/' + this.roomID) {
            this.currentPWD = '';
          } else {
            let new_path = current_path.replace(
              '/data-store/' + this.roomID + '/',
              ''
            );
            this.currentPWD = new_path;
          }
          this.displayFiles();
        } else {
          this.fileMode = true;
          this.copied = false;
          this.fetchValue();
        }
      }
    });
  }

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
            value: elt.value,
          });
        });
        this.room = { ...data.room };
      }
    } catch (e) {}
    this.displayFiles();
  }

  setRootFolder(folder_path: string) {
    this.currentPWD = folder_path;
    this.router.navigate([...folder_path.split('/')], {
      relativeTo: this.route,
    });
  }

  //change present working directory to previous
  changePWD() {
    if (!this.currentPWD.includes('/')) {
      this.router.navigateByUrl(`/data-store/${this.roomID}`);
    } else {
      let folders = this.currentPWD.split('/');
      let last_folder = folders[folders.length - 1];
      let new_path = this.currentPWD.replace(`/${last_folder}`, '');
      this.router.navigate([...new_path.split('/')], {
        relativeTo: this.route,
      });
    }
  }

  //navigate back to code-editor
  goBackToEditor() {
    this.router.navigateByUrl(`/code-editor/room-log`);
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

  //file-content component functions
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
        this.fileValue = data.value;
        this.filePath = data.path;
      }
    } catch (e) {
      console.log("couldn't fetch file content");
      console.error(e);
    }
  }

  goBack() {
    this.location.back();
  }

  async copyValue(): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(
          this.code.nativeElement.textContent
        );
        this.copied = true;
      } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement('textarea');
        textArea.value = this.code.nativeElement.textContent;

        // Move textarea out of the viewport so it's not visible
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';

        document.body.prepend(textArea);
        textArea.select();

        document.execCommand('copy');
        this.copied = true;

        textArea.remove();
      }
    } catch (e) {
      console.log(e);
      alert('error: you have to manually copy');
    }
  }

  viewFile(fileID: string) {
    this.router.navigate(['file', fileID], {
      relativeTo: this.route,
    });
  }

  download() {
    let zip = new JSZip();
    this.allFiles.forEach((elt) => {
      zip.file(elt.path, elt.value, { createFolders: true });
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      // see FileSaver.js
      FileSaver.saveAs(content, `session-${this.roomID.substring(0, 5)}-data`);
    });
  }
}
