import { Component } from '@angular/core';
import { FileExplorerService } from 'src/app/file-explorer.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  constructor(private explorerService: FileExplorerService) {}
  alertClick(e: any) {
    if (
      e.srcElement.tagName == 'INPUT' ||
      e.srcElement.className == 'create-btns-identifier'
    ) {
      this.explorerService.alertClick(false);
    } else {
      this.explorerService.alertClick(true);
    }
  }
}
