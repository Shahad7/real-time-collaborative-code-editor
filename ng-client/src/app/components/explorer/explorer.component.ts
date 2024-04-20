import { Component } from '@angular/core';
import { FileExplorerService } from 'src/app/components/explorer/file-explorer.service';
import { ViewChild } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { SocketService } from 'src/app/socket/socket.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.css'],
})
export class ExplorerComponent {
  inputVisibility: boolean = false;
  folders: Array<{ name: string; path: string }> = [
    // { name: 'Default', path: 'Default' },
    // { name: 'root', path: 'root' },
  ];
  files: Array<{ name: string; path: string; id: string }> = [
    // { name: 'main.js', path: 'main.js' },
    // { name: 'spec.ts', path: 'spec.ts' },
  ];
  createMode: 'folder' | 'file' | null = null;
  selectedFolder: { name: string; path: string } = { name: '', path: '' };
  path: string = '';
  rootSelected: boolean = false;

  @ViewChild('input')
  input: any;
  @ViewChild('root')
  root: any;

  constructor(
    private explorerService: FileExplorerService,
    private socketService: SocketService,
    private dataStoreService: DataStoreService
  ) {
    this.explorerService.clickedOutside$.subscribe((value) => {
      if (value == true) {
        this.setInputVisibility(false);
      }
    });

    this.explorerService.selectedFolder$.subscribe((folder) => {
      this.selectedFolder = folder;
    });

    this.explorerService.clickedOutside$.subscribe((value) => {
      if (value) {
        this.rootSelected = false;
      }
    });
    //publish files count for saving
    this.dataStoreService.fileCountAnnouncement$.subscribe((value) => {
      if (value == 'ready') {
        this.dataStoreService.publishCount(this.files.length);
      }
    });

    //receiving explorer updates from other clients
    this.socketService.socket.on(
      'receive-explorer-updates',
      (name, mode, path, id) => {
        if (path == '') {
          if (mode == 'file') this.createFile(name, id);
          else if (mode == 'folder') this.createFolder(name);
        } else {
          let extracts = path.split('/');
          let parent = extracts.pop();
          this.explorerService.relayExplorerUpdate({
            name: name,
            parent: parent,
            path: path,
            mode: mode,
            id: id,
          });
        }
      }
    );
  }

  activateRoot() {
    this.rootSelected = !this.rootSelected;
  }

  isRootFolder() {
    return this.selectedFolder.name == '' && this.selectedFolder.path == '';
  }

  initializeFileCreation() {
    if (this.isRootFolder()) {
      this.setInputVisibility(true);
      setTimeout(() => {
        this.input.nativeElement.focus();
      }, 0);
    } else {
      this.explorerService.toggleFolder(this.selectedFolder);
    }
    this.createMode = 'file';
    this.explorerService.setCreateMode(this.createMode);
  }

  initializeFolderCreation() {
    if (this.isRootFolder()) {
      this.setInputVisibility(true);
      setTimeout(() => {
        this.input.nativeElement.focus();
      }, 0);
    } else {
      this.explorerService.toggleFolder(this.selectedFolder);
    }
    this.createMode = 'folder';
    this.explorerService.setCreateMode(this.createMode);
  }

  selectRootFolder(e: any) {
    if (!e.srcElement.classList.contains('create-btns-identifier')) {
      this.explorerService.alertClick(true);
      this.explorerService.selectFolder({ name: '', path: '' });
    }

    document.querySelectorAll('.active').forEach((elt) => {
      elt.classList.remove('active');
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
      this.files.push({ name: filename, path: filename, id: id });

      //letting other clients know a new file is created
      this.socketService.sendExplorerUpdates(filename, 'file', '', id);
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
      this.folders.push({ name: foldername, path: foldername });
      //letting other clients know a new folder is created
      this.socketService.sendExplorerUpdates(foldername, 'folder', '', null);
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
    this.resetBorder();
  }
}
