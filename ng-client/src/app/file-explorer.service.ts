import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileExplorerService {
  //observable source
  private selectedFileSource = new Subject<string>();

  //observable stream
  selectedFile$ = this.selectedFileSource.asObservable();

  //setting subject using next()
  selectFile(file: string) {
    this.selectedFileSource.next(file);
  }
}
