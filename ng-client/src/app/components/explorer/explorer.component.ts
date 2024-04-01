import { Component } from '@angular/core';
import { FileExplorerService } from 'src/app/file-explorer.service';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.css'],
})
export class ExplorerComponent {
  inputVisibility: boolean = false;
  folders: Array<{ name: string; path: string }> = [
    { name: 'Default', path: 'Default' },
    { name: 'root', path: 'root' },
  ];
  files: Array<{ name: string; path: string }> = [
    { name: 'main.js', path: 'main.js' },
    { name: 'spec.ts', path: 'spec.ts' },
  ];
  createMode: 'folder' | 'file' | null = null;
  selectedFolder: { name: string; path: string } = { name: '', path: '' };
  path: string = '';
  rootSelected: boolean = false;

  @ViewChild('input')
  input: any;
  @ViewChild('root')
  root: any;

  constructor(private explorerService: FileExplorerService) {
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
    } else {
      this.explorerService.toggleFolder(this.selectedFolder);
    }
    this.createMode = 'file';
    this.explorerService.setCreateMode(this.createMode);
  }

  initializeFolderCreation() {
    if (this.isRootFolder()) {
      this.setInputVisibility(true);
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
        this.createFile(this.input.nativeElement.value);
      }

      if (this.createMode == 'folder') {
        this.createFolder(this.input.nativeElement.value);
      }
    }
  }

  createFile(filename: string) {
    if (
      /^[\w,-]+\.[A-Za-z]+$/.test(filename) &&
      !this.includes(this.files, filename)
    ) {
      this.files.push({ name: filename, path: filename });
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
