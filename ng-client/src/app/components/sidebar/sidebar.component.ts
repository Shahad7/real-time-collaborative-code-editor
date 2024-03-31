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
      e.srcElement.className ==
        'explorer-head-identifier create-btns-identifier' ||
      e.srcElement.className == 'explorer-head' ||
      e.srcElement.className == 'explorer-head active' ||
      e.srcElement.className == 'create-btns'
    ) {
      this.explorerService.alertClick(false);
    } else {
      this.explorerService.alertClick(true);
    }
  }
}
