import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileExplorerService {
  //observable source
  private selectedFileSource = new Subject<{
    name: string;
    path: string;
    id: string;
  }>();
  private selectedFolderSource = new Subject<{ name: string; path: string }>();
  private chosenFolderSource = new Subject<{ name: string; path: string }>();
  private clickedOutsideSource = new Subject<boolean>();
  private createModeSource = new Subject<'folder' | 'file' | null>();
  private explorerUpdateRelaySource = new Subject<{
    name: string;
    path: string;
    parent: string;
    mode: 'file' | 'folder' | null;
    id: string | null;
  }>();

  //observable stream
  selectedFile$ = this.selectedFileSource.asObservable();
  selectedFolder$ = this.selectedFolderSource.asObservable();
  clickedOutside$ = this.clickedOutsideSource.asObservable();
  chosenFolder$ = this.chosenFolderSource.asObservable();
  createMode$ = this.createModeSource.asObservable();
  explorerUpdateRelay$ = this.explorerUpdateRelaySource.asObservable();

  //setting subject using next()
  selectFile(file: { name: string; path: string; id: string }) {
    this.selectedFileSource.next(file);
  }

  //set selected folder
  selectFolder(folder: { name: string; path: string }) {
    this.selectedFolderSource.next(folder);
  }

  //toggle chosen folder
  toggleFolder(folder: { name: string; path: string }) {
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

  //for publishing exact parent folder of new file/folder being created
  relayExplorerUpdate(update: {
    name: string;
    path: string;
    parent: string;
    mode: 'file' | 'folder' | null;
    id: string | null;
  }) {
    this.explorerUpdateRelaySource.next(update);
  }
}
