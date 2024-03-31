import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileExplorerService {
  //observable source
  private selectedFileSource = new Subject<string>();
  private selectedFolderSource = new Subject<string>();
  private chosenFolderSource = new Subject<string>();
  private clickedOutsideSource = new Subject<boolean>();
  private createModeSource = new Subject<'folder' | 'file' | null>();

  //observable stream
  selectedFile$ = this.selectedFileSource.asObservable();
  selectedFolder$ = this.selectedFolderSource.asObservable();
  clickedOutside$ = this.clickedOutsideSource.asObservable();
  chosenFolder$ = this.chosenFolderSource.asObservable();
  createMode$ = this.createModeSource.asObservable();

  //setting subject using next()
  selectFile(file: string) {
    this.selectedFileSource.next(file);
  }

  //set selected folder
  selectFolder(folder: string) {
    this.selectedFolderSource.next(folder);
  }

  //toggle chosen folder
  toggleFolder(folder: string) {
    this.chosenFolderSource.next(folder);
  }

  //alert click outside to hide input
  alertClick(value: boolean) {
    this.clickedOutsideSource.next(value);
  }

  //setting create mode
  setCreateMode(mode: 'folder' | 'file' | null) {
    this.createModeSource.next(mode);
  }
}
