import { Component, Input } from '@angular/core';
import { ViewChild } from '@angular/core';
import { FileExplorerService } from 'src/app/file-explorer.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.css'],
})
export class FolderComponent {
  @Input() foldername: string = '';

  inputVisibility: boolean = false;
  folders: Array<string> = [];
  files: Array<string> = [];
  createMode: 'folder' | 'file' | null = null;

  @ViewChild('input')
  input: any;
  @ViewChild('folderContents')
  folderContents: any;
  @ViewChild('arrow')
  arrow: any;

  constructor(private explorerService: FileExplorerService) {
    //to know if clicked outside on sidebar to hide input
    this.explorerService.clickedOutside$.subscribe((value) => {
      if (value == true) {
        this.setInputVisibility(false);
      }
    });

    //toggle the respective folder when it's selected
    this.explorerService.chosenFolder$.subscribe((foldername) => {
      if (this.foldername == foldername) {
        if (this.arrow.nativeElement.style.transform != 'rotate(90deg)')
          this.toggleFolder();
        this.setInputVisibility(true);
      }
    });

    //respond to serCreateMode
    this.explorerService.createMode$.subscribe((mode) => {
      this.createMode = mode;
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
    this.explorerService.selectFolder(this.foldername);
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
      if (this.createMode == null) alert('oh null');
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
