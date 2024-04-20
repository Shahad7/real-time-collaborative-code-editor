import { Component, Input } from '@angular/core';
import { ViewChild } from '@angular/core';
import { FileExplorerService } from 'src/app/components/explorer/file-explorer.service';
import { DataStoreService } from '../data-store/data-store.service';
import { SocketService } from 'src/app/socket/socket.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css'],
})
export class FolderComponent {
  @Input() foldername: string = '';
  @Input() path: string = '';

  inputVisibility: boolean = false;
  folders: Array<{ name: string; path: string }> = [];
  files: Array<{ name: string; path: string; id: string }> = [];
  createMode: 'folder' | 'file' | null = null;

  @ViewChild('input')
  input: any;
  @ViewChild('folderContents')
  folderContents: any;
  @ViewChild('arrow')
  arrow: any;

  constructor(
    private explorerService: FileExplorerService,
    private socketService: SocketService,
    private dataStoreService: DataStoreService
  ) {
    //to know if clicked outside on sidebar to hide input
    this.explorerService.clickedOutside$.subscribe((value) => {
      if (value == true) {
        this.setInputVisibility(false);
      }
    });

    //toggle the respective folder when it's selected
    this.explorerService.chosenFolder$.subscribe(({ name, path }) => {
      if (this.foldername == name && this.path == path) {
        if (this.arrow.nativeElement.style.transform != 'rotate(90deg)')
          this.toggleFolder();
        this.setInputVisibility(true);
        setTimeout(() => {
          this.input.nativeElement.focus();
        }, 0);
      }
    });

    //respond to setCreateMode
    this.explorerService.createMode$.subscribe((mode) => {
      this.createMode = mode;
    });

    //listen and see if this folder is the one which is being published for new file/folder creation
    this.explorerService.explorerUpdateRelay$.subscribe(
      ({ name, parent, path, mode, id }) => {
        if (this.foldername == parent && this.path == path) {
          if (mode == 'file') {
            this.createFile(name, id);
          } else if (mode == 'folder') this.createFolder(name);
        }
      }
    );

    //publish files count for saving
    this.dataStoreService.fileCountAnnouncement$.subscribe((value) => {
      if (value == 'ready') {
        this.dataStoreService.publishCount(this.files.length);
      }
    });
  }

  toggleFolder(): void {
    if (this.folderContents.nativeElement) {
      this.folderContents.nativeElement.classList.toggle('expanded');
      if (this.arrow.nativeElement) {
        this.arrow.nativeElement.style.transform =
          this.arrow.nativeElement.style.transform == 'rotate(90deg)'
            ? 'rotate(0deg)'
            : 'rotate(90deg)';
      }
    }
  }
  activate(folderDetails: HTMLElement) {
    document.querySelectorAll('.active').forEach((elt) => {
      elt.classList.remove('active');
    });
    if (folderDetails) {
      folderDetails.classList.add('active');
    }
  }

  cancelClosing(e: any): void {
    e.stopPropagation();
  }

  selectFolder() {
    this.explorerService.selectFolder({
      name: this.foldername,
      path: this.path,
    });
  }

  create() {
    if (
      this.input.nativeElement.value != '' ||
      this.input.nativeElement.value.length != 0
    ) {
      if (this.createMode == 'file') {
        this.createFile(this.input.nativeElement.value, null);
      }

      if (this.createMode == 'folder') {
        this.createFolder(this.input.nativeElement.value);
      }
      if (this.createMode == null)
        console.warn('no createMode was set for this operation');
    }
  }

  createFile(filename: string, id: string | null) {
    if (!id) {
      id = uuidv4();
    }
    if (
      /^[\w,-]+\.[A-Za-z]+$/.test(filename) &&
      !this.includes(this.files, filename)
    ) {
      this.files.push({
        name: filename,
        path: `${this.path}/${filename}`,
        id: id,
      });

      //letting other clients know a new file is created
      this.socketService.sendExplorerUpdates(filename, 'file', this.path, id);
      this.setInputVisibility(false);
    } else {
      this.input.nativeElement.style.borderColor = 'red';
    }
  }

  createFolder(foldername: string) {
    if (
      /^[0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\!\-\#\(\)\%\+\~\_ ]+$/.test(
        foldername
      ) &&
      !this.includes(this.folders, foldername)
    ) {
      this.folders.push({
        name: foldername,
        path: `${this.path}/${foldername}`,
      });
      //letting other clients know a new folder is created
      this.socketService.sendExplorerUpdates(
        foldername,
        'folder',
        this.path,
        null
      );

      this.setInputVisibility(false);
    } else {
      this.input.nativeElement.style.borderColor = 'red';
    }
  }

  //checks if the file or folder already exists
  includes(items: Array<{ name: string; path: string }>, itemname: string) {
    let found = false;
    items.forEach((elt) => {
      if (elt.name == itemname) found = true;
    });

    return found;
  }

  resetBorder() {
    this.input.nativeElement.style.borderColor = 'black';
  }

  setInputVisibility(value: boolean) {
    this.inputVisibility = value;
    this.input.nativeElement.value = '';
  }
}
