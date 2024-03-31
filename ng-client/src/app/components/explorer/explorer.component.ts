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
  folders: Array<string> = ['Default', 'root'];
  files: Array<string> = ['main.js', 'spec.ts'];
  createMode: 'folder' | 'file' | null = null;
  selectedFolder: string = '';
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

  initializeFileCreation() {
    if (this.selectedFolder == '') {
      this.setInputVisibility(true);
    } else {
      this.explorerService.toggleFolder(this.selectedFolder);
    }
    this.createMode = 'file';
    this.explorerService.setCreateMode(this.createMode);
  }

  initializeFolderCreation() {
    if (this.selectedFolder == '') {
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
      this.explorerService.selectFolder('');
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
      !this.files.includes(filename)
    ) {
      this.files.push(filename);
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
      !this.folders.includes(foldername)
    ) {
      this.folders.push(foldername);
      this.setInputVisibility(false);
    } else {
      this.input.nativeElement.style.borderColor = 'red';
    }
  }

  resetBorder() {
    this.input.nativeElement.style.borderColor = 'black';
  }

  setInputVisibility(value: boolean) {
    this.inputVisibility = value;
    this.input.nativeElement.value = '';
  }
}
