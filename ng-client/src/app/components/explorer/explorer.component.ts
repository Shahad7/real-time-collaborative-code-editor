import { Component } from '@angular/core';
import { FileExplorerService } from 'src/app/file-explorer.service';
@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.css'],
})
export class ExplorerComponent {
  inputVisibility: boolean = false;

  constructor(private explorerService: FileExplorerService) {
    this.explorerService.clickedOutside$.subscribe((value) => {
      if (value == true) {
        this.setInputVisibility(false);
      }
    });
  }

  setInputVisibility(value: boolean) {
    this.inputVisibility = value;
  }
}
