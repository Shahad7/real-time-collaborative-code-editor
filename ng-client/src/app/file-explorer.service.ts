import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileExplorerService {
  //observable source
  private selectedFileSource = new Subject<string>();
  private clickedOutsideSource = new Subject<boolean>();

  //observable stream
  selectedFile$ = this.selectedFileSource.asObservable();
  clickedOutside$ = this.clickedOutsideSource.asObservable();

  //setting subject using next()
  selectFile(file: string) {
    this.selectedFileSource.next(file);
  }

  //alert click outside to hide input
  alertClick(value: boolean) {
    this.clickedOutsideSource.next(value);
  }
}
